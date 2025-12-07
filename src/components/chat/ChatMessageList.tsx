import React, { useRef, useEffect } from 'react';
import { CheckCheck, Check, ThumbsUp, ThumbsDown, Hourglass } from 'lucide-react';
import { ChatMessage, ChatUser, Language, LeaseStatus } from '../../types';
import { t } from '../../utils/i18n';
import { STATUS_CONFIG } from './ChatUtils';

interface ChatMessageListProps {
    messages: ChatMessage[];
    currentUser: ChatUser;
    onReadMessage: (id: string) => void;
    onConfirm: () => void;
    onReject: () => void;
    leaseStatus?: LeaseStatus;
    lang: Language;
    deadline?: {
        hasDeadline: boolean;
        isExpired: boolean;
        isCritical: boolean;
        timeLeft: string;
    };
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
    messages,
    currentUser,
    onReadMessage,
    onConfirm,
    onReject,
    leaseStatus,
    lang,
    deadline
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // Read Receipts
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement;
                    const id = el.dataset.id;
                    const status = el.dataset.status;
                    const sender = el.dataset.sender;
                    
                    if (id && status === 'sent' && sender !== 'me' && sender !== 'system') {
                        onReadMessage(id);
                        observer.unobserve(el);
                    }
                }
            });
        }, { threshold: 0.5 });

        const elements = document.querySelectorAll('.message-wrapper');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [messages, onReadMessage]);

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

    const formatShortDateStr = (timestamp: number) => {
         try {
             return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
                month: 'short', day: 'numeric'
            }).format(new Date(timestamp));
         } catch { return ''; }
    };

    return (
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-6 flex flex-col custom-scrollbar bg-slate-50/50 overscroll-contain">
            {messages.map((msg: ChatMessage, index: number) => {
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const isDifferentDay = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();

                return (
                    <React.Fragment key={msg.id}>
                        {isDifferentDay && (
                            <div className="flex justify-center my-4 md:my-6 sticky top-2 z-30 pointer-events-none">
                                <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 shadow-sm px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm bg-white/80">
                                    {formatDateSeparator(msg.timestamp)}
                                </span>
                            </div>
                        )}

                        {msg.type === 'system' ? (
                            <div className="w-full flex flex-col items-center my-4 px-2 md:px-12 animate-in fade-in zoom-in duration-300">
                                <div className="flex items-center w-full gap-3 mb-2">
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                    <div className="shrink-0">
                                        {msg.metadata?.status && STATUS_CONFIG[msg.metadata.status] ? (
                                            (() => {
                                                const config = STATUS_CONFIG[msg.metadata.status!];
                                                return (
                                                    <div className={`px-4 py-1.5 rounded-2xl border shadow-sm flex items-center gap-2 bg-white ${config.border} ${config.text}`}>
                                                        {config.icon}
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{t(config.labelKey, lang)}</span>
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <div className="px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                </div>

                                <div className="mt-0.5 text-[10px] text-slate-400 font-medium">
                                    {formatShortDateStr(msg.timestamp)}, {formatTime(msg.timestamp)}
                                </div>

                                {msg.text && (
                                    <p className="mt-1 text-xs text-slate-500 italic text-center max-w-sm">
                                        {msg.text}
                                    </p>
                                )}

                                {msg.metadata?.status === 'confirmation_owner' && leaseStatus !== 'confirmed' && leaseStatus !== 'rejected' && (
                                    <div className="mt-3 flex flex-col items-center z-10 w-full">
                                        {deadline && deadline.hasDeadline && !deadline.isExpired && (
                                            <div className={`mb-2 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${deadline.isCritical ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                                <Hourglass size={10} /> 
                                                {t('expires_in', lang)} {deadline.timeLeft}
                                            </div>
                                        )}
                                        <div className="flex gap-2 md:gap-3 animate-in zoom-in duration-300">
                                            <button onClick={onConfirm} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-95"><ThumbsUp size={14} /> {t('btn_confirm', lang)}</button>
                                            <button onClick={onReject} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold shadow-sm active:scale-95"><ThumbsDown size={14} /> {t('btn_reject', lang)}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={`message-wrapper flex gap-2 md:gap-3 max-w-[90%] md:max-w-[70%] animate-in fade-in slide-in-from-bottom-2 duration-200 ${msg.senderId === 'me' ? 'self-end flex-row-reverse' : 'self-start'}`} data-id={msg.id} data-status={msg.status} data-sender={msg.senderId}>
                                {msg.senderId !== 'me' && (
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-600 shadow-sm mt-auto overflow-hidden">
                                        {currentUser.avatar ? <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" /> : currentUser.name[0]}
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
    );
};