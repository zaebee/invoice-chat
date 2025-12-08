
import React, { useEffect, useState, useMemo } from 'react';
import { useChatStore } from '../stores/chatStore';
import { Language, ChatSession } from '../types';
import { t } from '../utils/i18n';
import { Car, AlertTriangle, ChevronLeft, ChevronRight, CalendarDays, MapPin } from 'lucide-react';
import { STATUS_CONFIG } from '../components/chat/ChatUtils';
import { useNavigate } from 'react-router-dom';

interface SchedulePageProps {
    lang: Language;
}

// Layout Constants
const DAY_WIDTH = 60; // Pixels per day
const BAR_HEIGHT = 42; // Height of the booking bar
const BAR_GAP = 6; // Vertical gap between stacked bars
const ROW_PADDING = 10; // Top/Bottom padding for the row
const MIN_ROW_HEIGHT = 70; // Minimum height for a vehicle row

interface ProcessedSession extends ChatSession {
    tempStart: number;
    tempEnd: number;
    layout: {
        lane: number;
        startDayOffset: number;
        durationDays: number;
        left: number;
        width: number;
    };
}

interface VehicleGroup {
    id: string;
    name: string;
    plate: string;
    bookings: ProcessedSession[];
    laneCount: number;
    rowHeight: number;
}

const CurrentTimeIndicator = ({ startOffset, dayWidth }: { startOffset: number; dayWidth: number }) => {
    const [nowOffset, setNowOffset] = useState(0);

    useEffect(() => {
        const calculatePos = () => {
            const now = new Date();
            const diff = now.getTime() - startOffset;
            const daysPassed = diff / (1000 * 60 * 60 * 24);
            setNowOffset(daysPassed * dayWidth);
        };

        calculatePos();
        const timer = setInterval(calculatePos, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [startOffset, dayWidth]);

    if (nowOffset < 0) return null;

    return (
        <div 
            className="absolute top-0 bottom-0 w-px bg-red-500 z-30 pointer-events-none"
            style={{ left: nowOffset }}
        >
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-[4px] mt-11 shadow-sm ring-2 ring-white dark:ring-slate-900" />
        </div>
    );
};

const SchedulePage: React.FC<SchedulePageProps> = ({ lang }) => {
    const { sessions, isHydrated, hydrate } = useChatStore();
    const navigate = useNavigate();
    const [hoveredSession, setHoveredSession] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    
    // Timeline Settings
    const DAYS_TO_SHOW = 21; // Total days visible
    const START_OFFSET = 2; // Days before today
    const [startDate, setStartDate] = useState(new Date());

    useEffect(() => {
        if (!isHydrated) hydrate();
    }, [isHydrated, hydrate]);

    // 1. Calculate Timeline Range
    const timelineStart = useMemo(() => {
        const d = new Date(startDate);
        d.setDate(d.getDate() - START_OFFSET);
        d.setHours(0, 0, 0, 0);
        return d;
    }, [startDate]);

    // 2. Process Data: Group -> Sort -> Pack (Assign Lanes)
    const vehicleGroups = useMemo<VehicleGroup[]>(() => {
        const rawGroups: Record<string, ChatSession[]> = {};
        
        // Group by Vehicle
        sessions.forEach(s => {
            if (s.isArchived) return;
            
            const summary = s.reservationSummary;
            const plate = summary?.plateNumber || 'Unknown';
            const vehicleName = summary?.vehicleName || 'Unknown Vehicle';
            const key = `${vehicleName}::${plate}`;
            
            if (!rawGroups[key]) rawGroups[key] = [];
            rawGroups[key].push(s);
        });

        // Process each group
        return Object.entries(rawGroups).map(([key, groupSessions]) => {
            const [name, plate] = key.split('::');

            // A. Calculate basic positions
            const positionedSessions = groupSessions.map(session => {
                const summary = session.reservationSummary;
                let start: Date, end: Date;

                if (summary && summary.pickupDate && summary.dropoffDate) {
                    start = new Date(summary.pickupDate);
                    end = new Date(summary.dropoffDate);
                } else {
                    // Fallback
                    start = new Date(session.lastMessageTime);
                    end = new Date(start);
                    end.setDate(end.getDate() + 3);
                }
                
                // Normalize to midnight
                const sTime = new Date(start); sTime.setHours(0,0,0,0);
                const eTime = new Date(end); eTime.setHours(0,0,0,0);

                const startDiff = (sTime.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
                const duration = Math.ceil((eTime.getTime() - sTime.getTime()) / (1000 * 60 * 60 * 24)) || 1;

                return {
                    ...session,
                    tempStart: sTime.getTime(),
                    tempEnd: eTime.getTime(),
                    layout: {
                        startDayOffset: startDiff,
                        durationDays: duration,
                        left: startDiff * DAY_WIDTH,
                        width: duration * DAY_WIDTH,
                        lane: 0 // Will be assigned next
                    }
                };
            });

            // B. Pack (Assign Lanes) - "Tetris Algorithm"
            // Sort by start time first, then by duration (longer first usually packs better)
            positionedSessions.sort((a, b) => a.tempStart - b.tempStart || b.layout.durationDays - a.layout.durationDays);

            const lanes: number[] = []; // Stores the end time of the last block in each lane

            positionedSessions.forEach(session => {
                let placed = false;
                // Try to fit in existing lanes
                for (let i = 0; i < lanes.length; i++) {
                    if (lanes[i] <= session.tempStart) {
                        session.layout.lane = i;
                        lanes[i] = session.tempEnd;
                        placed = true;
                        break;
                    }
                }
                // Create new lane if needed
                if (!placed) {
                    session.layout.lane = lanes.length;
                    lanes.push(session.tempEnd);
                }
            });

            const laneCount = Math.max(1, lanes.length);
            // Calculate dynamic height: Padding Top + (Lanes * (Bar + Gap)) + Padding Bottom - Last Gap
            const contentHeight = (laneCount * (BAR_HEIGHT + BAR_GAP)) - BAR_GAP;
            const rowHeight = Math.max(MIN_ROW_HEIGHT, contentHeight + (ROW_PADDING * 2));

            return {
                id: key,
                name,
                plate,
                bookings: positionedSessions,
                laneCount,
                rowHeight
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

    }, [sessions, timelineStart]);

    // Timeline Grid Generation
    const days = useMemo(() => {
        const result = [];
        for (let i = 0; i < DAYS_TO_SHOW; i++) {
            const d = new Date(timelineStart);
            d.setDate(d.getDate() + i);
            result.push(d);
        }
        return result;
    }, [timelineStart]);

    const handlePrev = () => {
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() - 7);
        setStartDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() + 7);
        setStartDate(newDate);
    };

    const handleToday = () => {
        setStartDate(new Date());
    };

    const isToday = (d: Date) => {
        return d.toDateString() === new Date().toDateString();
    };

    const isWeekend = (d: Date) => {
        const day = d.getDay();
        return day === 0 || day === 6; // Sun or Sat
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 shadow-sm relative shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                        <CalendarDays className="text-blue-600 dark:text-blue-400" />
                        <h2 className="text-xl font-bold">{t('sched_title', lang)}</h2>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button onClick={handlePrev} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm text-slate-600 dark:text-slate-400 transition-all"><ChevronLeft size={16} /></button>
                        <button onClick={handleToday} className="px-3 text-xs font-bold hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm text-slate-700 dark:text-slate-300 transition-all">{t('sched_today', lang)}</button>
                        <button onClick={handleNext} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm text-slate-600 dark:text-slate-400 transition-all"><ChevronRight size={16} /></button>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:flex">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm"></div> Confirmed
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div> Collected
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></div> Pending
                    </div>
                </div>
            </div>

            {/* Timeline Container - Unified Scroll View (Freeze Panes) */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50 relative overscroll-contain">
                
                {/* Scroll Content Wrapper */}
                <div className="min-w-max">
                    {/* Header Row (Dates) - Sticky Top */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
                        
                        {/* Vehicle Column Header - Sticky Left (The Corner) */}
                        <div className="w-60 md:w-72 shrink-0 p-3 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-md z-50 font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 flex items-center justify-between shadow-[4px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            <span>{t('grp_vehicle', lang)}</span>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">{vehicleGroups.length}</span>
                        </div>
                        
                        {/* Date Columns */}
                        <div className="flex relative">
                            {days.map((d, i) => (
                                <div 
                                    key={i} 
                                    className={`shrink-0 border-r border-slate-100 dark:border-slate-800 p-2 text-center flex flex-col items-center justify-center transition-colors 
                                        ${isToday(d) ? 'bg-blue-50/60 dark:bg-blue-900/20' : (isWeekend(d) ? 'bg-slate-50/50 dark:bg-slate-900/50' : 'bg-white dark:bg-slate-900')}
                                    `}
                                    style={{ width: DAY_WIDTH }}
                                >
                                    <span className={`text-[10px] font-bold uppercase mb-0.5 ${isToday(d) ? 'text-blue-600 dark:text-blue-400' : (isWeekend(d) ? 'text-red-400 dark:text-red-400/70' : 'text-slate-400 dark:text-slate-500')}`}>
                                        {d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' })}
                                    </span>
                                    <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday(d) ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {d.getDate()}
                                    </div>
                                </div>
                            ))}
                            
                            {/* Today Line inside header */}
                            <CurrentTimeIndicator startOffset={timelineStart.getTime()} dayWidth={DAY_WIDTH} />
                        </div>
                    </div>

                    {/* Rows (Vehicles) */}
                    <div>
                        {vehicleGroups.map((group) => (
                            <div 
                                key={group.id} 
                                className="flex border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group relative bg-white dark:bg-slate-900"
                                style={{ height: group.rowHeight }}
                            >
                                {/* Sticky Vehicle Name - Sticky Left */}
                                <div className="w-60 md:w-72 shrink-0 p-4 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/30 sticky left-0 z-30 flex flex-col justify-center shadow-[4px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 border border-slate-200/50 dark:border-slate-700 shadow-sm">
                                            <Car size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate leading-tight mb-1" title={group.name}>{group.name}</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">{group.plate}</span>
                                                {group.laneCount > 1 && (
                                                    <span className="text-[10px] text-orange-500 flex items-center gap-0.5 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded font-medium border border-orange-100 dark:border-orange-900/30">
                                                        <AlertTriangle size={10} /> {group.laneCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Track */}
                                <div className="relative flex" style={{ width: days.length * DAY_WIDTH }}>
                                    {/* Grid Lines (Background) */}
                                    {days.map((d, i) => (
                                        <div 
                                            key={i} 
                                            className={`shrink-0 border-r border-slate-100/80 dark:border-slate-800/50 h-full 
                                                ${isToday(d) ? 'bg-blue-50/20 dark:bg-blue-900/10' : (isWeekend(d) ? 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPgo8cmVjdCB3aWR0aD0nNCcgaGVpZ2h0PSc0JyBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9J00wIDBMNCA0Wk00IDBMMCA0Wicgc3Ryb2tlPSIjZjFmMZVmNSIgc3Ryb2tlLXdpZHRoPScxJy8+Cjwvc3ZnPg==")] dark:bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPgo8cmVjdCB3aWR0aD0nNCcgaGVpZ2h0PSc0JyBmaWxsPSIjMGUxNzJhIi8+CjxwYXRoIGQ9J00wIDBMNCA0Wk00IDBMMCA0Wicgc3Ryb2tlPSIjMWUyOTNiIiBzdHJva2Utd2lkdGg9JzEnLz4KPC9zdmc+")]' : '')}
                                            `}
                                            style={{ width: DAY_WIDTH }}
                                        />
                                    ))}
                                    
                                    {/* Red Line extending through rows */}
                                    <CurrentTimeIndicator startOffset={timelineStart.getTime()} dayWidth={DAY_WIDTH} />

                                    {/* Bookings Layer */}
                                    {group.bookings.map(session => {
                                        const { left, width, lane } = session.layout;
                                        
                                        // Visibility Optimization
                                        if (left + width < 0) return null;

                                        const status = session.reservationSummary?.status || 'pending';
                                        const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];
                                        
                                        // Calculate Top Position based on Lane
                                        const top = ROW_PADDING + (lane * (BAR_HEIGHT + BAR_GAP));
                                        
                                        // Extract Price & Currency
                                        const price = session.reservationSummary?.price || 0;
                                        const currency = session.reservationSummary?.currency || 'THB';

                                        return (
                                            <div
                                                key={session.id}
                                                onClick={() => navigate(`/chat/detail/${session.id}`)}
                                                onMouseEnter={(e) => {
                                                    setHoveredSession(session.id);
                                                    setTooltipPos({ x: e.clientX, y: e.clientY });
                                                }}
                                                onMouseLeave={() => setHoveredSession(null)}
                                                className={`absolute rounded-xl border shadow-sm cursor-pointer hover:scale-[1.01] hover:shadow-lg hover:z-20 transition-all flex items-center px-1 pr-2 gap-2 overflow-hidden whitespace-nowrap 
                                                    ${config.bg} ${config.border} dark:brightness-110`}
                                                style={{ 
                                                    left: Math.max(0, left), 
                                                    width: Math.max(width - 4, 30), // Minimum visual width
                                                    height: BAR_HEIGHT,
                                                    top,
                                                    zIndex: 10 + lane 
                                                }}
                                            >
                                                {/* Left Color Accent */}
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accent}`}></div>

                                                {/* Avatar */}
                                                <div className="w-8 h-8 rounded-full bg-white/80 border border-black/5 flex items-center justify-center overflow-hidden shrink-0 ml-1.5 shadow-sm">
                                                    {session.user.avatar ? (
                                                        <img src={session.user.avatar} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <span className={`text-[10px] font-bold ${config.text}`}>{session.user.name[0]}</span>
                                                    )}
                                                </div>

                                                {/* Text Content */}
                                                <div className="flex flex-col justify-center min-w-0 flex-1 pl-1">
                                                    <div className="text-[10px] font-bold truncate leading-none mb-0.5 text-slate-800 dark:text-slate-100">{session.user.name}</div>
                                                    {price > 0 && (
                                                        <div className="text-[9px] font-mono font-bold opacity-80 leading-none">
                                                            {price.toLocaleString()} {currency}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {vehicleGroups.length === 0 && (
                            <div className="p-20 text-center flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-slate-500">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                    <Car size={32} className="opacity-50" />
                                </div>
                                <p className="font-medium">{t('sched_no_vehicles', lang)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tooltip Portal */}
            {hoveredSession && (
                <div 
                    className="fixed z-[100] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 w-64 animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
                    style={{ left: Math.min(tooltipPos.x + 20, window.innerWidth - 280), top: Math.min(tooltipPos.y + 20, window.innerHeight - 150) }}
                >
                    {(() => {
                        const session = sessions.find(s => s.id === hoveredSession);
                        if (!session) return null;
                        
                        const status = session.reservationSummary?.status || 'pending';
                        const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];
                        const price = session.reservationSummary?.price || 0;
                        const currency = session.reservationSummary?.currency || 'THB';

                        return (
                            <>
                                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600 shadow-sm">
                                        {session.user.avatar ? <img src={session.user.avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-sm font-bold">{session.user.name[0]}</span>}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">{session.user.name}</h4>
                                        <div className={`text-[9px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1 mt-1 ${config.bg} ${config.text} ${config.border}`}>
                                            {config.icon} <span className="uppercase tracking-wide">{t(config.labelKey, lang)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <CalendarDays size={14} />
                                        <span>
                                            {session.reservationSummary?.pickupDate ? new Date(session.reservationSummary.pickupDate).toLocaleDateString() : 'N/A'} 
                                            <span className="text-slate-300 mx-1">→</span> 
                                            {session.reservationSummary?.dropoffDate ? new Date(session.reservationSummary.dropoffDate).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <MapPin size={14} />
                                        <span className="truncate">{session.reservationSummary?.plateNumber}</span>
                                    </div>
                                    {price > 0 && (
                                        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mt-1">
                                            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px]">$</div>
                                            <span>{price.toLocaleString()} {currency}</span>
                                        </div>
                                    )}
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
