
import React, { useEffect, useState, useMemo } from 'react';
import { useChatStore } from '../stores/chatStore';
import { Language, ChatSession } from '../types';
import { t } from '../utils/i18n';
import { Car, AlertTriangle, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { STATUS_CONFIG } from '../components/chat/ChatUtils';
import { useNavigate } from 'react-router-dom';

interface SchedulePageProps {
    lang: Language;
}

// Layout Constants
const DAY_WIDTH = 60; // Pixels per day
const BAR_HEIGHT = 36; // Height of the booking bar
const BAR_GAP = 6; // Vertical gap between stacked bars
const ROW_PADDING = 12; // Top/Bottom padding for the row
const MIN_ROW_HEIGHT = 80; // Minimum height for a vehicle row

interface ProcessedSession extends ChatSession {
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

const SchedulePage: React.FC<SchedulePageProps> = ({ lang }) => {
    const { sessions, isHydrated, hydrate } = useChatStore();
    const navigate = useNavigate();
    
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
            // Only show confirmed/active bookings or pending ones.
            // You might want to filter out 'cancelled' or 'rejected' if they clutter the view,
            // but for now we keep them to show history/conflicts.
            
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

    return (
        <div className="flex flex-col h-full bg-white text-slate-900">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white z-30 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-800">
                        <CalendarDays className="text-blue-600" />
                        <h2 className="text-xl font-bold">{t('sched_title', lang)}</h2>
                    </div>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button onClick={handlePrev} className="p-1.5 hover:bg-white rounded-md shadow-sm text-slate-600 transition-all"><ChevronLeft size={16} /></button>
                        <button onClick={handleToday} className="px-3 text-xs font-bold hover:bg-white rounded-md shadow-sm text-slate-700 transition-all">{t('sched_today', lang)}</button>
                        <button onClick={handleNext} className="p-1.5 hover:bg-white rounded-md shadow-sm text-slate-600 transition-all"><ChevronRight size={16} /></button>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Confirmed
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Collected
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div> Pending
                    </div>
                </div>
            </div>

            {/* Timeline Container */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-50/50">
                
                {/* Header Row (Dates) */}
                <div className="flex border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
                    {/* Vehicle Column Header */}
                    <div className="w-56 md:w-64 shrink-0 p-3 border-r border-slate-200 bg-slate-50/80 backdrop-blur-sm font-bold text-xs text-slate-500 uppercase tracking-wider sticky left-0 z-30 flex items-center justify-between">
                        <span>{t('grp_vehicle', lang)}</span>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{vehicleGroups.length}</span>
                    </div>
                    {/* Date Columns */}
                    <div className="flex">
                        {days.map((d, i) => (
                            <div 
                                key={i} 
                                className={`shrink-0 border-r border-slate-100 p-2 text-center flex flex-col items-center justify-center transition-colors ${isToday(d) ? 'bg-blue-50/60' : 'bg-white'}`}
                                style={{ width: DAY_WIDTH }}
                            >
                                <span className={`text-[10px] font-bold uppercase mb-0.5 ${isToday(d) ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' })}
                                </span>
                                <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday(d) ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-700'}`}>
                                    {d.getDate()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rows (Vehicles) */}
                <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar">
                    {vehicleGroups.map((group) => (
                        <div 
                            key={group.id} 
                            className="flex border-b border-slate-200/60 hover:bg-slate-50 transition-colors group relative bg-white"
                            style={{ height: group.rowHeight }}
                        >
                            {/* Sticky Vehicle Name */}
                            <div className="w-56 md:w-64 shrink-0 p-4 border-r border-slate-200 bg-white group-hover:bg-slate-50 sticky left-0 z-10 flex flex-col justify-center shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200/50 shadow-sm">
                                        <Car size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-sm text-slate-800 truncate leading-tight mb-1" title={group.name}>{group.name}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">{group.plate}</span>
                                            {group.laneCount > 1 && (
                                                <span className="text-[10px] text-orange-500 flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded font-medium border border-orange-100">
                                                    <AlertTriangle size={10} /> {group.laneCount} overlaps
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
                                        className={`shrink-0 border-r border-slate-100/80 h-full ${isToday(d) ? 'bg-blue-50/20' : ''}`}
                                        style={{ width: DAY_WIDTH }}
                                    />
                                ))}

                                {/* Bookings Layer */}
                                {group.bookings.map(session => {
                                    const { left, width, lane } = session.layout;
                                    
                                    // Visibility Optimization: Skip if totally out of view
                                    if (left + width < 0 || left > days.length * DAY_WIDTH) return null;

                                    const status = session.reservationSummary?.status || 'pending';
                                    const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];
                                    
                                    // Calculate Top Position based on Lane
                                    const top = ROW_PADDING + (lane * (BAR_HEIGHT + BAR_GAP));

                                    return (
                                        <div
                                            key={session.id}
                                            onClick={() => navigate(`/chat/detail/${session.id}`)}
                                            className={`absolute rounded-lg border shadow-sm cursor-pointer hover:brightness-95 hover:scale-[1.01] hover:shadow-md hover:z-20 transition-all flex items-center px-2 gap-1.5 overflow-hidden whitespace-nowrap ${config.bg} ${config.border} ${config.text}`}
                                            style={{ 
                                                left: Math.max(0, left), 
                                                width: Math.max(width - 4, 30), // Minimum visual width
                                                height: BAR_HEIGHT,
                                                top,
                                                zIndex: 10 + lane 
                                            }}
                                            title={`${session.user.name} • ${status} • ${new Date(session.tempStart).toLocaleDateString()} - ${new Date(session.tempEnd).toLocaleDateString()}`}
                                        >
                                            <div className="shrink-0 opacity-80">{config.icon}</div>
                                            <div className="flex flex-col justify-center min-w-0">
                                                <span className="text-[10px] font-bold truncate leading-none mb-0.5">{session.user.name}</span>
                                                <span className="text-[9px] opacity-75 truncate leading-none font-medium uppercase tracking-wide">{t(config.labelKey, lang)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {vehicleGroups.length === 0 && (
                        <div className="p-20 text-center flex flex-col items-center justify-center gap-4 text-slate-400">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                <Car size={32} className="opacity-50" />
                            </div>
                            <p className="font-medium">{t('sched_no_vehicles', lang)}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SchedulePage;
