import React, { useEffect, useState, useMemo } from 'react';
import { useChatStore } from '../stores/chatStore';
import { Language, ChatSession } from '../types';
import { t } from '../utils/i18n';
import { Car, AlertTriangle, ChevronLeft, ChevronRight, CalendarDays, MapPin, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { STATUS_CONFIG } from '../components/chat/ChatUtils';
import { useNavigate } from 'react-router-dom';
import { useDraggableScroll } from '../hooks/useDraggableScroll';

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

// --- TYPES ---
interface LayoutMetrics {
    lane: number;
    left: number;
    width: number;
}

interface ProcessedSession extends ChatSession {
    layout: LayoutMetrics;
}

interface VehicleGroup {
    id: string;
    name: string;
    plate: string;
    bookings: ProcessedSession[];
    laneCount: number;
    rowHeight: number;
}

// --- HELPER HOOK (HIVE Pattern) ---
// Extracts complex layout logic ("Tetris Packing") from the UI component
const useTimelineLayout = (sessions: ChatSession[], startDate: Date, tick: number) => {
    return useMemo(() => {
        // 1. Determine Timeline Start (Midnight)
        const timelineStart = new Date(startDate);
        timelineStart.setDate(timelineStart.getDate() - START_OFFSET);
        timelineStart.setHours(0, 0, 0, 0);

        // 2. Group by Vehicle (Name + Plate)
        const rawGroups: Record<string, ChatSession[]> = {};
        
        sessions.forEach(s => {
            if (s.isArchived) return;
            
            const summary = s.reservationSummary;
            const plate = summary?.plateNumber || 'Unknown';
            const vehicleName = summary?.vehicleName || 'Unknown Vehicle';
            const key = `${vehicleName}::${plate}`;
            
            if (!rawGroups[key]) rawGroups[key] = [];
            rawGroups[key].push(s);
        });

        // 3. Process Each Group
        const groups: VehicleGroup[] = Object.entries(rawGroups).map(([key, groupSessions]) => {
            const [name, plate] = key.split('::');

            // A. Calculate Raw Positions (Time -> Pixels)
            const items = groupSessions.map(session => {
                const summary = session.reservationSummary;
                const status = summary?.status || 'pending';
                
                // Determine Start/End dates with fallbacks
                // Prioritize exact ISO timestamps if available for sub-day precision
                let start: Date;
                let end: Date;

                if (summary?.exactPickupDate) {
                    start = new Date(summary.exactPickupDate);
                } else {
                    start = summary?.pickupDate ? new Date(summary.pickupDate) : new Date(session.lastMessageTime);
                }

                if (summary?.exactDropoffDate) {
                    end = new Date(summary.exactDropoffDate);
                } else {
                    end = summary?.dropoffDate ? new Date(summary.dropoffDate) : new Date(start.getTime() + (3 * 24 * 60 * 60 * 1000)); // Default 3 days
                }

                // Handle Overdue: Extend to NOW to show blockage
                if (status === 'overdue') {
                    const now = new Date();
                    // If current time is past the scheduled end, extend bar to now
                    if (now > end) end = now;
                }

                // Normalize boundaries to avoid negative/NaN if bad data
                if (isNaN(start.getTime())) start = new Date();
                if (isNaN(end.getTime())) end = new Date(start.getTime() + 86400000);

                // Use exact timestamps for precision
                const startMs = start.getTime();
                const endMs = end.getTime();

                // Calculate pixels
                const startDiffMs = startMs - timelineStart.getTime();
                const durationMs = endMs - startMs;
                
                // Convert ms to pixels (Float)
                const msPerDay = 1000 * 60 * 60 * 24;
                const left = (startDiffMs / msPerDay) * DAY_WIDTH;
                const width = (durationMs / msPerDay) * DAY_WIDTH;

                return {
                    session,
                    startMs,
                    endMs,
                    left,
                    width
                };
            });

            // B. Sort for Packing (Earliest start)
            items.sort((a, b) => a.startMs - b.startMs);

            // C. "Tetris" Packing Algorithm
            const lanes: number[] = []; // Stores the end time (ms) of the last block in each lane
            
            const bookings: ProcessedSession[] = items.map(item => {
                let assignedLane = -1;

                // Find the first lane where this item fits (with 0 buffer for visual gap logic handled by width)
                for (let i = 0; i < lanes.length; i++) {
                    if (lanes[i] <= item.startMs) {
                        assignedLane = i;
                        lanes[i] = item.endMs;
                        break;
                    }
                }

                // If no fit, create a new lane
                if (assignedLane === -1) {
                    assignedLane = lanes.length;
                    lanes.push(item.endMs);
                }

                return {
                    ...item.session,
                    layout: {
                        lane: assignedLane,
                        left: item.left,
                        width: Math.max(item.width, 10) // Minimum 10px width
                    }
                };
            });

            // D. Calculate Row Metrics
            const laneCount = Math.max(1, lanes.length);
            // Dynamic height based on lanes
            const contentHeight = (laneCount * (BAR_HEIGHT + BAR_GAP)) - BAR_GAP;
            const rowHeight = Math.max(MIN_ROW_HEIGHT, contentHeight + (ROW_PADDING * 2));

            return { id: key, name, plate, bookings, laneCount, rowHeight };
        });

        // 4. Sort Groups Alphabetically
        groups.sort((a, b) => a.name.localeCompare(b.name));

        return { groups, timelineStart };
    }, [sessions, startDate, tick]);
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
        const interval = setInterval(update, 60000); // Update every minute
        return () => clearInterval(interval);
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

// --- MAIN COMPONENT ---

const SchedulePage: React.FC<SchedulePageProps> = ({ lang }) => {
    const navigate = useNavigate();
    const { sessions, isHydrated, hydrate } = useChatStore();
    const [startDate, setStartDate] = useState(new Date());
    const [hoveredSession, setHoveredSession] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    // Draggable Scroll Hook
    const { scrollContainerRef, onMouseDown, isDragging, hasMoved } = useDraggableScroll<HTMLDivElement>();
    
    // Tick to force re-render for real-time "Overdue" expansion
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setTick(n => n + 1), 60000); // Update every minute
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (!isHydrated) hydrate();
    }, [isHydrated, hydrate]);

    // Use Custom Hook for Logic
    const { groups: vehicleGroups, timelineStart } = useTimelineLayout(sessions, startDate, tick);

    // Generate Header Days
    const days = useMemo(() => Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
        const d = new Date(timelineStart);
        d.setDate(d.getDate() + i);
        return d;
    }), [timelineStart]);

    // Navigation Handlers
    const shiftDate = (days: number) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + days);
        setStartDate(d);
    };

    const sidebarWidthClass = isSidebarCollapsed ? 'w-20' : 'w-60 md:w-72';

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            {/* 1. Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 shadow-sm relative shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                        <CalendarDays className="text-blue-600 dark:text-blue-400" />
                        <h2 className="text-xl font-bold">{t('sched_title', lang)}</h2>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button onClick={() => shiftDate(-7)} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm text-slate-600 dark:text-slate-400 transition-all"><ChevronLeft size={16} /></button>
                        <button onClick={() => setStartDate(new Date())} className="px-3 text-xs font-bold hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm text-slate-700 dark:text-slate-300 transition-all">{t('sched_today', lang)}</button>
                        <button onClick={() => shiftDate(7)} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm text-slate-600 dark:text-slate-400 transition-all"><ChevronRight size={16} /></button>
                    </div>
                </div>
                
                {/* Legend (Hidden on Mobile) */}
                <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm" /> Confirmed</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" /> Collected</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" /> Pending</div>
                </div>
            </div>

            {/* 2. Timeline Grid (Scrollable Container) */}
            <div 
                ref={scrollContainerRef}
                onMouseDown={onMouseDown}
                className={`flex-1 overflow-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50 relative overscroll-contain transition-colors ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            >
                <div className="min-w-max">
                    
                    {/* A. Sticky Header Row (Z-50) */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-sm will-change-transform">
                        {/* Top-Left Corner (Freeze Pane Intersection) (Z-60) */}
                        <div className={`${sidebarWidthClass} shrink-0 p-3 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-md z-[60] font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 flex items-center justify-between shadow-[4px_0_5px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out`}>
                            {!isSidebarCollapsed && <span>{t('grp_vehicle', lang)}</span>}
                            
                            <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'w-full justify-center' : ''}`}>
                                {!isSidebarCollapsed && (
                                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">{vehicleGroups.length}</span>
                                )}
                                <button 
                                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 transition-colors"
                                    title={isSidebarCollapsed ? "Expand List" : "Collapse List"}
                                >
                                    {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                                </button>
                            </div>
                        </div>
                        
                        {/* Date Columns */}
                        <div className="flex relative">
                            {days.map((d, i) => {
                                const isToday = d.toDateString() === new Date().toDateString();
                                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                return (
                                    <div 
                                        key={i} 
                                        className={`shrink-0 border-r border-slate-100 dark:border-slate-800 p-2 text-center flex flex-col items-center justify-center transition-colors 
                                            ${isToday ? 'bg-blue-50/60 dark:bg-blue-900/20' : (isWeekend ? 'bg-slate-50/50 dark:bg-slate-900/50' : 'bg-white dark:bg-slate-900')}
                                        `}
                                        style={{ width: DAY_WIDTH }}
                                    >
                                        <span className={`text-[10px] font-bold uppercase mb-0.5 ${isToday ? 'text-blue-600 dark:text-blue-400' : (isWeekend ? 'text-red-400 dark:text-red-400/70' : 'text-slate-400 dark:text-slate-500')}`}>
                                            {d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' })}
                                        </span>
                                        <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {d.getDate()}
                                        </div>
                                    </div>
                                );
                            })}
                            <CurrentTimeIndicator startOffset={timelineStart.getTime()} dayWidth={DAY_WIDTH} />
                        </div>
                    </div>

                    {/* B. Data Rows */}
                    <div>
                        {vehicleGroups.map((group) => (
                            <div 
                                key={group.id} 
                                className="flex border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group relative bg-white dark:bg-slate-900"
                                style={{ height: group.rowHeight }}
                            >
                                {/* Sticky Vehicle Name (Left Column) (Z-40) */}
                                <div className={`${sidebarWidthClass} shrink-0 p-4 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/30 sticky left-0 z-40 flex flex-col justify-center shadow-[4px_0_5px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out`}>
                                    <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-1' : 'gap-3'}`}>
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 border border-slate-200/50 dark:border-slate-700 shadow-sm" title={group.name}>
                                            <Car size={20} />
                                        </div>
                                        
                                        {!isSidebarCollapsed ? (
                                            <div className="min-w-0 flex-1 animate-in fade-in duration-300">
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
                                        ) : (
                                            group.laneCount > 1 && (
                                                <div className="flex justify-center animate-in fade-in duration-300">
                                                    <span className="text-[9px] text-orange-500 font-bold flex items-center gap-0.5 bg-orange-50 dark:bg-orange-900/20 px-1 py-0.5 rounded-full border border-orange-100 dark:border-orange-900/30">
                                                        <AlertTriangle size={8} /> {group.laneCount}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Timeline Track */}
                                <div className="relative flex" style={{ width: days.length * DAY_WIDTH }}>
                                    {/* Grid Background */}
                                    {days.map((d, i) => {
                                        const isToday = d.toDateString() === new Date().toDateString();
                                        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                        return (
                                            <div 
                                                key={i} 
                                                className={`shrink-0 border-r border-slate-100/80 dark:border-slate-800/50 h-full 
                                                    ${isToday ? 'bg-blue-50/20 dark:bg-blue-900/10' : (isWeekend ? 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPgo8cmVjdCB3aWR0aD0nNCcgaGVpZ2h0PSc0JyBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9J00wIDBMNCA0Wk00IDBMMCA0Wicgc3Ryb2tlPSIjZjFmMZVmNSIgc3Ryb2tlLXdpZHRoPScxJy8+Cjwvc3ZnPg==")] dark:bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPgo8cmVjdCB3aWR0aD0nNCcgaGVpZ2h0PSc0JyBmaWxsPSIjMGUxNzJhIi8+CjxwYXRoIGQ9J00wIDBMNCA0Wk00IDBMMCA0Wicgc3Ryb2tlPSIjMWUyOTNiIiBzdHJva2Utd2lkdGg9JzEnLz4KPC9zdmc+")]' : '')}
                                                `}
                                                style={{ width: DAY_WIDTH }}
                                            />
                                        );
                                    })}
                                    
                                    {/* Current Time Indicator (Z-30) - Must be lower than vehicle column (Z-40) */}
                                    <CurrentTimeIndicator startOffset={timelineStart.getTime()} dayWidth={DAY_WIDTH} />

                                    {/* Bookings */}
                                    {group.bookings.map(session => {
                                        const { left, width, lane } = session.layout;
                                        if (left + width < 0) return null; // Visibility check

                                        const status = session.reservationSummary?.status || 'pending';
                                        const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];
                                        const top = ROW_PADDING + (lane * (BAR_HEIGHT + BAR_GAP));
                                        const price = session.reservationSummary?.price || 0;
                                        const currency = session.reservationSummary?.currency || 'THB';

                                        return (
                                            <div
                                                key={session.id}
                                                onClick={(e) => {
                                                    // Prevent navigation if user was dragging
                                                    if (hasMoved.current) {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        return;
                                                    }
                                                    navigate(`/chat/detail/${session.id}`);
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (isDragging) return; // Don't show tooltip while dragging
                                                    setHoveredSession(session.id);
                                                    setTooltipPos({ x: e.clientX, y: e.clientY });
                                                }}
                                                onMouseLeave={() => setHoveredSession(null)}
                                                className={`absolute rounded-xl border shadow-sm cursor-pointer hover:scale-[1.01] hover:shadow-lg hover:z-20 transition-all flex items-center px-1 pr-2 gap-2 overflow-hidden whitespace-nowrap ${config.bg} ${config.border} dark:brightness-110`}
                                                style={{ 
                                                    left: Math.max(0, left), 
                                                    width: Math.max(width - 2, 4), // Small gap on right
                                                    height: BAR_HEIGHT,
                                                    top,
                                                    zIndex: 10 + lane,
                                                    // Disable pointer events on booking content while dragging to prevent hover effects flickering
                                                    pointerEvents: isDragging ? 'none' : 'auto'
                                                }}
                                            >
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accent}`}></div>
                                                <div className="w-8 h-8 rounded-full bg-white/80 border border-black/5 flex items-center justify-center overflow-hidden shrink-0 ml-1.5 shadow-sm">
                                                    {session.user.avatar ? (
                                                        <img src={session.user.avatar} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <span className={`text-[10px] font-bold ${config.text}`}>{session.user.name[0]}</span>
                                                    )}
                                                </div>
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

            {/* 3. Tooltip Portal (Positioned absolutely) */}
            {hoveredSession && !isDragging && (
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