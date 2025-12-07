import React, { useState, useEffect } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { LeaseData, Language, ChatSession, INITIAL_LEASE } from '../../types';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useChatStore } from '../../stores/chatStore';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { RightPanel } from './RightPanel';
import { t } from '../../utils/i18n';

interface ChatLayoutProps {
    leaseData: LeaseData;
    lang: Language;
    leaseHandlers: any;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ leaseData, lang, leaseHandlers }) => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { id: routeId } = useParams<{ id: string }>();
    
    const [mobileView, setMobileView] = useState<'list' | 'room'>('list');
    
    // Sidebar Collapse State
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('chat_sidebar_open');
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    useEffect(() => {
        localStorage.setItem('chat_sidebar_open', JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    const { 
        sessions, 
        activeSessionId, 
        isLoading, 
        setActiveSession,
        leaseContext,
        hydrate,
        isHydrated
    } = useChatStore();

    useEffect(() => {
        if (!isHydrated) hydrate();
        if (isHydrated) {
            // Trigger resize to fix virtual list height on mobile after hydration
            window.dispatchEvent(new Event('resize'));
        }
    }, [isHydrated, hydrate]);
    
    useEffect(() => {
        if (routeId) {
            if (isMobile) setMobileView('room');
        } else {
            setMobileView('list');
        }
    }, [routeId, isMobile]);

    const currentActiveId = routeId || activeSessionId;
    const activeChat = sessions.find((c: ChatSession) => c.id === currentActiveId);
    
    const resolveDisplayData = (): LeaseData => {
        if (leaseContext && (leaseContext.id === currentActiveId || leaseContext.reservationId === currentActiveId)) {
            return leaseContext;
        }
        if (leaseData.id === currentActiveId || leaseData.reservationId === currentActiveId) {
            return leaseData;
        }
        if (activeChat && activeChat.reservationSummary) {
            return {
                ...INITIAL_LEASE,
                id: activeChat.id,
                reservationId: activeChat.id,
                status: activeChat.reservationSummary.status,
                vehicle: {
                    ...INITIAL_LEASE.vehicle,
                    name: activeChat.reservationSummary.vehicleName,
                    plate: activeChat.reservationSummary.plateNumber,
                },
                pricing: {
                    ...INITIAL_LEASE.pricing,
                    total: activeChat.reservationSummary.price
                },
                pickup: { ...INITIAL_LEASE.pickup, date: '' }, 
                dropoff: { ...INITIAL_LEASE.dropoff, date: '' },
                deadline: activeChat.reservationSummary.deadline // Use cached deadline
            };
        }
        return { ...INITIAL_LEASE, reservationId: 'Loading...' };
    };

    const currentLeaseData = resolveDisplayData();

    const handleChatSelect = (chatId: string) => {
        setActiveSession(chatId);
        if (routeId === chatId && isMobile) {
            setMobileView('room');
        } else {
            navigate(`/chat/detail/${chatId}`);
        }
    };

    const handleBackToList = () => {
        navigate('/');
    };

    return (
        <div className="flex h-full bg-white dark:bg-slate-900 md:rounded-xl overflow-hidden md:border border-slate-200 dark:border-slate-800 md:shadow-sm relative transition-colors duration-200">
            <div className={`flex h-full ${
                isMobile ? 'w-[200%]' : 'w-full'
            } ${
                isMobile && mobileView === 'room' ? '-translate-x-1/2' : 'translate-x-0'
            }`}>

                {/* LEFT: Sidebar List */}
                <div className={`flex flex-col bg-slate-50 dark:bg-slate-900 relative ${
                    isMobile ? 'w-1/2 border-r-0' : 'w-80 border-r border-slate-200 dark:border-slate-800 shrink-0'
                }`}>
                    <ChatSidebar 
                        sessions={sessions}
                        activeId={currentActiveId}
                        isLoading={isLoading || !isHydrated}
                        onSelect={handleChatSelect}
                        lang={lang}
                    />
                </div>

                {/* MIDDLE: Chat Room */}
                <div className={`flex flex-col bg-slate-50/30 dark:bg-slate-950 relative ${
                    isMobile ? 'w-1/2' : 'flex-1 min-w-0'
                }`}>
                    {activeChat ? (
                        <ChatWindow 
                            chat={activeChat}
                            leaseData={currentLeaseData}
                            lang={lang}
                            onBack={handleBackToList}
                            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                            isSidebarOpen={isSidebarOpen}
                        />
                    ) : (
                        <div className="flex-1 h-full flex flex-col items-center justify-center gap-6 text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-950">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-3 animate-in fade-in duration-500">
                                    <Loader2 className="animate-spin text-blue-500" size={48} />
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('loading_conversation', lang)}</p>
                                </div>
                            ) : (
                                <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center mx-4">
                                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-4 border border-blue-100 dark:border-blue-900/30 shadow-sm">
                                        <MessageSquare size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('select_conversation', lang)}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                        {t('select_conversation_desc', lang)}
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                        <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                        <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT: Context Panel (Desktop Only) */}
                {activeChat && (
                    <RightPanel 
                        chat={activeChat}
                        leaseData={currentLeaseData}
                        lang={lang}
                        handlers={leaseHandlers}
                        isOpen={isSidebarOpen}
                    />
                )}
            </div>
        </div>
    );
};