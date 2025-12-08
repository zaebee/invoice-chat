
import { create } from 'zustand';
import { ChatSession, ChatMessage } from '../types';
import { fetchNtfyMessages, sendNtfyMessage, sendNtfyImage, getChatSseUrl } from '../services/ownimaApi';
import { dbService } from '../services/dbService';
import { ntfyToChatMessage } from '../services/chatMappers';
import { useUiStore } from './uiStore'; // Import the uiStore

interface ChatState {
    sessions: ChatSession[];
    isHydrated: boolean;
    activeEventSource: EventSource | null;
    hydrate: () => Promise<void>;
    loadMessagesForSession: (sessionId: string) => Promise<void>;
    sendMessage: (text: string) => Promise<void>;
    sendImage: (file: File) => Promise<void>;
    disconnect: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    sessions: [],
    isHydrated: false,
    activeEventSource: null,

    hydrate: async () => {
        if (get().isHydrated) return;
        const storedSessions = await dbService.getAllSessions();
        set({ sessions: storedSessions, isHydrated: true });
    },

    disconnect: () => {
        get().activeEventSource?.close();
        set({ activeEventSource: null });
    },

    loadMessagesForSession: async (sessionId: string) => {
        get().disconnect(); // Disconnect from any previous session

        const ntfyData = await fetchNtfyMessages(sessionId);
        const messages = ntfyData.map((n: any) => ntfyToChatMessage(n, 'read'));
        messages.sort((a, b) => a.timestamp - b.timestamp);
        
        set(state => {
            const sessionIndex = state.sessions.findIndex(s => s.id === sessionId);
            if (sessionIndex === -1) return {};

            const updatedSession = { ...state.sessions[sessionIndex], messages };
            const newSessions = [...state.sessions];
            newSessions[sessionIndex] = updatedSession;
            
            dbService.saveSession(updatedSession);
            return { sessions: newSessions };
        });

        // Establish SSE Connection
        const eventSource = new EventSource(getChatSseUrl(sessionId));
        eventSource.onmessage = (event) => {
            const ntfyMsg = JSON.parse(event.data);
            if (ntfyMsg.event !== 'message') return;
            const chatMsg = ntfyToChatMessage(ntfyMsg, 'sent');
            
            set(state => {
                const sessionIndex = state.sessions.findIndex(s => s.id === sessionId);
                if (sessionIndex === -1) return {};
                const session = state.sessions[sessionIndex];
                const updatedMessages = [...session.messages, chatMsg];
                const updatedSession = { ...session, messages: updatedMessages, lastMessage: chatMsg.text, lastMessageTime: chatMsg.timestamp };
                const newSessions = [...state.sessions];
                newSessions[sessionIndex] = updatedSession;
                dbService.saveSession(updatedSession);
                return { sessions: newSessions };
            });
        };
        set({ activeEventSource: eventSource });
    },

    sendMessage: async (text: string) => {
        const activeBookingId = useUiStore.getState().activeBookingId;
        if (!activeBookingId) return;
        
        const newMsg: ChatMessage = { id: Math.random().toString(), senderId: 'me', text, timestamp: Date.now(), type: 'text', status: 'sent' };
        
        set(state => {
             const sessionIndex = state.sessions.findIndex(s => s.id === activeBookingId);
             if (sessionIndex === -1) return {};
             const session = state.sessions[sessionIndex];
             const updatedSession = { ...session, messages: [...session.messages, newMsg], lastMessage: newMsg.text, lastMessageTime: newMsg.timestamp };
             const newSessions = [...state.sessions];
             newSessions[sessionIndex] = updatedSession;
             dbService.saveSession(updatedSession);
             return { sessions: newSessions };
        });

        await sendNtfyMessage(activeBookingId, text);
    },

    sendImage: async (file: File) => {
        const activeBookingId = useUiStore.getState().activeBookingId;
        if (!activeBookingId) return;
        // Similar optimistic update logic as sendMessage
        await sendNtfyImage(activeBookingId, file);
    },
}));

// Subscribe chatStore to uiStore to automatically load messages when activeBookingId changes
useUiStore.subscribe(
    (state) => state.activeBookingId,
    (activeBookingId) => {
        if (activeBookingId) {
            useChatStore.getState().loadMessagesForSession(activeBookingId);
        } else {
            useChatStore.getState().disconnect();
        }
    }
);
