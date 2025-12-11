import React, { useRef, useEffect, useState, useMemo } from 'react';
import { CheckCheck, Check, ThumbsUp, ThumbsDown, Hourglass, Key, Flag, File, Download, AlertTriangle, AlertCircle, ExternalLink, MousePointerClick, Loader2, Radio } from 'lucide-react';
import { ChatMessage, ChatUser, Language, LeaseStatus, NtfyAction } from '../../types';
import { t } from '../../utils/i18n';
import { STATUS_CONFIG } from './ChatUtils';

interface ChatMessageListProps {
    messages: ChatMessage[];
    currentUser: ChatUser;
    onReadMessage: (id: string) => void;
    onConfirm: () => void;
    onReject: () => void;
    onCollect?: () => void;
    onComplete?: () => void;
    leaseStatus?: LeaseStatus;
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
                // Determine headers
                const headers: Record<string, string> = { ...action.headers };
                // If body is JSON, ensure content-type
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
        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700';

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
    leaseStatus,
    lang,
    deadline
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic
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

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        const k = 1024;
        const sizes = ['KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i - 1];
    };

    // Helper to render relevant actions based on message status context
    const renderActions = (msgStatus: LeaseStatus | undefined) => {
        // Only show actions if the message status matches the CURRENT lease status
        if (!msgStatus || msgStatus !== leaseStatus) return null;

        switch (msgStatus) {
            case 'confirmation_owner':
                return (
                    <div className="mt-3 flex flex-col items-center z-10 w-full animate-in zoom-in duration-300">
                        {deadline && deadline.hasDeadline && !deadline.isExpired && (
                            <div className={`mb-2 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${deadline.isCritical ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : 'bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'}`}>
                                <Hourglass size={10} /> 
                                {t('expires_in', lang)} {deadline.timeLeft}
                            </div>
                        )}
                        <div className="flex gap-2 md:gap-3">
                            <button onClick={onConfirm} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"><ThumbsUp size={14} /> {t('btn_confirm', lang)}</button>
                            <button onClick={onReject} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"><ThumbsDown size={14} /> {t('btn_reject', lang)}</button>
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
                        <button onClick={onComplete} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all">
                            <Flag size={14} /> {t('btn_complete', lang)}
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-6 flex flex-col custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50 overscroll-contain relative">
            
            {/* Empty State */}
            {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <p className="text-xs italic">No messages found.</p>
                </div>
            )}

            {messages.map((msg: ChatMessage, index: number) => {
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const isDifferentDay = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();
                const isHighPriority = msg.priority && msg.priority >= 4;
                const isUrgent = msg.priority === 5;

                return (
                    <React.Fragment key={msg.id}>
                        {isDifferentDay && (
                            <div className="flex justify-center my-4 md:my-6 sticky top-2 z-30 pointer-events-none">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
                                    {formatDateSeparator(msg.timestamp)}
                                </span>
                            </div>
                        )}

                        {msg.type === 'system' ? (
                            <div className="w-full flex flex-col items-center my-4 px-2 md:px-12">
                                <div className="flex items-center w-full gap-3 mb-2">
                                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                                    <div className="shrink-0">
                                        {msg.metadata?.status && STATUS_CONFIG[msg.metadata.status] ? (
                                            (() => {
                                                const config = STATUS_CONFIG[msg.metadata.status!];
                                                return (
                                                    <div className={`px-4 py-1.5 rounded-2xl border shadow-sm flex items-center gap-2 bg-white dark:bg-slate-800 ${config.border} ${config.text}`}>
                                                        {config.icon}
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{t(config.labelKey, lang)}</span>
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <div className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">System</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                                </div>

                                <div className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                    {formatShortDateStr(msg.timestamp)}, {formatTime(msg.timestamp)}
                                </div>

                                {msg.text && (
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic text-center max-w-sm">
                                        {msg.text}
                                    </p>
                                )}

                                {renderActions(msg.metadata?.status)}
                            </div>
                        ) : (
                            <div className={`message-wrapper flex gap-2 md:gap-3 max-w-[90%] md:max-w-[70%] ${msg.senderId === 'me' ? 'self-end flex-row-reverse' : 'self-start'}`} data-id={msg.id} data-status={msg.status} data-sender={msg.senderId}>
                                {msg.senderId !== 'me' && (
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm mt-auto overflow-hidden">
                                        {currentUser.avatar ? <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" /> : currentUser.name[0]}
                                    </div>
                                )}
                                
                                <div className="flex flex-col gap-1">
                                    {/* Message Bubble Container */}
                                    <div className={`flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                                        
                                        {/* PRIORITY LABEL */}
                                        {isHighPriority && (
                                            <div className={`flex items-center gap-1 text-[10px] font-bold mb-1 uppercase tracking-wide px-2 py-0.5 rounded-full ${isUrgent ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                                {isUrgent ? <AlertCircle size={10} /> : <AlertTriangle size={10} />}
                                                {isUrgent ? 'Urgent' : 'High Priority'}
                                            </div>
                                        )}

                                        {/* ATTACHMENT: IMAGE */}
                                        {msg.type === 'image' && msg.attachmentUrl && (
                                            <div className={`overflow-hidden rounded-2xl shadow-sm border border-black/5 dark:border-white/10 mb-1 ${msg.senderId === 'me' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                                                <img src={msg.attachmentUrl} alt={msg.attachment?.name || "Attachment"} className="max-w-full max-h-[300px] object-cover bg-slate-100 dark:bg-slate-800" loading="lazy" />
                                            </div>
                                        )}

                                        {/* ATTACHMENT: FILE */}
                                        {msg.type === 'file' && msg.attachment && (
                                            <a 
                                                href={msg.attachment.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={`flex items-center gap-3 p-3 rounded-xl border mb-1 transition-all group ${
                                                    msg.senderId === 'me' 
                                                        ? 'bg-blue-600 border-blue-500 text-white' 
                                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-lg ${msg.senderId === 'me' ? 'bg-blue-500/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                                    <File size={20} className={msg.senderId === 'me' ? 'text-white' : 'text-slate-500 dark:text-slate-400'} />
                                                </div>
                                                <div className="flex flex-col min-w-[100px]">
                                                    <span className="text-xs font-bold truncate max-w-[150px]">{msg.attachment.name}</span>
                                                    <span className={`text-[10px] ${msg.senderId === 'me' ? 'text-blue-100' : 'text-slate-400'}`}>
                                                        {formatFileSize(msg.attachment.size)}
                                                    </span>
                                                </div>
                                                <Download size={16} className={`opacity-70 group-hover:opacity-100 ${msg.senderId === 'me' ? 'text-white' : 'text-slate-400'}`} />
                                            </a>
                                        )}

                                        {/* TEXT BUBBLE */}
                                        {msg.text && (
                                            <div className={`px-3 py-2 md:px-4 md:py-2.5 shadow-sm text-[13px] md:text-sm leading-relaxed relative ${
                                                msg.senderId === 'me' 
                                                    ? `bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl rounded-tr-sm shadow-blue-200/50 dark:shadow-none ${isUrgent ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''}`
                                                    : `bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-sm shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] ${isUrgent ? 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10' : ''}`
                                            }`}>
                                                {msg.text}
                                            </div>
                                        )}

                                        {/* ACTION LINK */}
                                        {msg.clickUrl && (
                                            <a 
                                                href={msg.clickUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={`mt-1.5 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                                    msg.senderId === 'me'
                                                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                <ExternalLink size={12} />
                                                {t('btn_open_link', lang)}
                                            </a>
                                        )}

                                        {/* NTFY ACTIONS (Interactive Buttons) */}
                                        {msg.actions && msg.actions.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-1.5">
                                                {msg.actions.map((action, i) => (
                                                    <ActionButton 
                                                        key={i} 
                                                        action={action} 
                                                        isMe={msg.senderId === 'me'} 
                                                    />
                                                ))}
                                            </div>
                                        )}

                                    </div>

                                    {/* METADATA ROW: Time */}
                                    <div className={`flex flex-wrap items-center gap-2 mt-0.5 px-1 ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                                        <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-medium select-none">
                                            {msg.senderId === 'me' && msg.status === 'read' && <CheckCheck size={12} className="text-blue-500 dark:text-blue-400" />}
                                            {msg.senderId === 'me' && msg.status === 'sent' && <Check size={12} />}
                                            <span>{formatTime(msg.timestamp)}</span>
                                        </div>
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