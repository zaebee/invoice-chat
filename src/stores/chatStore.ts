import { create } from 'zustand';
import { ChatSession, ChatMessage, LeaseData, INITIAL_LEASE, NtfyAction } from '../types';
import { fetchReservationHistory, fetchNtfyMessages, sendNtfyMessage, sendNtfyImage, loadLeaseData, getGlobalChatSseUrl } from '../services/ownimaApi';
import { dbService } from '../services/dbService';
import { ntfyToChatMessage, historyToChatMessage } from '../services/chatMappers';
import { analyzeChatIntent } from '../services/geminiService';

// --- STORE DEFINITION ---

interface ChatState {
    sessions: ChatSession[];
    isHydrated: boolean;
    activeSessionId: string | null;
    isLoading: boolean;
    error: string | null;
    leaseContext: LeaseData | null; // Store the lease data associated with current chat
    globalEventSource: EventSource | null; // SINGLE Global SSE connection
    currentLoadToken: number; // To prevent race conditions
    abortController: AbortController | null; // To cancel pending fetch requests
    
    // Reconnection State
    reconnectTimeoutId: number | null;
    retryCount: number;

    // AI Suggestions
    aiSuggestion: { action: 'confirm' | 'reject' | 'collect' | 'complete'; reason: string } | null;
    
    // Actions
    hydrate: () => Promise<void>;
    connectGlobalListener: () => void; // New Action
    createLocalSession: (customId: string) => Promise<void>;
    loadChatSession: (reservationId: string) => Promise<void>;
    analyzeIntent: () => Promise<void>;
    setActiveSession: (id: string) => void;
    sendMessage: (text: string, tags?: string[], actions?: NtfyAction[]) => Promise<void>;
    sendImage: (file: File) => Promise<void>;
    getActiveSession: () => ChatSession | undefined;
    confirmReservation: () => Promise<void>;
    rejectReservation: () => Promise<void>;
    collectReservation: () => Promise<void>;
    completeReservation: () => Promise<void>;
    restartReservation: () => Promise<void>;
    markAsRead: (sessionId: string) => void;
    markAsUnread: (sessionId: string) => void;
    markMessageAsRead: (sessionId: string, messageId: string) => void;
    clearAiSuggestion: () => void;
    setupBackgroundSync: () => void;
    archiveSession: (sessionId: string) => void;
    deleteSession: (sessionId: string) => Promise<void>;
    disconnect: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    sessions: [],
    isHydrated: false,
    activeSessionId: null,
    isLoading: false,
    error: null,
    leaseContext: null,
    globalEventSource: null,
    currentLoadToken: 0,
    abortController: null,
    aiSuggestion: null,
    
    reconnectTimeoutId: null,
    retryCount: 0,

    hydrate: async () => {
        if (get().isHydrated) return;
        
        // Setup listeners once on hydration
        get().setupBackgroundSync();

        try {
            const storedSessions = await dbService.getAllSessions();
            set({ sessions: storedSessions, isHydrated: true });
            
            // Connect global listener after loading stored sessions
            get().connectGlobalListener();
        } catch (e) {
            console.error("Hydration failed", e);
            set({ isHydrated: true });
        }
    },

    // Manages the SINGLE global SSE connection for ALL chats
    connectGlobalListener: () => {
        const { sessions, globalEventSource, reconnectTimeoutId } = get();
        
        // 1. Cleanup existing connection and pending retries
        if (globalEventSource) {
            globalEventSource.close();
        }
        if (reconnectTimeoutId) {
            clearTimeout(reconnectTimeoutId);
            set({ reconnectTimeoutId: null });
        }

        // 2. Identify topics (exclude archived or old?)
        // For now, subscribe to all local sessions to ensure updates
        if (sessions.length === 0) return;

        // Limit to 40 most recent to prevent URL overflow, though Ntfy handles long URLs reasonably well
        const recentSessions = [...sessions]
            .sort((a, b) => b.lastMessageTime - a.lastMessageTime)
            .slice(0, 40);
            
        const topicIds = recentSessions.map(s => s.id);
        
        if (topicIds.length === 0) return;

        try {
            const sseUrl = getGlobalChatSseUrl(topicIds);
            const currentRetry = get().retryCount;
            console.debug(`Connecting Global SSE for ${topicIds.length} topics. Attempt ${currentRetry + 1}`);
            
            const eventSource = new EventSource(sseUrl);

            eventSource.onopen = () => {
                console.debug("Global SSE Connected");
                // Reset retry count on successful connection
                set({ retryCount: 0, globalEventSource: eventSource });
            };

            eventSource.onmessage = (event) => {
                try {
                    const ntfyMsg = JSON.parse(event.data);
                    if (ntfyMsg.event !== 'message') return;

                    // Ntfy returns the topic name (e.g. 'chat-123')
                    // We need to strip 'chat-' to get our session ID
                    const rawTopic = ntfyMsg.topic;
                    const sessionId = rawTopic.replace(/^chat-/, '');

                    // Determine if this is the active session
                    const isActive = get().activeSessionId === sessionId;
                    
                    // Mark as 'sent' (unread) by default, unless active (UI might mark read via Observer)
                    const status = 'sent';

                    const chatMsg = ntfyToChatMessage(ntfyMsg, status);

                    set(state => {
                        const sessionIndex = state.sessions.findIndex(s => s.id === sessionId);
                        
                        // If we received a message for a session we don't have locally, 
                        // we technically should fetch it, but for now ignore or create placeholder
                        if (sessionIndex === -1) return {};

                        const session = state.sessions[sessionIndex];
                        // Deduplicate
                        if (session.messages.some(m => m.id === chatMsg.id)) return {};

                        const updatedMessages = [...session.messages, chatMsg];
                        
                        const isIncoming = chatMsg.senderId !== 'me' && chatMsg.senderId !== 'system';
                        
                        // Increment unread count only if incoming message
                        // If user is active on this chat, the IntersectionObserver in UI will mark it read instantly
                        // But for store state, we increment first.
                        const newUnreadCount = isIncoming ? (session.unreadCount || 0) + 1 : (session.unreadCount || 0);

                        const updatedSession = {
                            ...session,
                            messages: updatedMessages,
                            lastMessage: chatMsg.type === 'image' ? 'Image Attachment' : chatMsg.text,
                            lastMessageTime: chatMsg.timestamp,
                            unreadCount: newUnreadCount
                        };
                        
                        const newSessions = [...state.sessions];
                        newSessions[sessionIndex] = updatedSession;
                        
                        dbService.saveSession(updatedSession);
                        
                        // If this was the active session, trigger AI check
                        if (isActive && isIncoming) {
                            // Defer AI analysis slightly
                            setTimeout(() => get().analyzeIntent(), 500);
                        }
                        
                        return { sessions: newSessions };
                    });

                } catch (e) {
                    console.error("Global SSE Parse Error", e);
                }
            };

            eventSource.onerror = () => {
                console.warn("Global SSE Connection Lost");
                eventSource.close();
                set({ globalEventSource: null });

                // Exponential Backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
                const currentRetries = get().retryCount;
                const nextRetryCount = currentRetries + 1;
                const delay = Math.min(1000 * Math.pow(2, currentRetries), 30000);
                
                console.log(`Reconnecting in ${delay}ms...`);
                
                const timeoutId = window.setTimeout(() => {
                    set({ reconnectTimeoutId: null });
                    get().connectGlobalListener();
                }, delay);

                set({ 
                    reconnectTimeoutId: timeoutId, 
                    retryCount: nextRetryCount 
                });
            };

            // Set initially (will be updated on open/error)
            set({ globalEventSource: eventSource });

        } catch (e) {
            console.error("Failed to init Global SSE", e);
            // Fallback retry
            const timeoutId = window.setTimeout(() => {
                set({ reconnectTimeoutId: null });
                get().connectGlobalListener();
            }, 5000);
            set({ reconnectTimeoutId: timeoutId });
        }
    },

    setupBackgroundSync: () => {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                const { globalEventSource } = get();
                // If disconnected, force immediate reconnect (resetting backoff)
                if (!globalEventSource || globalEventSource.readyState === EventSource.CLOSED) {
                    console.debug("App visible: Reconnecting Global Chat...");
                    set({ retryCount: 0 }); // Reset retries to try immediately
                    get().connectGlobalListener();
                }
            }
        });

        window.addEventListener('online', () => {
             console.debug("Network online: Syncing...");
             set({ retryCount: 0 }); // Reset retries
             get().connectGlobalListener();
        });
    },

    disconnect: () => {
        const { globalEventSource, abortController, reconnectTimeoutId } = get();
        if (globalEventSource) {
            console.debug("Disconnecting Global SSE...");
            globalEventSource.close();
        }
        if (reconnectTimeoutId) {
            clearTimeout(reconnectTimeoutId);
        }
        if (abortController) {
            abortController.abort();
        }
        set({ 
            globalEventSource: null, 
            abortController: null, 
            aiSuggestion: null,
            reconnectTimeoutId: null,
            retryCount: 0
        });
    },

    createLocalSession: async (customId: string) => {
        const { sessions } = get();
        if (sessions.find(s => s.id === customId)) {
            set({ activeSessionId: customId, error: null });
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const newLease: LeaseData = {
            ...INITIAL_LEASE,
            reservationId: customId,
            source: 'LOCAL_DRAFT',
            createdDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
            pickup: { ...INITIAL_LEASE.pickup, date: today },
            dropoff: { ...INITIAL_LEASE.dropoff, date: today }
        };

        const newSession: ChatSession = {
            id: customId,
            user: {
                id: 'new_renter',
                name: 'New Renter',
                role: 'Renter',
                status: 'online',
                avatar: ''
            },
            messages: [],
            lastMessage: 'Draft created',
            lastMessageTime: Date.now(),
            unreadCount: 0,
            reservationSummary: {
                vehicleName: 'New Booking',
                plateNumber: 'TBD',
                status: 'pending',
                price: 0,
                currency: 'THB',
                pickupDate: today,
                dropoffDate: today
            }
        };

        await dbService.saveSession(newSession);
        
        set(state => ({
            sessions: [newSession, ...state.sessions],
            activeSessionId: customId,
            leaseContext: newLease,
            error: null,
            isLoading: false
        }));

        // Reconnect global listener to include new session
        get().connectGlobalListener();
    },

    loadChatSession: async (reservationId: string) => {
        if (!get().isHydrated) await get().hydrate();

        const { abortController, sessions } = get();
        if (abortController) abortController.abort();
        
        const controller = new AbortController();
        const signal = controller.signal;
        const myToken = Math.random();

        set({ 
            abortController: controller,
            currentLoadToken: myToken,
            activeSessionId: reservationId, 
            isLoading: !sessions.find(s => s.id === reservationId), 
            error: null,
            aiSuggestion: null 
        });

        try {
            // 1. Fetch Static Data (Lease + History + Log)
            // We do NOT open a specific SSE here anymore. The Global Listener handles updates.
            
            const leaseData = await loadLeaseData(reservationId, signal);
            if (get().currentLoadToken !== myToken) return;
            set({ leaseContext: leaseData });

            const historyEvents = await fetchReservationHistory(leaseData.id || reservationId, signal);
            if (get().currentLoadToken !== myToken) return;

            const topicId = leaseData.id || reservationId;
            const ntfyData = await fetchNtfyMessages(topicId, signal);
            if (get().currentLoadToken !== myToken) return;

            const existingSession = sessions.find(s => s.id === reservationId);
            const localMsgMap = new Map<string, ChatMessage>(
                (existingSession?.messages || []).map(m => [m.id, m] as [string, ChatMessage])
            );

            const createdTime = leaseData.createdDate ? new Date(leaseData.createdDate).getTime() : Date.now();
            const summaryMessage: ChatMessage = {
                id: `sys_summary_${leaseData.reservationId}`,
                senderId: 'system',
                text: `Reservation Details\n📅 ${leaseData.pickup.date} -> ${leaseData.dropoff.date}\n💰 ${leaseData.pricing.total.toLocaleString()} ${leaseData.pricing.currency || 'THB'}`,
                timestamp: createdTime - 1,
                type: 'system',
                status: 'read'
            };

            const allMessages = [
                summaryMessage,
                ...historyEvents.map(h => historyToChatMessage(h)),
                ...ntfyData.map((n: any) => {
                    const local = localMsgMap.get(n.id);
                    const status = local ? local.status : 'read'; // Assume fetched history is read unless locally pending
                    return ntfyToChatMessage(n, status);
                })
            ];
            
            allMessages.sort((a, b) => a.timestamp - b.timestamp);
            const unreadCount = allMessages.filter(m => m.senderId !== 'me' && m.senderId !== 'system' && m.status === 'sent').length;

            const newSession: ChatSession = {
                id: topicId,
                user: {
                    id: leaseData.renter.surname,
                    name: leaseData.renter.surname || 'Renter',
                    contact: leaseData.renter.contact,
                    role: 'Renter',
                    status: 'online',
                    avatar: leaseData.renter.avatar || ''
                },
                messages: allMessages,
                lastMessage: allMessages.length > 0 ? (allMessages[allMessages.length - 1].type === 'image' ? 'Image Attachment' : allMessages[allMessages.length - 1].text) : 'No messages',
                lastMessageTime: allMessages.length > 0 ? allMessages[allMessages.length - 1].timestamp : 0,
                unreadCount: unreadCount,
                isArchived: existingSession?.isArchived || false,
                reservationSummary: {
                    vehicleName: leaseData.vehicle.name,
                    plateNumber: leaseData.vehicle.plate,
                    vehicleImageUrl: leaseData.vehicle.imageUrl,
                    status: leaseData.status || 'pending',
                    price: leaseData.pricing.total,
                    currency: leaseData.pricing.currency || 'THB',
                    deadline: leaseData.deadline,
                    pickupDate: leaseData.pickup.date,
                    dropoffDate: leaseData.dropoff.date,
                    exactPickupDate: leaseData.exactPickupDate,
                    exactDropoffDate: leaseData.exactDropoffDate
                }
            };

            set(state => {
                if (state.currentLoadToken !== myToken) return {};
                const existingIdx = state.sessions.findIndex(s => s.id === topicId);
                let newSessions = [...state.sessions];
                if (existingIdx >= 0) {
                    newSessions[existingIdx] = newSession;
                } else {
                    newSessions.push(newSession);
                }
                return {
                    sessions: newSessions,
                    activeSessionId: topicId,
                    isLoading: false
                };
            });
            
            await dbService.saveSession(newSession);

            // If we just added a new session that wasn't in the global subscription list, update subscription
            if (!existingSession) {
                get().connectGlobalListener();
            }

            // Initial AI Check
            if (newSession.messages.length > 0) {
                const lastMsg = newSession.messages[newSession.messages.length - 1];
                if (lastMsg.senderId !== 'me' && lastMsg.senderId !== 'system') {
                    get().analyzeIntent();
                }
            }

        } catch (e: any) {
            if (e.name === 'AbortError') return;
            console.error("Load Chat Error", e);
            if (get().currentLoadToken === myToken) {
                const localSession = get().sessions.find(s => s.id === reservationId);
                if (localSession) {
                    set({ 
                        isLoading: false, 
                        error: null,
                        leaseContext: {
                            ...INITIAL_LEASE,
                            reservationId,
                            status: localSession.reservationSummary?.status,
                            vehicle: {
                                ...INITIAL_LEASE.vehicle,
                                name: localSession.reservationSummary?.vehicleName || '',
                                plate: localSession.reservationSummary?.plateNumber || '',
                                imageUrl: localSession.reservationSummary?.vehicleImageUrl
                            }
                        }
                    });
                } else {
                    set({ isLoading: false, error: e.message || "Failed to load chat" });
                }
            }
        }
    },

    analyzeIntent: async () => {
        const { activeSessionId, sessions, leaseContext } = get();
        if (!activeSessionId || !leaseContext) return;

        const session = sessions.find(s => s.id === activeSessionId);
        if (!session || session.messages.length === 0) return;

        const lastMsg = session.messages[session.messages.length - 1];
        if (lastMsg.senderId === 'me' || lastMsg.senderId === 'system') {
            set({ aiSuggestion: null });
            return;
        }

        const suggestion = await analyzeChatIntent(session.messages, leaseContext.status || 'pending');
        
        if (suggestion) {
            console.log("AI Suggestion:", suggestion);
            set({ aiSuggestion: suggestion });
        } else {
            set({ aiSuggestion: null });
        }
    },

    clearAiSuggestion: () => {
        set({ aiSuggestion: null });
    },

    setActiveSession: (id: string) => {
        set({ activeSessionId: id, aiSuggestion: null });
    },

    archiveSession: (sessionId: string) => {
        set(state => {
            const session = state.sessions.find(s => s.id === sessionId);
            if (!session) return {};

            const updatedSession = { ...session, isArchived: !session.isArchived }; 
            const newSessions = state.sessions.map(s => s.id === sessionId ? updatedSession : s);

            dbService.saveSession(updatedSession);
            return { sessions: newSessions };
        });
    },

    deleteSession: async (sessionId: string) => {
        set(state => {
            const newSessions = state.sessions.filter(s => s.id !== sessionId);
            const newActive = state.activeSessionId === sessionId ? null : state.activeSessionId;
            dbService.deleteSession(sessionId);
            return { sessions: newSessions, activeSessionId: newActive };
        });
        // Update subscription list
        get().connectGlobalListener();
    },

    markAsRead: (sessionId: string) => {
        set(state => {
            const sessionIdx = state.sessions.findIndex(s => s.id === sessionId);
            if (sessionIdx === -1) return {};
            const session = state.sessions[sessionIdx];
            const newMessages = session.messages.map(m => ({ ...m, status: 'read' as const }));
            const newSession = { ...session, messages: newMessages, unreadCount: 0 };
            const newSessions = [...state.sessions];
            newSessions[sessionIdx] = newSession;
            dbService.saveSession(newSession);
            return { sessions: newSessions };
        });
    },

    markAsUnread: (sessionId: string) => {
        set(state => {
            const sessionIdx = state.sessions.findIndex(s => s.id === sessionId);
            if (sessionIdx === -1) return {};
            const session = state.sessions[sessionIdx];
            const newSession = { ...session, unreadCount: 1 };
            const newSessions = [...state.sessions];
            newSessions[sessionIdx] = newSession;
            dbService.saveSession(newSession);
            return { sessions: newSessions };
        });
    },

    markMessageAsRead: (sessionId: string, messageId: string) => {
        set(state => {
            const sessionIdx = state.sessions.findIndex(s => s.id === sessionId);
            if (sessionIdx === -1) return {};
            const session = state.sessions[sessionIdx];
            const msgIdx = session.messages.findIndex(m => m.id === messageId);
            if (msgIdx === -1 || session.messages[msgIdx].status === 'read') return {};
            const newMessages = [...session.messages];
            newMessages[msgIdx] = { ...newMessages[msgIdx], status: 'read' };
            const newUnreadCount = Math.max(0, session.unreadCount - 1);
            const newSession = { ...session, messages: newMessages, unreadCount: newUnreadCount };
            const newSessions = [...state.sessions];
            newSessions[sessionIdx] = newSession;
            dbService.saveSession(newSession);
            return { sessions: newSessions };
        });
    },

    sendMessage: async (text: string, tags: string[] = [], actions: NtfyAction[] = []) => {
        const { activeSessionId, sessions } = get();
        if (!activeSessionId || !text.trim()) return;

        const tempId = Math.random().toString();
        const now = Date.now();
        const newMsg: ChatMessage = {
            id: tempId,
            senderId: 'me',
            text: text,
            timestamp: now,
            type: 'text',
            status: 'sent',
            tags,
            actions
        };

        let updatedSession: ChatSession | undefined;
        const updatedSessions = sessions.map(session => {
            if (session.id === activeSessionId) {
                updatedSession = {
                    ...session,
                    messages: [...session.messages, newMsg],
                    lastMessage: text,
                    lastMessageTime: now
                };
                return updatedSession;
            }
            return session;
        });

        set({ sessions: updatedSessions, aiSuggestion: null });
        if (updatedSession) await dbService.saveSession(updatedSession);

        try {
            await sendNtfyMessage(activeSessionId, text, { tags, actions });
        } catch (e) {
            console.error("Failed to send message", e);
        }
    },

    sendImage: async (file: File) => {
        const { activeSessionId, sessions } = get();
        if (!activeSessionId || !file) return;

        const tempId = Math.random().toString();
        const now = Date.now();
        const blobUrl = URL.createObjectURL(file);
        
        const newMsg: ChatMessage = {
            id: tempId,
            senderId: 'me',
            text: file.name,
            timestamp: now,
            type: 'image',
            status: 'sent',
            attachmentUrl: blobUrl
        };

        let updatedSession: ChatSession | undefined;
        const updatedSessions = sessions.map(session => {
            if (session.id === activeSessionId) {
                updatedSession = {
                    ...session,
                    messages: [...session.messages, newMsg],
                    lastMessage: 'Image Attachment',
                    lastMessageTime: now
                };
                return updatedSession;
            }
            return session;
        });

        set({ sessions: updatedSessions, aiSuggestion: null });
        if (updatedSession) await dbService.saveSession(updatedSession);

        try {
            await sendNtfyImage(activeSessionId, file);
        } catch (e) {
            console.error("Failed to send image", e);
        }
    },

    getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find(s => s.id === activeSessionId);
    },

    confirmReservation: async () => {
        const { sendMessage, leaseContext } = get();
        if (!leaseContext) return;
        set(state => ({
            leaseContext: state.leaseContext ? { ...state.leaseContext, status: 'confirmed' } : null,
            aiSuggestion: null
        }));
        await sendMessage("✅ Reservation confirmed", ['white_check_mark', 'status:confirmed'], [
            { action: 'view', label: 'Open Booking', url: window.location.href }
        ]);
    },

    rejectReservation: async () => {
         const { sendMessage, leaseContext } = get();
        if (!leaseContext) return;
        set(state => ({
            leaseContext: state.leaseContext ? { ...state.leaseContext, status: 'rejected' } : null,
            aiSuggestion: null
        }));
        await sendMessage("❌ Reservation rejected", ['x', 'status:rejected'], [
            { action: 'view', label: 'View Details', url: window.location.href }
        ]);
    },

    collectReservation: async () => {
        const { sendMessage, leaseContext } = get();
        if (!leaseContext) return;
        set(state => ({
            leaseContext: state.leaseContext ? { ...state.leaseContext, status: 'collected' } : null,
            aiSuggestion: null
        }));
        await sendMessage("🔑 Vehicle collected", ['key', 'status:collected'], [
            { action: 'view', label: 'Track', url: window.location.href }
        ]);
    },

    completeReservation: async () => {
        const { sendMessage, leaseContext } = get();
        if (!leaseContext) return;
        set(state => ({
            leaseContext: state.leaseContext ? { ...state.leaseContext, status: 'completed' } : null,
            aiSuggestion: null
        }));
        await sendMessage("🏁 Lease completed", ['checkered_flag', 'status:completed'], [
            { action: 'view', label: 'View Receipt', url: window.location.href }
        ]);
    },

    restartReservation: async () => {
        const { sendMessage, leaseContext } = get();
        if (!leaseContext) return;
        set(state => ({
            leaseContext: state.leaseContext ? { ...state.leaseContext, status: 'pending' } : null,
            aiSuggestion: null
        }));
        await sendMessage("🔄 Reservation restarted", ['refresh', 'status:pending'], [
            { action: 'view', label: 'View Booking', url: window.location.href }
        ]);
    }
}));