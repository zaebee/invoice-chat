


import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Search, Sparkles, Loader2, Car, MoreVertical, Archive, Trash2, Mail, CheckCircle, ListFilter, ArrowUpDown, Plus } from 'lucide-react';
import { ChatSession, Language, LeaseStatus } from '../../types';
import { useVirtualList } from '../../hooks/useVirtualList';
import { SwipeableRow } from '../ui/SwipeableRow';
import { StatusBadge } from './StatusBadge';
import { t } from '../../utils/i18n';
import { humanizeTime } from '../../utils/dateUtils';
import { useChatStore } from '../../stores/chatStore';
import { STATUS_CONFIG } from './ChatUtils';

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
    const [filterStatus, setFilterStatus] = useState<LeaseStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
    const [showFilters, setShowFilters] = useState(false);
    
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const { archiveSession, deleteSession, markAsRead, markAsUnread, createLocalSession } = useChatStore();

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

    const handleCreateNew = async () => {
        if (!searchQuery.trim()) return;
        const newId = searchQuery.trim();
        await createLocalSession(newId);
        onSelect(newId);
        setSearchQuery('');
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

    const filteredSessions = useMemo(() => {
        let result = sessions.filter((s: ChatSession) => {
            const matchesSearch = !searchQuery || s.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.includes(searchQuery);
            const isVisible = searchQuery ? true : !s.isArchived;
            const matchesStatus = filterStatus === 'all' || s.reservationSummary?.status === filterStatus;
            return matchesSearch && isVisible && matchesStatus;
        });

        return result.sort((a, b) => {
            if (sortBy === 'name') {
                return a.user.name.localeCompare(b.user.name);
            }
            // default 'date'
            return b.lastMessageTime - a.lastMessageTime;
        });
    }, [sessions, searchQuery, filterStatus, sortBy]);

    const { virtualItems, totalHeight, measureElement } = useVirtualList({
        count: filteredSessions.length,
        getScrollElement: () => listRef.current,
        estimateHeight: useCallback(() => 90, []), 
        overscan: 5
    });

    const isFilterActive = filterStatus !== 'all' || sortBy !== 'date';

    return (
        <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
            {/* SEARCH & FILTER BAR */}
            <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <form onSubmit={handleSearchSubmit} className="relative group flex-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -m-[1px] blur-[1px]" />
                        <div className="relative flex items-center bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl group-focus-within:bg-white dark:group-focus-within:bg-slate-900 group-focus-within:border-transparent group-focus-within:shadow-md transition-all duration-300 overflow-hidden">
                            <div className="pl-3 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                <Search size={16} className="group-focus-within:hidden" />
                                <Sparkles size={16} className="hidden group-focus-within:block animate-pulse" />
                            </div>
                            <input 
                                type="text" 
                                placeholder={t('chat_search', lang)}
                                className="w-full pl-2 pr-3 py-2.5 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </form>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2.5 rounded-xl border transition-all ${
                            showFilters || isFilterActive 
                                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <ListFilter size={18} />
                    </button>
                </div>

                {/* EXPANDABLE FILTER PANEL */}
                {showFilters && (
                    <div className="pt-1 pb-2 space-y-3">
                        {/* Sort Options */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">{t('lbl_sort_by', lang)}</span>
                            <button 
                                onClick={() => setSortBy('date')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                    sortBy === 'date' 
                                        ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm' 
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                <ArrowUpDown size={12} /> {t('sort_date', lang)}
                            </button>
                            <button 
                                onClick={() => setSortBy('name')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                    sortBy === 'name' 
                                        ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm' 
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                <ArrowUpDown size={12} /> {t('sort_name', lang)}
                            </button>
                        </div>

                        {/* Status Filter */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('lbl_filter_status', lang)}</span>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                <button 
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                                        filterStatus === 'all'
                                            ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100'
                                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                >
                                    {t('filter_all', lang)}
                                </button>
                                {['pending', 'confirmed', 'collected', 'completed', 'overdue', 'cancelled'].map((status) => {
                                    const s = status as LeaseStatus;
                                    const config = STATUS_CONFIG[s];
                                    const isActive = filterStatus === s;
                                    return (
                                        <button 
                                            key={s}
                                            onClick={() => setFilterStatus(s)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                                isActive 
                                                    ? `${config.bg} ${config.text} border-transparent ring-1 ring-inset ring-black/5 dark:ring-white/10` 
                                                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            {config.icon} {t(config.labelKey, lang)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* LIST */}
            <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 relative w-full">
                {isLoading && sessions.length === 0 && (
                    <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-2 h-full">
                        <Loader2 className="animate-spin text-blue-500" />
                        <span className="text-xs">{t('loading_chats', lang)}</span>
                    </div>
                )}
                
                {filteredSessions.length === 0 && !isLoading && (
                    <div className="p-8 text-center text-xs text-slate-400 italic h-full flex flex-col items-center justify-center gap-2">
                        {searchQuery ? (
                            <>
                                <p className="mb-2 text-slate-500 dark:text-slate-400">{t('msg_res_not_found', lang)} "{searchQuery}".</p>
                                <button 
                                    onClick={handleCreateNew}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
                                >
                                    <Plus size={16} />
                                    {t('btn_create_booking', lang)} #{searchQuery}
                                </button>
                            </>
                        ) : (
                            <>
                                <span>{t('no_active_chats', lang)}</span>
                                {isFilterActive && (
                                    <button 
                                        onClick={() => { setFilterStatus('all'); setSortBy('date'); }}
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {t('reset', lang)} {t('lbl_filters', lang)}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}

                {filteredSessions.length > 0 && (
                    <div style={{ height: totalHeight, position: 'relative', width: '100%' }}>
                        {virtualItems.map((virtualItem) => {
                            const chat = filteredSessions[virtualItem.index];
                            const isActive = activeId === chat.id;
                            const isMenuOpen = activeMenuId === chat.id;

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
                                        transform: `translateY(${virtualItem.offset}px)`,
                                        zIndex: isMenuOpen ? 50 : 1 
                                    }}
                                >
                                    <SwipeableRow onArchive={() => archiveSession(chat.id)} className="border-b border-slate-50 dark:border-slate-800 w-full">
                                        <div 
                                            onClick={() => onSelect(chat.id)}
                                            className={`relative p-3 md:p-4 flex gap-3 cursor-pointer transition-all group pr-10 w-full
                                                ${isActive 
                                                    ? 'bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-l-blue-500 shadow-inner' 
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
                                                }`}
                                        >
                                            <div className="relative shrink-0 self-start">
                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden transition-all
                                                    ${isActive ? 'bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300 ring-2 ring-white dark:ring-slate-800 shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-600'}`}>
                                                    {chat.user.avatar ? <img src={chat.user.avatar} alt={chat.user.name} className="w-full h-full object-cover" /> : chat.user.name[0]}
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${chat.user.status === 'online' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-start">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h3 className={`font-bold text-sm truncate ${isActive ? 'text-blue-900 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200'}`}>{chat.user.name}</h3>
                                                    <span className={`text-[10px] font-medium whitespace-nowrap ml-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                                        {chat.lastMessageTime > 0 ? humanizeTime(chat.lastMessageTime, lang) : ''}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className={`text-xs truncate max-w-[140px] md:max-w-[140px] ${isActive ? 'text-blue-700 dark:text-blue-400 font-medium' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                                                        {chat.lastMessage}
                                                    </p>
                                                    {chat.unreadCount > 0 && (
                                                        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm">
                                                            {chat.unreadCount}
                                                        </span>
                                                    )}
                                                </div>

                                                {chat.reservationSummary && (
                                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100/80 dark:border-slate-800/80">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md max-w-[55%]">
                                                            {chat.reservationSummary.vehicleImageUrl ? (
                                                                <img src={chat.reservationSummary.vehicleImageUrl} alt="car" className="w-3 h-3 object-cover rounded-sm" />
                                                            ) : (
                                                                <Car size={10} className="text-slate-400 dark:text-slate-500 shrink-0" />
                                                            )}
                                                            <span className="truncate">{chat.reservationSummary.vehicleName}</span>
                                                        </div>
                                                        {chat.reservationSummary.status && (
                                                            <div className="opacity-90 hover:opacity-100">
                                                                <StatusBadge status={chat.reservationSummary.status} lang={lang} />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* ACTION BUTTON */}
                                            <button 
                                                data-menu-trigger="true"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleMenu(chat.id);
                                                }}
                                                className={`absolute top-3 right-2 p-1.5 rounded-full transition-all z-10 
                                                    ${isMenuOpen ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </SwipeableRow>

                                    {/* DROPDOWN MENU */}
                                    {isMenuOpen && (
                                        <div 
                                            ref={menuRef} 
                                            className="absolute top-10 right-4 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden origin-top-right ring-1 ring-black/5"
                                        >
                                            <div className="p-1 space-y-0.5">
                                                {chat.unreadCount > 0 ? (
                                                    <button onClick={(e) => handleMenuAction(e, 'read', chat.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                                        <CheckCircle size={14} className="text-slate-400 dark:text-slate-500" />
                                                        {t('menu_mark_read', lang)}
                                                    </button>
                                                ) : (
                                                    <button onClick={(e) => handleMenuAction(e, 'unread', chat.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                                        <Mail size={14} className="text-slate-400 dark:text-slate-500" />
                                                        {t('menu_mark_unread', lang)}
                                                    </button>
                                                )}
                                                
                                                <button onClick={(e) => handleMenuAction(e, 'archive', chat.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                                    <Archive size={14} className="text-slate-400 dark:text-slate-500" />
                                                    {t('btn_archive', lang)}
                                                </button>
                                                
                                                <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                                                
                                                <button onClick={(e) => handleMenuAction(e, 'delete', chat.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                    <Trash2 size={14} />
                                                    {t('btn_delete', lang)}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
