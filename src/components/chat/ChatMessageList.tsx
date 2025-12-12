import React, { useRef, useEffect, useState, useMemo } from 'react';
import { CheckCheck, Check, ThumbsUp, ThumbsDown, Hourglass, Key, Flag, File, Download, AlertTriangle, AlertCircle, ExternalLink, Tag, MousePointerClick, Loader2, Banknote, Radio, Filter, X, RefreshCcw } from 'lucide-react';
import { ChatMessage, ChatUser, Language, LeaseStatus, NtfyAction, NoResponseMeta } from '../../types';
import { t, TranslationKey } from '../../utils/i18n';
import { STATUS_CONFIG } from './ChatUtils';

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

const TAG_STYLES: Record<string, { icon: React.ReactNode, className: string, label?: string }> = {
    '+1': { 
        icon: <ThumbsUp size={10} />, 
        className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400',
        label: 'Ack' 
    },
    'white_check_mark': { 
        icon: <Check size={10} />, 
        className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400',
        label: 'Done'
    },
    'moneybag': { 
        icon: <Banknote size={10} />, 
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400',
        label: 'Paid'
    },
    'warning': { 
        icon: <AlertTriangle size={10} />, 
        className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400',
        label: 'Issue'
    }
};

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
    const [showFilters, setShowFilters] = useState(false);
    const [filterPriority, setFilterPriority] = useState(false);
    const [filterTag, setFilterTag] = useState('');

    const filteredMessages = useMemo(() => {
        return messages.filter(msg => {
            if (filterPriority && (!msg.priority || msg.priority < 4)) return false;
            if (filterTag && !msg.tags?.some(t => t.toLowerCase().includes(filterTag.toLowerCase()))) return false;
            return true;
        });
    }, [messages, filterPriority, filterTag]);

    // Auto-scroll logic: Only scroll if no filter active or if forced
    useEffect(() => {
        if (!filterPriority && !filterTag) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, filterPriority, filterTag]);

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
    }, [filteredMessages, onReadMessage]);

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
                    <div className="mt-3 flex flex-col items-center z-10 w-full animate-in zoom-in duration-300