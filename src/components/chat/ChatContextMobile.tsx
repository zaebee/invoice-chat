
import React from 'react';
import { Car, CalendarClock, Hourglass } from 'lucide-react';
import { IBooking } from '../../core/models';
import { Language } from '../../types';
import { StatusBadge } from './StatusBadge';
import { formatShortDate } from '../../utils/dateUtils';
import { t } from '../../utils/i18n';

interface ChatContextMobileProps {
    booking: IBooking;
    lang: Language;
    deadline?: {
        hasDeadline: boolean;
        isExpired: boolean;
        isCritical: boolean;
        timeLeft: string;
    };
}

export const ChatContextMobile: React.FC<ChatContextMobileProps> = ({ booking, lang, deadline }) => {
    return (
        <div className="block md:hidden bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b px-4 py-3 z-10 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg border text-slate-500 dark:text-slate-400 shrink-0 shadow-sm">
                        <Car size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {booking.resource.name}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                            {booking.resource.metadata.plate}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="block font-bold text-slate-800 dark:text-slate-200 text-sm">{booking.totalPrice.toLocaleString()} {booking.currency}</span>
                    <StatusBadge status={(booking.originalData as any)?.status || 'pending'} lang={lang} className="justify-end mt-1" />
                </div>
            </div>
            <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <CalendarClock size={12} />
                    <span className="font-medium">
                        {formatShortDate(booking.dateFrom, lang)}
                        <span className="text-slate-300 mx-1">→</span>
                        {formatShortDate(booking.dateTo, lang)}
                    </span>
                </div>
                {deadline && deadline.hasDeadline && !deadline.isExpired && (
                    <span className={`flex items-center gap-1 font-bold ${deadline.isCritical ? 'text-red-600' : 'text-orange-500'}`}>
                        <Hourglass size={10} /> {deadline.timeLeft}
                    </span>
                )}
            </div>
        </div>
    );
};
