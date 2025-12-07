
import React, { useState, useRef, useEffect } from 'react';
import { 
    Phone, Video, Send, Smile, Image as ImageIcon, CheckCheck, Check, 
    ArrowLeft, MoreVertical, PanelRightClose, PanelRightOpen, 
    CalendarClock, Car, ThumbsUp, ThumbsDown 
} from 'lucide-react';
import { ChatSession, ChatMessage, LeaseData, Language } from '../../types';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useChatStore } from '../../stores/chatStore';
import { t } from '../../utils/i18n';
import { StatusBadge, STATUS_CONFIG, getLeaseProgress, getTimeRemaining } from './ChatUtils';
import { formatShortDate } from '../../utils/dateUtils';

interface ChatWindowProps {
    chat: ChatSession;
    leaseData: LeaseData;
    lang: Language;
    onBack: () => void;
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
    chat, leaseData, lang, onBack, onToggleSidebar, isSidebarOpen 
}) => {
    const isMobile = useIsMobile();
    const [messageInput, setMessageInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Store Actions
    const { sendMessage, sendImage, markMessageAsRead, confirmReservation, rejectReservation } = useChatStore();

    // Auto-scroll on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat.messages.length, chat.id]);

    // Read Receipt Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement;
                    const id = el.dataset.id;
                    const status = el.dataset.status;
                    const sender = el.dataset.sender;
                    
                    if (id && status === 'sent' && sender !== 'me' && sender !== 'system') {
                        markMessageAsRead(chat.id, id);
                        observer.unobserve(el);
                    }
                }
            });
        }, { threshold: 0.5 });

        const elements = document.querySelectorAll('.message-wrapper');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [chat.messages, chat.id, markMessageAsRead]);

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!messageInput.trim()) return;
        sendMessage(messageInput);
        setMessageInput('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) sendImage(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Formatters
    const formatTime = (timestamp: number) => {
        try {
            return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
                hour: '2-digit', minute: '2-digit'
            }).format(new Date(timestamp));
        } catch { return ''; }
    };

    const formatDateSeparator = (timestamp: number) => {
        try {
            return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
                weekday: 'short', day: 'numeric', month: 'long'
            }).format(new Date(timestamp));
        } catch { return ''; }
    };

    const statusConfig = STATUS_CONFIG[leaseData.status || 'pending'] || STATUS_CONFIG['pending'];
    const timelineProgress = getLeaseProgress(leaseData.pickup.date, leaseData.dropoff.date);
    const smartTime = getTimeRemaining(leaseData.dropoff.date, leaseData.status || 'pending');

    return (
        <div className="flex flex-col h-full bg-slate-50/30 relative">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

            {/* HEADER */}
            <div className="h-14 md:h-16 border-b border-slate-200 flex justify-between items-center px-3 md:px-6 shrink-0 bg-white/95 backdrop-blur-sm shadow-sm z-20">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    {isMobile && (
                        <button onClick={onBack} className="-ml-2 p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="relative shrink-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 overflow-hidden">
                            {chat.user.avatar ? <img src={chat.user.avatar} alt={chat.user.name} className="w-full h-full object-cover" /> : chat.user.name[0]}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${chat.user.status === 'online' ? 'bg-green-500' : 'bg-slate-300'} md:block hidden`}></div>
                    </div>
                    <div className="flex flex-col min-w-0 justify-center">
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-800 text-sm truncate leading-tight">{chat.user.name}</h3>
                            {isMobile && <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.accent}`} />}
                        </div>
                        {isMobile ? (
                            <p className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1 leading-tight mt-0.5">
                                <span className="truncate max-w-[120px]">{leaseData.vehicle.name}</span>
                                <span className="text-slate-300">•</span>
                                <span className={statusConfig.text}>{statusConfig.label}</span>
                            </p>
                        ) : (
                            <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                {t('chat_active', lang)}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex gap-1 md:gap-2 text-slate-400 items-center shrink-0">
                    <button className="hidden md:block p-2 hover:bg-slate-100 rounded-full hover:text-slate-600 transition-colors"><Phone size={18} /></button>
                    <button className="hidden md:block p-2 hover:bg-slate-100 rounded-full hover:text-slate-600 transition-colors"><Video size={18} /></button>
                    <div className="h-6 w-px bg-slate-200 mx-1 hidden xl:block"></div>
                    <button 
                        onClick={onToggleSidebar}
                        className={`p-2 rounded-full transition-colors hidden xl:block ${isSidebarOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 hover:text-slate-600'}`}
                        title="Toggle Context Panel"
                    >
                        {isSidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-full hover:text-slate-600 transition-colors xl:hidden"><MoreVertical size={18} /></button>
                </div>
            </div>

            {/* CONTEXT ISLAND (Desktop) */}
            <div className={`hidden md:block backdrop-blur-xl bg-white/90 border-b border-slate-200/50 pt-3 pb-0 shrink-0 z-10 sticky top-0 transition-all shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)]`}>
                <div className="px-4 pb-3 flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="relative shrink-0 pt-0.5">
                            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-sm flex items-center justify-center text-slate-500">
                                <Car size={20} strokeWidth={1.5} />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-[3px] border-white ${statusConfig.accent}`}></div>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 leading-tight truncate mt-0.5">{leaseData.vehicle.name}</h4>
                            <div className="mt-1 flex items-center">
                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50 whitespace-nowrap">{leaseData.vehicle.plate}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center min-w-0 px-2 flex-1">
                        <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
                            <CalendarClock size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">Timeline</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 truncate w-full justify-center">
                            <span className="text-xs font-semibold text-slate-800 truncate">
                                {leaseData.pickup.date ? (
                                    <>{formatShortDate(leaseData.pickup.date, lang)}<span className="text-slate-300 mx-1.5">→</span>{formatShortDate(leaseData.dropoff.date, lang)}</>
                                ) : <span className="text-slate-400 italic">No dates set</span>}
                            </span>
                            {leaseData.dropoff.date && (
                                <span className={`text-[10px] font-bold px-1.5 rounded-md ${(leaseData.status === 'overdue' || leaseData.status === 'cancelled') ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                    {smartTime}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] text-slate-400 font-mono">#{leaseData.reservationId}</span>
                            <StatusBadge status={leaseData.status || 'pending'} />
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-slate-800 text-sm font-sans">{leaseData.pricing.total > 0 ? leaseData.pricing.total.toLocaleString() : '-'}</span>
                            <span className="text-[10px] text-slate-400 font-bold ml-1">THB</span>
                        </div>
                    </div>
                </div>
                <div className="w-full h-[3px] bg-slate-100 relative overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ease-out ${statusConfig.accent}`} style={{ width: `${timelineProgress}%` }}>
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50"></div>
                    </div>
                </div>
            </div>

            {/* MESSAGE LIST */}
            <div className="flex-1 p-2 md:p-6 overflow-y-auto space-y-4 md:space-y-6 flex flex-col dark-scrollbar bg-slate-50/50 overscroll-contain">
                {chat.messages.map((msg: ChatMessage, index: number) => {
                    const prevMsg = index > 0 ? chat.messages[index - 1] : null;
                    const isDifferentDay = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();

                    return (
                        <React.Fragment key={msg.id}>
                            {isDifferentDay && (
                                <div className="flex justify-center my-4 md:my-6 sticky top-2 z-0">
                                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 shadow-sm px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm bg-white/80">
                                        {formatDateSeparator(msg.timestamp)}
                                    </span>
                                </div>
                            )}

                            {msg.type === 'system' ? (
                                <div className="flex flex-col gap-1 my-2 animate-in fade-in slide-in-from-bottom-2 duration-300 px-2 md:px-12">
                                    <div className="flex items-start gap-3 w-full">
                                        <div className="w-full flex flex-col items-center">
                                            <span className="text-[9px] text-slate-400 font-mono mb-1">{formatTime(msg.timestamp)}</span>
                                            {msg.text && <p className="text-[11px] md:text-xs text-slate-500 italic text-center max-w-xs leading-snug">{msg.text}</p>}
                                            {msg.metadata?.status === 'confirmation_owner' && leaseData.status !== 'confirmed' && leaseData.status !== 'rejected' && (
                                                <div className="mt-3 flex gap-2 md:gap-3 animate-in zoom-in duration-300">
                                                    <button onClick={() => confirmReservation()} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-95"><ThumbsUp size={14} /> Confirm</button>
                                                    <button onClick={() => rejectReservation()} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold shadow-sm active:scale-95"><ThumbsDown size={14} /> Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`message-wrapper flex gap-2 md:gap-3 max-w-[90%] md:max-w-[70%] animate-in fade-in slide-in-from-bottom-2 duration-200 ${msg.senderId === 'me' ? 'self-end flex-row-reverse' : 'self-start'}`} data-id={msg.id} data-status={msg.status} data-sender={msg.senderId}>
                                    {msg.senderId !== 'me' && (
                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-600 shadow-sm mt-auto overflow-hidden">
                                            {chat.user.avatar ? <img src={chat.user.avatar} alt={chat.user.name} className="w-full h-full object-cover" /> : chat.user.name[0]}
                                        </div>
                                    )}
                                    <div className={`flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                                        {msg.type === 'image' && msg.attachmentUrl ? (
                                            <div className={`overflow-hidden rounded-2xl shadow-sm border border-black/5 ${msg.senderId === 'me' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                                                <img src={msg.attachmentUrl} alt="Attachment" className="max-w-full max-h-[300px] object-cover bg-slate-100" loading="lazy" />
                                            </div>
                                        ) : (
                                            <div className={`px-3 py-2 md:px-4 md:py-2.5 shadow-sm text-[13px] md:text-sm leading-relaxed ${msg.senderId === 'me' ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl rounded-tr-sm shadow-blue-200/50' : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]'}`}>
                                                {msg.text}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 mt-1 px-1 text-[9px] md:text-[10px] text-slate-400 font-medium select-none">
                                            {msg.senderId === 'me' && msg.status === 'read' && <CheckCheck size={12} className="text-blue-500" />}
                                            {msg.senderId === 'me' && msg.status === 'sent' && <Check size={12} />}
                                            <span>{formatTime(msg.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* INPUT AREA */}
            <div className="p-2 md:p-4 border-t border-slate-200 shrink-0 bg-white z-10 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                <form className="relative flex items-center gap-2" onSubmit={handleSend} autoComplete="off">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors md:hidden">
                        <ImageIcon size={22} />
                    </button>
                    <input 
                        type="text" 
                        name="message"
                        className="flex-1 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-300 rounded-full py-2.5 md:py-3 pl-4 md:pl-5 pr-10 md:pr-12 text-base md:text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                        placeholder={t('chat_type_message', lang)}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <div className="absolute right-14 md:right-14 flex gap-2 text-slate-400 hidden md:flex">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="hover:text-blue-600 transition-colors p-1">
                            <ImageIcon size={20} />
                        </button>
                        <button type="button" className="hover:text-blue-600 transition-colors p-1"><Smile size={20} /></button>
                    </div>
                    <button 
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="bg-blue-600 text-white p-2.5 md:p-3 rounded-full hover:bg-blue-700 transition-all shadow-md flex-shrink-0 disabled:opacity-50 disabled:shadow-none active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};
