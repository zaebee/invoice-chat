
import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Language, ChatSession } from '../../types';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useChatStore } from '../../stores/chatStore';
import { useBookingStore } from '../../stores/bookingStore';
import { useUiStore } from '../../stores/uiStore';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { RightPanel } from './RightPanel';
import { t } from '../../utils/i18n';

interface ChatLayoutProps {
    lang: Language;
    leaseHandlers: any; // Kept for legacy compatibility with forms
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ lang, leaseHandlers }) => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { id: routeId } = useParams<{ id: string }>();
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => JSON.parse(localStorage.getItem('chat_sidebar_open') || 'true'));

    const { sessions, hydrate: hydrateChats, isHydrated } = useChatStore();
    const { activeBooking, loadBooking } = useBookingStore();
    const { activeBookingId, setActiveBookingId, isLoading } = useUiStore();

    // --- MOBILE VIEW LOGIC ---
    const mobileView = isMobile && activeBookingId ? 'room' : 'list';
    // --- END ---

    useEffect(() => {
        localStorage.setItem('chat_sidebar_open', JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    useEffect(() => {
        if (!isHydrated) hydrateChats();
    }, [isHydrated, hydrateChats]);
    
    useEffect(() => {
        if (routeId) {
            setActiveBookingId(routeId);
            loadBooking(routeId);
        } else {
            setActiveBookingId(null);
        }
    }, [routeId, setActiveBookingId, loadBooking]);

    const activeChat = useMemo(() => sessions.find((c: ChatSession) => c.id === activeBookingId), [sessions, activeBookingId]);

    const handleChatSelect = (chatId: string) => {
        navigate(`/chat/detail/${chatId}`);
    };

    const handleBackToList = () => {
        navigate('/');
    };

    return (
        <div className="flex h-full bg-white dark:bg-slate-900 md:rounded-xl overflow-hidden md:border w-full">
            {/* --- REFACTORED CONDITIONAL RENDERING FOR MOBILE --- */}
            <div className={`flex flex-col bg-slate-50 dark:bg-slate-900 relative shrink-0 h-full ${
                isMobile 
                    ? (mobileView === 'list' ? 'w-full' : 'hidden') 
                    : 'w-80 border-r border-slate-200 dark:border-slate-800'
            }`}>
                <ChatSidebar 
                    sessions={sessions}
                    activeId={activeBookingId}
                    isLoading={isLoading || !isHydrated}
                    onSelect={handleChatSelect}
                    lang={lang}
                />
            </div>

            <div className={`flex flex-col bg-slate-50/30 dark:bg-slate-950 relative shrink-0 h-full ${
                isMobile
                    ? (mobileView === 'room' ? 'w-full' : 'hidden')
                    : 'flex-1 min-w-0'
            }`}>
                {activeChat && activeBooking ? (
                    <ChatWindow 
                        chat={activeChat}
                        booking={activeBooking}
                        lang={lang}
                        onBack={handleBackToList}
                        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                        isSidebarOpen={isSidebarOpen}
                    />
                ) : (
                    <div className="flex-1 h-full flex items-center justify-center">
                        {isMobile ? null : (isLoading || !isHydrated ? <Loader2 className="animate-spin text-blue-500" size={48} /> : <MessageSquare size={48} />)}
                    </div>
                )}
            </div>
            {/* --- END REFACTORED CONDITIONAL RENDERING --- */}

            {activeChat && activeBooking && !isMobile && (
                <RightPanel 
                    chat={activeChat}
                    booking={activeBooking}
                    lang={lang}
                    handlers={leaseHandlers}
                    isOpen={isSidebarOpen}
                />
            )}
        </div>
    );
};
