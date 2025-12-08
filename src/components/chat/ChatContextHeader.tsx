
import React from 'react';
import { Car, CalendarClock, Hourglass } from 'lucide-react';
import { IBooking } from '../../core/models'; // Import IBooking
import { Language } from '../../types';
import { StatusBadge } from './StatusBadge'; // This will need to be refactored or adapted
import { getGenericStatusConfig } from './ChatUtils';
import { formatShortDate } from '../../utils/dateUtils';
import { t } from '../../utils/i18n';

interface ChatContextHeaderProps {
    booking: IBooking; // Changed from leaseData
    lang: Language;
    deadline?: {
        hasDeadline: boolean;
        isExpired: boolean;
        isCritical: boolean;
        timeLeft: string;
    };
}

// A simple helper to calculate progress. In a real app, this might be more sophisticated.
const getBookingProgress = (start: Date, end: Date) => {
    const now = Date.now();
    if (now < start.getTime()) return 0;
    if (now > end.getTime()) return 100;
    const total = end.getTime() - start.getTime();
    const elapsed = now - start.getTime();
    return (elapsed / total) * 100;
};

export const ChatContextHeader: React.FC<ChatContextHeaderProps> = ({ booking, lang, deadline }) => {
    // Use the new generic status config
    const statusConfig = getGenericStatusConfig(booking.status, lang);
    const timelineProgress = getBookingProgress(booking.dateFrom, booking.dateTo);

    return (
        <div className={`hidden md:block backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/50 dark:border-slate-800 pt-3 pb-0 shrink-0 z-10 sticky top-0`}>
            <div className="px-4 pb-3 flex justify-between items-start gap-4">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="relative shrink-0 pt-0.5">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden">
                            {booking.resource.metadata.imageUrl ? (
                                <img src={booking.resource.metadata.imageUrl} alt={booking.resource.name} className="w-full h-full object-cover" />
                            ) : (
                                <Car size={20} />
                            )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white dark:border-slate-900 ${statusConfig.accent}`}></div>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">{booking.resource.name}</h4>
                        <span className="text-xs font-mono text-slate-500">{booking.resource.metadata.plate}</span>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center min-w-0 px-2 flex-1">
                     <div className="flex items-baseline gap-1.5 truncate w-full justify-center">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {formatShortDate(booking.dateFrom, lang)}<span className="text-slate-300 mx-1.5">→</span>{formatShortDate(booking.dateTo, lang)}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-400 font-mono">#{booking.id}</span>
                        {/* StatusBadge may need refactoring to accept GenericStatus */}
                        <StatusBadge status={(booking.originalData as any)?.status || 'pending'} lang={lang} />
                    </div>
                    {deadline && deadline.hasDeadline && !deadline.isExpired && (
                        <div className={`text-xs font-bold mt-0.5 flex items-center gap-1 ${deadline.isCritical ? 'text-red-500' : 'text-orange-500'}`}>
                            <Hourglass size={10} /> {deadline.timeLeft}
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full h-[3px] bg-slate-100 dark:bg-slate-800 relative">
                <div className={`h-full transition-all ${statusConfig.accent}`} style={{ width: `${timelineProgress}%` }}></div>
            </div>
        </div>
    );
};
