

import React from 'react';
import { Car, CalendarClock, Hourglass } from 'lucide-react';
import { LeaseData, Language } from '../../types';
import { StatusBadge } from './StatusBadge';
import { formatShortDate } from '../../utils/dateUtils';
import { t } from '../../utils/i18n';
import { getTimeRemaining } from './ChatUtils';

interface ChatContextMobileProps {
    leaseData: LeaseData;
    lang: Language;
    deadline?: {
        hasDeadline: boolean;
        isExpired: boolean;
        isCritical: boolean;
        timeLeft: string;
    };
}

export const ChatContextMobile: React.FC<ChatContextMobileProps> = ({ leaseData, lang, deadline }) => {
    const smartTime = getTimeRemaining(leaseData.dropoff.date, leaseData.status || 'pending', lang);

    return (
        <div className="block md:hidden bg-slate-50/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 z-10 shadow-sm">
            {/* Row 1: Vehicle & Price */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 shrink-0 shadow-sm bg-white overflow-hidden flex items-center justify-center">
                        {leaseData.vehicle.imageUrl ? (
                            <img src={leaseData.vehicle.imageUrl} alt={leaseData.vehicle.name} className="w-full h-full object-cover" />
                        ) : (
                            <Car size={14} />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                            {leaseData.vehicle.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-200/50 px-1 rounded w-fit mt-0.5">
                            {leaseData.vehicle.plate}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="block font-bold text-slate-800 text-sm">{leaseData.pricing.total.toLocaleString()} {leaseData.pricing.currency || 'THB'}</span>
                    <StatusBadge status={leaseData.status || 'pending'} lang={lang} className="justify-end mt-1" />
                </div>
            </div>

            {/* Row 2: Timeline & Deadline */}
            <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600 bg-white/50 px-2 py-1 rounded-md border border-slate-100">
                    <CalendarClock size={12} className="text-slate-400" />
                    {leaseData.pickup.date ? (
                        <span className="font-medium">
                            {formatShortDate(leaseData.pickup.date, lang)} 
                            <span className="text-slate-300 mx-1">→</span> 
                            {formatShortDate(leaseData.dropoff.date, lang)}
                        </span>
                    ) : (
                        <span className="text-slate-400 italic">{t('no_dates', lang)}</span>
                    )}
                </div>

                {/* Deadline or Time Remaining */}
                <div className="flex items-center gap-1.5">
                    {deadline && deadline.hasDeadline && !deadline.isExpired ? (
                        <span className={`flex items-center gap-1 font-bold ${deadline.isCritical ? 'text-red-600' : 'text-orange-500'}`}>
                            <Hourglass size={10} /> {deadline.timeLeft}
                        </span>
                    ) : (
                        <span className="text-slate-400 font-medium">
                            {smartTime}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};