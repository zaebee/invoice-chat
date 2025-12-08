

import React, { useEffect, useState, useMemo } from 'react';
import { useChatStore } from '../stores/chatStore';
import { Language, LeaseData } from '../types'; // Keep LeaseData for the temporary mapping
import { IBooking, IResource } from '../core/models'; // Import new models
import { mapLeaseToBooking } from '../domains/vehicle/adapters/reservationAdapter'; // Import the adapter
import { t } from '../utils/i18n';
import { Car, AlertTriangle, ChevronLeft, ChevronRight, CalendarDays, MapPin, Building, Wrench } from 'lucide-react';
import { STATUS_CONFIG, getGenericStatusConfig } from '../components/chat/ChatUtils'; // Will need to adapt this
import { useNavigate } from 'react-router-dom';

interface SchedulePageProps {
    lang: Language;
}

// --- CONSTANTS ---
const DAY_WIDTH = 60;
const BAR_HEIGHT = 42;
const BAR_GAP = 6;
const ROW_PADDING = 10;
const MIN_ROW_HEIGHT = 70;
const DAYS_TO_SHOW = 21;
const START_OFFSET = 2; // Days before today

// --- TYPES (Refactored) ---
interface LayoutMetrics {
    lane: number;
    left: number;
    width: number;
}

interface ProcessedBooking extends IBooking {
    layout: LayoutMetrics;
}

interface ResourceGroup {
    id: string;
    resource: IResource; // Store the full resource object
    bookings: ProcessedBooking[];
    laneCount: number;
    rowHeight: number;
}

// --- HELPER HOOK (Refactored to use IBooking) ---
const useTimelineLayout = (bookings: IBooking[], startDate: Date, tick: number) => {
    return useMemo(() => {
        // 1. Determine Timeline Start (Midnight)
        const timelineStart = new Date(startDate);
        timelineStart.setDate(timelineStart.getDate() - START_OFFSET);
        timelineStart.setHours(0, 0, 0, 0);

        // 2. Group by Resource ID
        const rawGroups: Record<string, IBooking[]> = {};
        
        bookings.forEach(b => {
            const key = b.resource.id;
            if (!rawGroups[key]) rawGroups[key] = [];
            rawGroups[key].push(b);
        });

        // 3. Process Each Group
        const groups: ResourceGroup[] = Object.values(rawGroups).map((groupBookings) => {
            if (groupBookings.length === 0) return null;
            const resource = groupBookings[0].resource; // All bookings in group share the same resource

            // A. Calculate Raw Positions (Time -> Pixels)
            const items = groupBookings.map(booking => {
                let start = booking.dateFrom;
                let end = booking.dateTo;

                // Handle Overdue: Extend to NOW to show blockage
                if (booking.status === 'ACTIVE' && (booking.originalData as LeaseData)?.status === 'overdue') {
                    const now = new Date();
                    if (now > end) end = now;
                }

                // Use exact timestamps for precision
                const startMs = start.getTime();
                const endMs = end.getTime();

                // Calculate pixels
                const startDiffMs = startMs - timelineStart.getTime();
                const durationMs = endMs - startMs;
                
                const msPerDay = 1000 * 60 * 60 * 24;
                const left = (startDiffMs / msPerDay) * DAY_WIDTH;
                const width = (durationMs / msPerDay) * DAY_WIDTH;

                return { booking, startMs, endMs, left, width };
            });

            // B. Sort for Packing (Earliest start)
            items.sort((a, b) => a.startMs - b.startMs);

            // C. "Tetris" Packing Algorithm
            const lanes: number[] = []; // Stores the end time (ms) of the last block in each lane
            
            const processedBookings: ProcessedBooking[] = items.map(item => {
                let assignedLane = -1;
                for (let i = 0; i < lanes.length; i++) {
                    if (lanes[i] <= item.startMs) {
                        assignedLane = i;
                        lanes[i] = item.endMs;
                        break;
                    }
                }
                if (assignedLane === -1) {
                    assignedLane = lanes.length;
                    lanes.push(item.endMs);
                }

                return {
                    ...item.booking,
                    layout: { lane: assignedLane, left: item.left, width: Math.max(item.width, 10) }
                };
            });

            // D. Calculate Row Metrics
            const laneCount = Math.max(1, lanes.length);
            const contentHeight = (laneCount * (BAR_HEIGHT + BAR_GAP)) - BAR_GAP;
            const rowHeight = Math.max(MIN_ROW_HEIGHT, contentHeight + (ROW_PADDING * 2));

            return { id: resource.id, resource, bookings: processedBookings, laneCount, rowHeight };
        }).filter((g): g is ResourceGroup => g !== null);

        // 4. Sort Groups Alphabetically by resource name
        groups.sort((a, b) => a.resource.name.localeCompare(b.resource.name));

        return { groups, timelineStart };
    }, [bookings, startDate, tick]);
};

// --- SUB-COMPONENTS ---

const CurrentTimeIndicator = ({ startOffset, dayWidth }: { startOffset: number; dayWidth: number }) => {
    const [nowOffset, setNowOffset] = useState(-1);
    useEffect(() => {
        const update = () => {
            const now = Date.now();
            const diffDays = (now - startOffset) / (1000 * 60 * 60 * 24);
            setNowOffset(diffDays * dayWidth);
        };
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, [startOffset, dayWidth]);

    if (nowOffset < 0) return null;
    return (
        <div className="absolute top-0 bottom-0 w-px bg-red-500 z-30 pointer-events-none" style={{ left: nowOffset }}>
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-[4px] mt-11 shadow-sm ring-2 ring-white dark:ring-slate-900" />
        </div>
    );
};

const ResourceIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'vehicle': return <Car size={20} />;
        case 'property': return <Building size={20} />;
        case 'equipment': return <Wrench size={20} />;
        default: return <Car size={20} />;
    }
}

// --- MAIN COMPONENT ---

const SchedulePage: React.FC<SchedulePageProps> = ({ lang }) => {
    const navigate = useNavigate();
    const { sessions, isHydrated, hydrate } = useChatStore();
    const [startDate, setStartDate] = useState(new Date());
    const [hoveredBookingId, setHoveredBookingId] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [tick, setTick] = useState(0);

    // --- TEMPORARY DATA TRANSFORMATION ---
    // This bridges the old chatStore data to the new IBooking model.
    // This will be replaced by a call to a new `useBookingStore` hook later.
    const allBookings = useMemo(() => {
        if (!isHydrated) return [];
        return sessions
            .filter(s => !s.isArchived && s.reservationSummary) // Ensure summary exists
            .map(s => {
                // This is a bit of a hack: we reconstruct a partial LeaseData object
                // from the session and summary to pass to the adapter.
                const summary = s.reservationSummary!;
                const partialLease: Partial<LeaseData> = {
                    reservationId: s.id,
                    status: summary.status,
                    vehicle: { name: summary.vehicleName, plate: summary.plateNumber, details: '' },
                    renter: { surname: s.user.name, contact: '', passport: '' },
                    owner: { surname: 'Owner', contact: '', address: '' },
                    pickup: { date: summary.pickupDate || '', time: '', fee: 0 },
                    dropoff: { date: summary.dropoffDate || '', time: '', fee: 0 },
                    exactPickupDate: summary.exactPickupDate,
                    exactDropoffDate: summary.exactDropoffDate,
                    pricing: { total: summary.price, currency: summary.currency || 'THB', deposit: 0, daysRegular: 0, priceRegular: 0, daysSeason: 0, priceSeason: 0 },
                };
                return mapLeaseToBooking(partialLease as LeaseData);
            });
    }, [sessions, isHydrated]);
    // --- END TEMPORARY DATA TRANSFORMATION ---

    useEffect(() => {
        const t = setInterval(() => setTick(n => n + 1), 60000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => { if (!isHydrated) hydrate(); }, [isHydrated, hydrate]);

    const { groups: resourceGroups, timelineStart } = useTimelineLayout(allBookings, startDate, tick);

    const days = useMemo(() => Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
        const d = new Date(timelineStart);
        d.setDate(d.getDate() + i);
        return d;
    }), [timelineStart]);

    const shiftDate = (days: number) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + days);
        setStartDate(d);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 shadow-sm relative shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                        <CalendarDays className="text-blue-600 dark:text-blue-400" />
                        <h2 className="text-xl font-bold">{t('sched_title', lang)}</h2>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button onClick={() => shiftDate(-7)} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm"><ChevronLeft size={16} /></button>
                        <button onClick={() => setStartDate(new Date())} className="px-3 text-xs font-bold hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm">{t('sched_today', lang)}</button>
                        <button onClick={() => shiftDate(7)} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Timeline Grid */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50 relative overscroll-contain">
                <div className="min-w-max">
                    {/* Header Row */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-sm">
                        <div className="w-60 md:w-72 shrink-0 p-3 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 sticky left-0 z-[60] font-bold text-xs uppercase tracking-wider">
                            {t('grp_resource', lang) || 'Resource'}
                        </div>
                        <div className="flex relative">
                            {days.map((d, i) => {
                                const isToday = d.toDateString() === new Date().toDateString();
                                return (
                                    <div key={i} className={`shrink-0 border-r border-slate-100 dark:border-slate-800 p-2 text-center ${isToday ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''}`} style={{ width: DAY_WIDTH }}>
                                        <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : ''}`}>{d.getDate()}</div>
                                    </div>
                                );
                            })}
                            <CurrentTimeIndicator startOffset={timelineStart.getTime()} dayWidth={DAY_WIDTH} />
                        </div>
                    </div>

                    {/* Data Rows */}
                    <div>
                        {resourceGroups.map((group) => (
                            <div key={group.id} className="flex border-b border-slate-200/60 dark:border-slate-800/60" style={{ height: group.rowHeight }}>
                                {/* Sticky Resource Name */}
                                <div className="w-60 md:w-72 shrink-0 p-4 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky left-0 z-40">
                                    <div className="font-bold text-sm truncate">{group.resource.name}</div>
                                    <div className="text-xs text-slate-500">{group.resource.metadata.plate || group.id}</div>
                                </div>
                                {/* Timeline Track */}
                                <div className="relative flex" style={{ width: days.length * DAY_WIDTH }}>
                                    {/* Bookings */}
                                    {group.bookings.map(booking => {
                                        const { left, width, lane } = booking.layout;
                                        if (left + width < 0) return null;

                                        const config = getGenericStatusConfig(booking.status, lang);
                                        const top = ROW_PADDING + (lane * (BAR_HEIGHT + BAR_GAP));

                                        return (
                                            <div
                                                key={booking.id}
                                                onClick={() => navigate(`/chat/detail/${booking.id}`)}
                                                onMouseEnter={(e) => { setHoveredBookingId(booking.id); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                                                onMouseLeave={() => setHoveredBookingId(null)}
                                                className={`absolute rounded-xl border shadow-sm cursor-pointer hover:scale-[1.01] hover:shadow-lg hover:z-20 transition-all flex items-center px-3 gap-2 overflow-hidden ${config.bg} ${config.border}`}
                                                style={{ left: Math.max(0, left), width: Math.max(width - 2, 4), height: BAR_HEIGHT, top, zIndex: 10 + lane }}
                                            >
                                                <div className="text-[10px] font-bold truncate text-slate-800 dark:text-slate-100">{booking.client.name}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {hoveredBookingId && (
                <div 
                    className="fixed z-[100] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border p-4 w-64 pointer-events-none"
                    style={{ left: Math.min(tooltipPos.x + 20, window.innerWidth - 280), top: Math.min(tooltipPos.y + 20, window.innerHeight - 150) }}
                >
                    {(() => {
                        const booking = allBookings.find(b => b.id === hoveredBookingId);
                        if (!booking) return null;
                        const config = getGenericStatusConfig(booking.status, lang);
                        return (
                            <>
                                <h4 className="font-bold text-sm">{booking.client.name}</h4>
                                <div className={`text-xs inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full ${config.bg} ${config.text} ${config.border}`}>{config.icon} {config.label}</div>
                                <div className="text-xs mt-2 text-slate-600 dark:text-slate-400">
                                    {booking.dateFrom.toLocaleDateString()} - {booking.dateTo.toLocaleDateString()}
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default SchedulePage;
