
import React, { useState, useRef, useCallback } from 'react';
import { Search, Sparkles, Loader2, Car } from 'lucide-react';
import { ChatSession, Language } from '../../types';
import { useVirtualList } from '../../hooks/useVirtualList';
import { SwipeableRow } from '../ui/SwipeableRow';
import { StatusBadge } from './ChatUtils';
import { t } from '../../utils/i18n';
import { humanizeTime } from '../../utils/dateUtils';
import { useChatStore } from '../../stores/chatStore';

interface ChatSidebarProps {
    sessions: ChatSession[];
    activeId: string | null;
    isLoading: boolean;
    onSelect: (id: string) => void;
    lang: Language;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
    sessions, activeId, isLoading, onSelect, lang 
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const listRef = useRef<HTMLDivElement>(null);
    const { archiveSession } = useChatStore();

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSelect(searchQuery.trim());
            setSearchQuery('');
        }
    };

    const filteredSessions = sessions.filter((s: ChatSession) => {
        const matchesSearch = !searchQuery || s.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.includes(searchQuery);
        const isVisible = searchQuery ? true : !s.isArchived;
        return matchesSearch && isVisible;
    });

    const { virtualItems, totalHeight, measureElement } = useVirtualList({
        count: filteredSessions.length,
        getScrollElement: () => listRef.current,
        estimateHeight: useCallback(() => 90, []), 
        overscan: 5
    });

    return (
        <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
            {/* SEARCH BAR */}
            <div className="p-3 border-b border-slate-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-30">
                <form onSubmit={handleSearchSubmit} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -m-[1px] blur-[1px]" />
                    <div className="relative flex items-center bg-slate-100/50 border border-slate-200 rounded-xl group-focus-within:bg-white group-focus-within:border-transparent group-focus-within:shadow-md transition-all duration-300 overflow-hidden">
                        <div className="pl-3 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <Search size={16} className="group-focus-within:hidden" />
                            <Sparkles size={16} className="hidden group-focus-within:block animate-pulse" />
                        </div>
                        <input 
                            type="text" 
                            placeholder={t('chat_search', lang)}
                            className="w-full pl-2 pr-3 py-2.5 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="mr-2 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-300 opacity-0 group-focus-within:opacity-100 transition-opacity scale-90 hidden sm:block">
                            <span className="text-[10px] font-bold font-mono">/</span>
                        </div>
                    </div>
                </form>
            </div>

            {/* LIST */}
            <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
                {isLoading && sessions.length === 0 && (
                    <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-2 h-full">
                        <Loader2 className="animate-spin text-blue-500" />
                        <span className="text-xs">Loading chats...</span>
                    </div>
                )}
                
                {filteredSessions.length === 0 && !isLoading && (
                    <div className="p-8 text-center text-xs text-slate-400 italic h-full flex items-center justify-center">
                        No active chats found.
                    </div>
                )}

                {filteredSessions.length > 0 && (
                    <div style={{ height: totalHeight, position: 'relative' }}>
                        {virtualItems.map((virtualItem) => {
                            const chat = filteredSessions[virtualItem.index];
                            const isActive = activeId === chat.id;

                            return (
                                <div
                                    key={chat.id}
                                    data-index={virtualItem.index}
                                    ref={measureElement}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        transform: `translateY(${virtualItem.offset}px)`
                                    }}
                                >
                                    <SwipeableRow onArchive={() => archiveSession(chat.id)} className="border-b border-slate-50">
                                        <div 
                                            onClick={() => onSelect(chat.id)}
                                            className={`p-3 md:p-4 flex gap-3 cursor-pointer transition-all group
                                                ${isActive 
                                                    ? 'bg-blue-50/50 border-l-4 border-l-blue-500 shadow-inner' 
                                                    : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                                                }`}
                                        >
                                            <div className="relative shrink-0 self-start">
                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden transition-all
                                                    ${isActive ? 'bg-blue-200 text-blue-700 ring-2 ring-white shadow-md' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'}`}>
                                                    {chat.user.avatar ? <img src={chat.user.avatar} alt={chat.user.name} className="w-full h-full object-cover" /> : chat.user.name[0]}
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white ${chat.user.status === 'online' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-start">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h3 className={`font-bold text-sm truncate ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>{chat.user.name}</h3>
                                                    <span className={`text-[10px] font-medium whitespace-nowrap ml-2 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                                        {chat.lastMessageTime > 0 ? humanizeTime(chat.lastMessageTime, lang) : ''}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className={`text-xs truncate max-w-[140px] md:max-w-[140px] ${isActive ? 'text-blue-700 font-medium' : 'text-slate-500 group-hover:text-slate-600'}`}>
                                                        {chat.lastMessage}
                                                    </p>
                                                    {chat.unreadCount > 0 && (
                                                        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm">
                                                            {chat.unreadCount}
                                                        </span>
                                                    )}
                                                </div>

                                                {chat.reservationSummary && (
                                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100/80">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md max-w-[55%]">
                                                            <Car size={10} className="text-slate-400 shrink-0" />
                                                            <span className="truncate">{chat.reservationSummary.vehicleName}</span>
                                                        </div>
                                                        {chat.reservationSummary.status && (
                                                            <StatusBadge status={chat.reservationSummary.status} />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </SwipeableRow>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
