
import React from 'react';
import { 
    Play, Check, Clock, Target, CircleDashed, CheckCheck, X, 
    Wrench, Ban, AlertTriangle, HelpCircle, PowerOff
} from 'lucide-react';
import { LeaseStatus, Language } from '../../types';
import { GenericStatus } from '../../core/models';
import { t, TranslationKey } from '../../utils/i18n';

// --- TYPES ---
interface StatusConfig {
    bg: string;
    text: string;
    border: string;
    icon: React.ReactNode;
    labelKey: TranslationKey;
    accent: string;
}

// --- LEGACY CONFIG (Tied to LeaseStatus) ---
export const STATUS_CONFIG: Record<LeaseStatus, StatusConfig> = {
    collected: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/50', accent: 'bg-emerald-500', icon: <Play size={10} fill="currentColor" />, labelKey: 'status_collected' },
    completed: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700', accent: 'bg-slate-500', icon: <Check size={10} strokeWidth={3} />, labelKey: 'status_completed' },
    overdue: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800/50', accent: 'bg-rose-500', icon: <Clock size={10} />, labelKey: 'status_overdue' },
    confirmed: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800/50', accent: 'bg-indigo-500', icon: <Target size={10} />, labelKey: 'status_confirmed' },
    pending: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/50', accent: 'bg-amber-500', icon: <CircleDashed size={10} />, labelKey: 'status_pending' },
    confirmation_owner: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/50', accent: 'bg-blue-500', icon: <CheckCheck size={10} />, labelKey: 'status_wait_owner' },
    confirmation_rider: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800/50', accent: 'bg-violet-500', icon: <Check size={10} />, labelKey: 'status_wait_rider' },
    rejected: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800/50', accent: 'bg-red-500', icon: <X size={10} />, labelKey: 'status_rejected' },
    maintenance: { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700', accent: 'bg-gray-500', icon: <Wrench size={10} />, labelKey: 'status_maintenance' },
    cancelled: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800/50', accent: 'bg-red-500', icon: <Ban size={10} />, labelKey: 'status_cancelled' },
    conflict: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/50', accent: 'bg-orange-500', icon: <AlertTriangle size={10} />, labelKey: 'status_conflict' },
    no_response: { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700', accent: 'bg-slate-400', icon: <HelpCircle size={10} />, labelKey: 'status_no_response' }
};

// --- NEW GENERIC CONFIG (Tied to GenericStatus) ---
const GENERIC_STATUS_MAP: Record<GenericStatus, Omit<StatusConfig, 'labelKey'> & { labelKey: TranslationKey }> = {
    PENDING: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/50', accent: 'bg-amber-500', icon: <CircleDashed size={10} />, labelKey: 'gstatus_pending' },
    CONFIRMED: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800/50', accent: 'bg-indigo-500', icon: <Target size={10} />, labelKey: 'gstatus_confirmed' },
    ACTIVE: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/50', accent: 'bg-emerald-500', icon: <Play size={10} fill="currentColor" />, labelKey: 'gstatus_active' },
    COMPLETED: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700', accent: 'bg-slate-500', icon: <Check size={10} strokeWidth={3} />, labelKey: 'gstatus_completed' },
    CANCELLED: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800/50', accent: 'bg-red-500', icon: <Ban size={10} />, labelKey: 'gstatus_cancelled' }
};

const UNKNOWN_STATUS: Omit<StatusConfig, 'labelKey'> & { labelKey: TranslationKey } = {
    bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700', accent: 'bg-gray-400', icon: <HelpCircle size={10} />, labelKey: 'gstatus_unknown'
};

/**
 * Returns a complete, translated status configuration object for a given GenericStatus.
 * @param status - The GenericStatus of the booking.
 * @param lang - The current language.
 * @returns A translated config object with a `label` property.
 */
export const getGenericStatusConfig = (status: GenericStatus, lang: Language) => {
    const config = GENERIC_STATUS_MAP[status] || UNKNOWN_STATUS;
    return {
        ...config,
        label: t(config.labelKey, lang),
    };
};

// --- UTILITY FUNCTIONS ---
export const getLeaseProgress = (startStr: string, endStr: string) => {
    // ... (rest of the file remains unchanged)
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
