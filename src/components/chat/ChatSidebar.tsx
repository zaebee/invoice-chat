import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Sparkles, Loader2, Car, MoreVertical, Archive, Trash2, Mail, CheckCircle } from 'lucide-react';
import { ChatSession, Language } from '../../types';
import { useVirtualList } from '../../hooks/useVirtualList';
import { SwipeableRow } from '../ui/SwipeableRow';
import { StatusBadge } from './StatusBadge';
import { t } from '../../utils/i18n';
import { humanizeTime } from '../../utils/dateUtils';
import { useChatStore } from '../../stores/chatStore';
import { useIsMobile } from '../../hooks/useIsMobile';

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
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const { archiveSession, deleteSession, markAsRead, markAsUnread } = useChatStore();
    const isMobile = useIsMobile();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            
            // Critical: Ignore clicks on the toggle button itself to prevent conflict with onClick
            if (target.closest('[data-menu-trigger="true"]')) {
                return;
            }

            if (menuRef.current && !menuRef.current.contains(target)) {
                setActiveMenuId(null);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSelect(searchQuery.trim());
            setSearchQuery('');
        }
    };

    const toggleMenu = (id: string) => {
        setActiveMenuId(prev => prev === id ? null : id);
    };

    const handleMenuAction = (e: React.MouseEvent, action: 'archive' | 'delete' | 'read' | 'unread', id: string) => {
        e.stopPropagation();
        setActiveMenuId(null);
        
        switch (action) {
            case 'archive':
                archiveSession(id);
                break;
            case 'delete':
                if (confirm(t('confirm_delete_chat', lang))) {
                    deleteSession(id);
                }
                break;
            case 'read':
                markAsRead(id);
                break;
            case 'unread':
                markAsUnread(id);
                break;
        }
    };

    const filteredSessions = sessions.filter((s: ChatSession) => {
        const matchesSearch = !searchQuery || s.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.includes(searchQuery);
        const isVisible = searchQuery ? true : !s.isArchived;
        return matchesSearch && isVisible;
    });

    // Mobile Optimization: Disable virtualization for all mobile usage or small lists (< 50 items)
    // This provides robust rendering on mobile where container heights can be unstable during view transitions
    const shouldVirtualize = !isMobile && filteredSessions.length > 50;

    const { virtualItems, totalHeight, measureElement } = useVirtualList({
        count: filteredSessions.length,
        getScrollElement: () => listRef.current,
        estimateHeight: useCallback(() => 92, []), 
        overscan: 5
    });

    const renderSessionItem = (chat: ChatSession, style: React.CSSProperties, ref?: React.Ref<HTMLDivElement>, dataIndex?: number) => {
        const isActive = activeId === chat.id;
        const isMenuOpen = activeMenuId === chat.id;

        return (
            <div
                key={chat.id}
                data-index={dataIndex}
                ref={ref}
                style={style}
            >
                <SwipeableRow onArchive={() => archiveSession(chat.id)} className="border-b border-slate-50">
                    <div 
                        onClick={() => onSelect(chat.id)}
                        className={`relative p-3 flex gap-3 cursor-pointer transition-all group
                            ${isActive 
                                ? 'bg-blue-50/60 border-l-4 border-l-blue-500 shadow-inner' 
                                : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                            }`}
                    >
                        <div className="relative shrink-0 self-start mt-0.5">
                            <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden transition-all
                                ${isActive ? 'bg-blue-200 text-blue-700 ring-2 ring-white shadow-md' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'}`}>
                                {chat.user.avatar ? <img src={chat.user.avatar} alt={chat.user.name} className="w-full h-full object-cover" /> : chat.user.name[0]}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-white ${chat.user.status === 'online' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                            {/* Header: Name + Time */}
                            <div className="flex justify-between items-start">
                                <h3 className={`font-bold text-sm truncate pr-1 ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                                    {chat.user.name}
                                </h3>
                                {/* MR-7 to prevent overlap with absolute menu button */}
                                <span className={`text-[10px] font-medium whitespace-nowrap mr-7 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {chat.lastMessageTime > 0 ? humanizeTime(chat.lastMessageTime, lang) : ''}
                                </span>
                            </div>

                            {/* Message */}
                            <div className="flex justify-between items-center h-5">
                                <p className={`text-xs truncate max-w-[85%] ${isActive ? 'text-blue-700 font-medium' : 'text-slate-500 group-hover:text-slate-600'}`}>
                                    {chat.lastMessage}
                                </p>
                                {chat.unreadCount > 0 && (
                                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm">
                                        {chat.unreadCount}
                                    </span>
                                )}
                            </div>

                            {/* Summary Footer */}
                            {chat.reservationSummary && (
                                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium bg-slate-100/80 px-2 py-0.5 rounded max-w-[60%]">
                                        {chat.reservationSummary.vehicleImageUrl ? (
                                            <img src={chat.reservationSummary.vehicleImageUrl} alt="car" className="w-3 h-3 object-cover rounded-sm" />
                                        ) : (
                                            <Car size={10} className="text-slate-400 shrink-0" />
                                        )}
                                        <span className="truncate">{chat.reservationSummary.vehicleName}</span>
                                    </div>
                                    
                                    {chat.reservationSummary.status && (
                                        <div className="transform scale-90 origin-right">
                                            <StatusBadge status={chat.reservationSummary.status} lang={lang} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ACTION BUTTON - Fixed Position */}
                        <button 
                            data-menu-trigger="true"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleMenu(chat.id);
                            }}
                            className={`absolute top-2.5 right-1.5 p-1.5 rounded-full transition-all z-10 
                                ${isMenuOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'}`}
                        >
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </SwipeableRow>

                {/* DROPDOWN MENU */}
                {isMenuOpen && (
                    <div 
                        ref={menuRef} 
                        className="absolute top-10 right-4 w-44 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5"
                    >
                        <div className="p-1 space-y-0.5">
                            {chat.unreadCount > 0 ? (
                                <button onClick={(e) => handleMenuAction(e, 'read', chat.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                                    <CheckCircle size={14} className="text-slate-400" />
                                    {t('menu_mark_read', lang)}
                                </button>
                            ) : (
                                <button onClick={(e) => handleMenuAction(e, 'unread', chat.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                                    <Mail size={14} className="text-slate-400" />
                                    {t('menu_mark_unread', lang)}
                                </button>
                            )}
                            
                            <button onClick={(e) => handleMenuAction(e, 'archive', chat.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                                <Archive size={14} className="text-slate-400" />
                                {t('btn_archive', lang)}
                            </button>
                            
                            <div className="my-1 border-t border-slate-100"></div>
                            
                            <button onClick={(e) => handleMenuAction(e, 'delete', chat.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={14} />
                                {t('btn_delete', lang)}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

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
                        <span className="text-xs">{t('loading_chats', lang)}</span>
                    </div>
                )}
                
                {filteredSessions.length === 0 && !isLoading && (
                    <div className="p-8 text-center text-xs text-slate-400 italic h-full flex items-center justify-center">
                        {t('no_active_chats', lang)}
                    </div>
                )}

                {filteredSessions.length > 0 && (
                    shouldVirtualize ? (
                        <div style={{ height: totalHeight, position: 'relative' }}>
                            {virtualItems.map((virtualItem) => {
                                const chat = filteredSessions[virtualItem.index];
                                return renderSessionItem(
                                    chat, 
                                    {
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        transform: `translateY(${virtualItem.offset}px)`,
                                        zIndex: activeMenuId === chat.id ? 50 : 1
                                    },
                                    measureElement,
                                    virtualItem.index
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col relative">
                            {filteredSessions.map((chat) => renderSessionItem(
                                chat, 
                                { position: 'relative', zIndex: activeMenuId === chat.id ? 50 : 1 },
                                undefined,
                                undefined
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};