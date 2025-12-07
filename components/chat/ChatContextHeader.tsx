

import React from 'react';
import { Car, CalendarClock, Hourglass } from 'lucide-react';
import { LeaseData, Language } from '../../types';
import { StatusBadge } from './StatusBadge';
import { STATUS_CONFIG, getLeaseProgress, getTimeRemaining } from './ChatUtils';
import { formatShortDate } from '../../utils/dateUtils';
import { t } from '../../utils/i18n';

interface ChatContextHeaderProps {
    leaseData: LeaseData;
    lang: Language;
    deadline?: {
        hasDeadline: boolean;
        isExpired: boolean;
        isCritical: boolean;
        timeLeft: string;
    };
}

export const ChatContextHeader: React.FC<ChatContextHeaderProps> = ({ leaseData, lang, deadline }) => {
    const statusConfig = STATUS_CONFIG[leaseData.status || 'pending'] || STATUS_CONFIG['pending'];
    const timelineProgress = getLeaseProgress(leaseData.pickup.date, leaseData.dropoff.date);
    const smartTime = getTimeRemaining(leaseData.dropoff.date, leaseData.status || 'pending', lang);

    return (
        <div className={`hidden md:block backdrop-blur-xl bg-white/90 border-b border-slate-200/50 pt-3 pb-0 shrink-0 z-10 sticky top-0 transition-all shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)]`}>
            <div className="px-4 pb-3 flex justify-between items-start gap-4">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="relative shrink-0 pt-0.5">
                        <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 overflow-hidden">
                            {leaseData.vehicle.imageUrl ? (
                                <img src={leaseData.vehicle.imageUrl} alt={leaseData.vehicle.name} className="w-full h-full object-cover" />
                            ) : (
                                <Car size={20} strokeWidth={1.5} />
                            )}
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
                        <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{t('timeline_title', lang)}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5 truncate w-full justify-center">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                            {leaseData.pickup.date ? (
                                <>{formatShortDate(leaseData.pickup.date, lang)}<span className="text-slate-300 mx-1.5">→</span>{formatShortDate(leaseData.dropoff.date, lang)}</>
                            ) : <span className="text-slate-400 italic">{t('no_dates', lang)}</span>}
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
                        <StatusBadge status={leaseData.status || 'pending'} lang={lang} />
                    </div>
                    {deadline && deadline.hasDeadline && !deadline.isExpired && (
                        <div className={`text-[10px] font-bold mt-0.5 flex items-center gap-1 ${deadline.isCritical ? 'text-red-500' : 'text-orange-500'}`}>
                            <Hourglass size={10} /> {deadline.timeLeft} {t('left_to_action', lang)}
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full h-[3px] bg-slate-100 relative overflow-hidden">
                <div className={`h-full transition-all duration-1000 ease-out ${statusConfig.accent}`} style={{ width: `${timelineProgress}%` }}>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50"></div>
                </div>
            </div>
        </div>
    );
};