
import React from 'react';
import { 
    Play, Check, Clock, Target, CircleDashed, CheckCheck, X, 
    Wrench, Ban, AlertTriangle, HelpCircle 
} from 'lucide-react';
import { LeaseStatus } from '../../types';

export const STATUS_CONFIG: Record<LeaseStatus, { bg: string, text: string, border: string, icon: React.ReactNode, label: string, accent: string }> = {
    collected: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        accent: 'bg-emerald-500',
        icon: <Play size={10} fill="currentColor" />,
        label: 'Collected'
    },
    completed: {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-200',
        accent: 'bg-slate-500',
        icon: <Check size={10} strokeWidth={3} />,
        label: 'Completed'
    },
    overdue: {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-200',
        accent: 'bg-rose-500',
        icon: <Clock size={10} />,
        label: 'Overdue'
    },
    confirmed: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        accent: 'bg-indigo-500',
        icon: <Target size={10} />,
        label: 'Confirmed'
    },
    pending: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200',
        accent: 'bg-amber-500',
        icon: <CircleDashed size={10} />,
        label: 'Pending'
    },
    confirmation_owner: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        accent: 'bg-blue-500',
        icon: <CheckCheck size={10} />,
        label: 'Wait Owner'
    },
    confirmation_rider: {
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        border: 'border-violet-200',
        accent: 'bg-violet-500',
        icon: <Check size={10} />,
        label: 'Wait Rider'
    },
    rejected: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200',
        accent: 'bg-red-500',
        icon: <X size={10} />,
        label: 'Rejected'
    },
    maintenance: {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
        accent: 'bg-gray-500',
        icon: <Wrench size={10} />,
        label: 'Maintenance'
    },
    cancelled: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200',
        accent: 'bg-red-500',
        icon: <Ban size={10} />,
        label: 'Cancelled'
    },
    conflict: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        accent: 'bg-orange-500',
        icon: <AlertTriangle size={10} />,
        label: 'Conflict'
    },
    no_response: {
        bg: 'bg-slate-50',
        text: 'text-slate-500',
        border: 'border-slate-200',
        accent: 'bg-slate-400',
        icon: <HelpCircle size={10} />,
        label: 'No Response'
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

export const getTimeRemaining = (endStr: string, status: LeaseStatus) => {
    if (!endStr) return '';
    const end = new Date(endStr);
    const now = new Date();
    const diffHours = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffHours / 24);

    if (status === 'completed' || status === 'cancelled') return 'Ended';
    if (status === 'overdue') return `Overdue by ${Math.abs(diffDays)}d`;
    
    if (diffHours < 0) return 'Ending now';
    if (diffHours < 24) return `Ends in ${Math.floor(diffHours)}h`;
    return `${diffDays} days left`;
};

export const StatusBadge = ({ status, className = "" }: { status: LeaseStatus, className?: string }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];
    return (
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border} ${className}`}>
            {config.icon}
            <span>{config.label}</span>
        </div>
    );
};
