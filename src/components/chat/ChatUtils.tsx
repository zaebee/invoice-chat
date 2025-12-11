import React from 'react';
import { 
    Play, Check, Clock, Target, CircleDashed, CheckCheck, X, 
    Wrench, Ban, AlertTriangle, HelpCircle 
} from 'lucide-react';
import { LeaseStatus, Language } from '../../types';
import { t, TranslationKey } from '../../utils/i18n';

export const STATUS_CONFIG: Record<LeaseStatus, { bg: string, text: string, border: string, icon: React.ReactNode, labelKey: TranslationKey, accent: string }> = {
    collected: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        accent: 'bg-emerald-500',
        icon: <Play size={10} fill="currentColor" />,
        labelKey: 'status_collected'
    },
    completed: {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-200',
        accent: 'bg-slate-500',
        icon: <Check size={10} strokeWidth={3} />,
        labelKey: 'status_completed'
    },
    overdue: {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-200',
        accent: 'bg-rose-500',
        icon: <Clock size={10} />,
        labelKey: 'status_overdue'
    },
    confirmed: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        accent: 'bg-indigo-500',
        icon: <Target size={10} />,
        labelKey: 'status_confirmed'
    },
    pending: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200',
        accent: 'bg-amber-500',
        icon: <CircleDashed size={10} />,
        labelKey: 'status_pending'
    },
    confirmation_owner: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        accent: 'bg-blue-500',
        icon: <CheckCheck size={10} />,
        labelKey: 'status_wait_owner'
    },
    confirmation_rider: {
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        border: 'border-violet-200',
        accent: 'bg-violet-500',
        icon: <Check size={10} />,
        labelKey: 'status_wait_rider'
    },
    rejected: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200',
        accent: 'bg-red-500',
        icon: <X size={10} />,
        labelKey: 'status_rejected'
    },
    maintenance: {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
        accent: 'bg-gray-500',
        icon: <Wrench size={10} />,
        labelKey: 'status_maintenance'
    },
    cancelled: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200',
        accent: 'bg-red-500',
        icon: <Ban size={10} />,
        labelKey: 'status_cancelled'
    },
    conflict: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        accent: 'bg-orange-500',
        icon: <AlertTriangle size={10} />,
        labelKey: 'status_conflict'
    },
    no_response: {
        bg: 'bg-slate-50',
        text: 'text-slate-500',
        border: 'border-slate-200',
        accent: 'bg-slate-400',
        icon: <HelpCircle size={10} />,
        labelKey: 'status_no_response'
    }
};

export const getLeaseProgress = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = Date.now();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
};

export const getTimeRemaining = (endStr: string, status: LeaseStatus, lang: Language) => {
    if (!endStr) return '';
    const end = new Date(endStr);
    const now = new Date();
    const diffHours = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffHours / 24);

    if (status === 'completed' || status === 'cancelled') return t('time_ended', lang);
    if (status === 'overdue') return `${t('time_overdue_by', lang)} ${Math.abs(diffDays)}d`;
    
    if (diffHours < 0) return t('time_ending_now', lang);
    if (diffHours < 24) return `${t('time_ends_in', lang)} ${Math.floor(diffHours)}h`;
    return `${diffDays} ${t('time_days_left', lang)}`;
};