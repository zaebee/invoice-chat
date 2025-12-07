
import React, { useRef, useEffect } from 'react';
import { CheckCheck, Check, ThumbsUp, ThumbsDown, Hourglass, FileText } from 'lucide-react';
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

    return (
        <div className="flex-1 p-2 md:p-6 overflow-y-auto space-y-4 md:space-y-6 flex flex-col custom-scrollbar bg-slate-50/50 overscroll-contain">
            {messages.map((msg: ChatMessage, index: number) => {
                const prevMsg = index > 0 ? messages[index - 1] : null;
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
                            <div className="flex justify-center w-full my-4 px-2 md:px-4">
                                {msg.metadata?.status ? (
                                    /* --- STATUS EVENT CARD --- */
                                    (() => {
                                        const config = STATUS_CONFIG[msg.metadata.status];
                                        const isActionable = msg.metadata.status === 'confirmation_owner' && leaseStatus !== 'confirmed' && leaseStatus !== 'rejected';
                                        
                                        return (
                                            <div className={`relative flex flex-col items-center text-center p-4 pt-5 rounded-2xl border bg-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] max-w-[340px] w-full animate-in zoom-in-95 duration-300 ${config.border}`}>
                                                {/* Overlapping Badge */}
                                                <div className={`absolute -top-3 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white shadow-sm ${config.text} ${config.border}`}>
                                                    {config.icon}
                                                    <span>{t(config.labelKey, lang)}</span>
                                                </div>

                                                {/* Content */}
                                                {msg.text && msg.text !== t(config.labelKey, lang) && (
                                                    <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
                                                        {msg.text}
                                                    </p>
                                                )}

                                                <span className="text-[9px] text-slate-400 font-mono mt-2">
                                                    {formatTime(msg.timestamp)}
                                                </span>

                                                {/* Integrated Action Area */}
                                                {isActionable && (
                                                    <div className="mt-4 w-full pt-3 border-t border-slate-100 flex flex-col gap-3">
                                                        {deadline && deadline.hasDeadline && !deadline.isExpired && (
                                                            <div className={`text-[10px] font-bold flex items-center justify-center gap-1.5 bg-slate-50 py-1 rounded-lg ${deadline.isCritical ? 'text-red-600' : 'text-orange-500'}`}>
                                                                <Hourglass size={12} /> 
                                                                {t('expires_in', lang)} {deadline.timeLeft}
                                                            </div>
                                                        )}
                                                        <div className="flex gap-2">
                                                            <button onClick={onConfirm} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100 active:scale-95 flex items-center justify-center gap-2 transition-all">
                                                                <ThumbsUp size={14} /> {t('btn_confirm', lang)}
                                                            </button>
                                                            <button onClick={onReject} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl text-xs font-bold shadow-sm active:scale-95 flex items-center justify-center gap-2 transition-all">
                                                                <ThumbsDown size={14} /> {t('btn_reject', lang)}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()
                                ) : msg.id.startsWith('sys_summary') ? (
                                    /* --- RESERVATION SUMMARY CARD --- */
                                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-sm text-slate-700 w-full max-w-[280px] relative overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                        <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                                <FileText size={14} />
                                            </div>
                                            <span>Reservation Details</span>
                                        </div>
                                        <div className="whitespace-pre-wrap font-mono text-xs text-slate-600 leading-relaxed pl-1">
                                            {msg.text.replace('Reservation Details\n', '')}
                                        </div>
                                        <div className="text-[9px] text-slate-300 mt-2 text-right font-mono">{formatTime(msg.timestamp)}</div>
                                    </div>
                                ) : (
                                    /* --- GENERIC SYSTEM MESSAGE --- */
                                    <div className="flex flex-col items-center gap-1 max-w-[80%]">
                                        <span className="text-[9px] text-slate-300 font-mono">{formatTime(msg.timestamp)}</span>
                                        <div className="bg-slate-100/80 backdrop-blur-sm border border-slate-200/50 px-4 py-2 rounded-xl text-xs text-slate-500 shadow-sm text-center">
                                            {msg.text}
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
