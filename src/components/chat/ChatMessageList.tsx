import React, { useRef, useEffect, useState, useMemo } from 'react';
import { CheckCheck, Check, ThumbsUp, ThumbsDown, Hourglass, Key, Flag, AlertCircle, ExternalLink, Loader2, Radio, X, RefreshCcw, MousePointerClick } from 'lucide-react';
import { ChatMessage, ChatUser, Language, LeaseStatus, NtfyAction, NoResponseMeta } from '../../types';
import { t, TranslationKey } from '../../utils/i18n';

interface ChatMessageListProps {
    messages: ChatMessage[];
    currentUser: ChatUser;
    onReadMessage: (id: string) => void;
    onConfirm: () => void;
    onReject: () => void;
    onCollect?: () => void;
    onComplete?: () => void;
    onRestart?: () => void;
    leaseStatus?: LeaseStatus;
    noResponseMeta?: NoResponseMeta;
    lang: Language;
    deadline?: {
        hasDeadline: boolean;
        isExpired: boolean;
        isCritical: boolean;
        timeLeft: string;
    };
}

const ActionButton: React.FC<{ action: NtfyAction, isMe: boolean }> = ({ action, isMe }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (action.action === 'view' && action.url) {
            window.open(action.url, '_blank');
            return;
        }

        if (action.action === 'broadcast') {
            alert("Broadcast actions are only supported in the native mobile app.");
            return;
        }

        if (action.action === 'http' && action.url) {
            setStatus('loading');
            try {
                const headers: Record<string, string> = { ...action.headers };
                if (action.body && typeof action.body === 'string' && (action.body.startsWith('{') || action.body.startsWith('['))) {
                     headers['Content-Type'] = 'application/json';
                }

                const res = await fetch(action.url, {
                    method: action.method || 'POST',
                    headers: headers,
                    body: action.body
                });
                
                if (res.ok) {
                    setStatus('success');
                    setTimeout(() => setStatus('idle'), 3000);
                } else {
                    console.error("HTTP Action Error", res.status, res.statusText);
                    setStatus('error');
                    setTimeout(() => setStatus('idle'), 3000);
                }
            } catch (error) {
                console.error("Action failed", error);
                setStatus('error');
                setTimeout(() => setStatus('idle'), 3000);
            }
        }
    };

    const baseClasses = `text-[10px] font-bold px-3 py-1.5 rounded-lg border shadow-sm transition-all active:scale-95 flex items-center gap-1.5`;
    const themeClasses = isMe
        ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
        : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600';

    const stateClasses = 
        status === 'success' ? '!bg-green-500 !text-white !border-green-600' :
        status === 'error' ? '!bg-red-500 !text-white !border-red-600' :
        '';
        
    const disabled = status === 'loading';

    return (
        <button 
            onClick={handleClick}
            disabled={disabled}
            className={`${baseClasses} ${themeClasses} ${stateClasses} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            title={action.action === 'broadcast' ? 'Mobile App Only' : action.url}
        >
            {status === 'loading' && <Loader2 size={10} className="animate-spin" />}
            {status === 'success' && <Check size={10} />}
            {status === 'error' && <AlertCircle size={10} />}
            {status === 'idle' && action.action === 'view' && <ExternalLink size={10} />}
            {status === 'idle' && action.action === 'http' && <MousePointerClick size={10} />}
            {status === 'idle' && action.action === 'broadcast' && <Radio size={10} />}
            <span>{action.label}</span>
        </button>
    );
};

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
    messages,
    currentUser,
    onReadMessage,
    onConfirm,
    onReject,
    onCollect,
    onComplete,
    onRestart,
    leaseStatus,
    noResponseMeta,
    lang,
    deadline
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [filterPriority] = useState(false);
    const [filterTag] = useState('');

    const filteredMessages = useMemo(() => {
        return messages.filter(msg => {
            if (filterPriority && (!msg.priority || msg.priority < 4)) return false;
            if (filterTag && !msg.tags?.some(t => t.toLowerCase().includes(filterTag.toLowerCase()))) return false;
            return true;
        });
    }, [messages, filterPriority, filterTag]);

    useEffect(() => {
        if (!filterPriority && !filterTag) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, filterPriority, filterTag]);

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
    }, [filteredMessages, onReadMessage]);

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

    const getNoResponseText = () => {
        if (!noResponseMeta) return t('no_resp_generic', lang);
        const key = `no_resp_${noResponseMeta.from_party}_${noResponseMeta.stage}` as TranslationKey;
        return t(key, lang);
    };

    const renderActions = (msgStatus: LeaseStatus | undefined) => {
        if (!msgStatus || msgStatus !== leaseStatus) return null;

        switch (msgStatus) {
            case 'confirmation_owner':
                return (
                    <div className="mt-3 flex flex-col items-center z-10 w-full animate-in zoom-in duration-300">
                        {deadline && deadline.hasDeadline && !deadline.isExpired && (
                            <div className={`mb-2 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${deadline.isCritical ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' : 'bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400'}`}>
                                <Hourglass size={10} /> 
                                {t('expires_in', lang)} {deadline.timeLeft}
                            </div>
                        )}
                        <div className="flex gap-2 md:gap-3">
                            <button onClick={onConfirm} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"><ThumbsUp size={14} /> {t('btn_confirm', lang)}</button>
                            <button onClick={onReject} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"><ThumbsDown size={14} /> {t('btn_reject', lang)}</button>
                        </div>
                    </div>
                );
            
            case 'confirmed':
                if (!onCollect) return null;
                return (
                    <div className="mt-3 flex flex-col items-center z-10 w-full animate-in zoom-in duration-300">
                        <button onClick={onCollect} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all">
                            <Key size={14} /> {t('btn_collect', lang)}
                        </button>
                    </div>
                );

            case 'collected':
                if (!onComplete) return null;
                return (
                    <div className="mt-3 flex flex-col items-center z-10 w-full animate-in zoom-in duration-300">
                        <button onClick={onComplete} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all">
                            <Flag size={14} /> {t('btn_complete', lang)}
                        </button>
                    </div>
                );

            case 'no_response':
               return (
                   <div className="mt-3 flex flex-col items-center z-10 w-full animate-in zoom-in duration-300">
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-3 rounded-xl mb-3 max-w-xs text-center">
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                {getNoResponseText()}
                            </p>
                        </div>
                        <div className="flex gap-2 md:gap-3">
                            {onRestart && (
                                <button onClick={onRestart} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all">
                                    <RefreshCcw size={14} /> {t('btn_restart', lang)}
                                </button>
                            )}
                            <button onClick={onReject} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all">
                                <X size={14} /> {t('btn_reject', lang)}
                            </button>
                        </div>
                   </div>
               );

            default:
                return null;
        }
    };

    return (
        <div className="flex-1 p-2 md:p-6 overflow-y-auto space-y-4 md:space-y-6 flex flex-col custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50 overscroll-contain">
            {filteredMessages.map((msg: ChatMessage, index: number) => {
                const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
                const isDifferentDay = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();

                return (
                    <React.Fragment key={msg.id}>
                        {isDifferentDay && (
                            <div className="flex justify-center my-4 md:my-6 sticky top-2 z-0">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
                                    {formatDateSeparator(msg.timestamp)}
                                </span>
                            </div>
                        )}

                        {msg.type === 'system' ? (
                            <div className="flex flex-col gap-1 my-2 animate-in fade-in slide-in-from-bottom-2 duration-300 px-2 md:px-12">
                                <div className="flex items-start gap-3 w-full justify-center">
                                    <div className="w-full flex flex-col items-center">
                                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mb-1">{formatTime(msg.timestamp)}</span>
                                        {msg.text && <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 italic text-center max-w-xs leading-snug whitespace-pre-wrap">{msg.text}</p>}
                                        
                                        {renderActions(msg.metadata?.status)}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={`message-wrapper flex gap-2 md:gap-3 max-w-[90%] md:max-w-[70%] animate-in fade-in slide-in-from-bottom-2 duration-200 ${msg.senderId === 'me' ? 'self-end flex-row-reverse' : 'self-start'}`} data-id={msg.id} data-status={msg.status} data-sender={msg.senderId}>
                                {msg.senderId !== 'me' && (
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-400 shadow-sm mt-auto overflow-hidden">
                                        {currentUser.avatar ? <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" /> : currentUser.name[0]}
                                    </div>
                                )}
                                <div className={`flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                                    {msg.type === 'image' && msg.attachmentUrl ? (
                                        <div className={`overflow-hidden rounded-2xl shadow-sm border border-black/5 dark:border-white/5 ${msg.senderId === 'me' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                                            <img src={msg.attachmentUrl} alt="Attachment" className="max-w-full max-h-[300px] object-cover bg-slate-100 dark:bg-slate-800" loading="lazy" />
                                        </div>
                                    ) : (
                                        <div className={`px-3 py-2 md:px-4 md:py-2.5 shadow-sm text-[13px] md:text-sm leading-relaxed ${
                                            msg.senderId === 'me' 
                                                ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl rounded-tr-sm shadow-blue-200/50' 
                                                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    )}
                                    
                                    {/* Action Buttons inside message bubble if any */}
                                    {msg.actions && msg.actions.length > 0 && (
                                        <div className={`flex flex-wrap gap-2 mt-1 ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.actions.map((action, i) => (
                                                <ActionButton key={i} action={action} isMe={msg.senderId === 'me'} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {msg.tags && msg.tags.length > 0 && (
                                        <div className={`flex gap-1 mt-1 ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.tags.filter(t => !t.startsWith('status:')).map((tag, i) => (
                                                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1.5 mt-1 px-1 text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-medium select-none">
                                        {msg.senderId === 'me' && msg.status === 'read' && <CheckCheck size={12} className="text-blue-500 dark:text-blue-400" />}
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