
import React, { useEffect, useState, useMemo } from 'react';
import { useChatStore } from '../stores/chatStore';
import { Language, ChatSession } from '../types';
import { t } from '../utils/i18n';
import { Car, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { STATUS_CONFIG } from '../components/chat/ChatUtils';
import { useNavigate } from 'react-router-dom';

interface SchedulePageProps {
    lang: Language;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ lang }) => {
    const { sessions, isHydrated, hydrate } = useChatStore();
    const navigate = useNavigate();
    
    // Timeline Settings
    const DAY_WIDTH = 60; // Pixels per day
    const DAYS_TO_SHOW = 21; // Total days visible
    const START_OFFSET = 2; // Days before today
    const [startDate, setStartDate] = useState(new Date());

    useEffect(() => {
        if (!isHydrated) hydrate();
    }, [isHydrated, hydrate]);

    // Derived State: Group sessions by Vehicle
    const vehicleGroups = useMemo(() => {
        const groups: Record<string, ChatSession[]> = {};
        
        sessions.forEach(s => {
            if (!s.reservationSummary) return;
            const plate = s.reservationSummary.plateNumber || 'Unknown';
            const vehicleName = s.reservationSummary.vehicleName || 'Unknown Vehicle';
            const key = `${vehicleName}::${plate}`; // Unique key
            
            if (!groups[key]) groups[key] = [];
            groups[key].push(s);
        });

        // Convert to array and sort
        return Object.entries(groups).map(([key, items]) => {
            const [name, plate] = key.split('::');
            return {
                id: key,
                name,
                plate,
                bookings: items
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [sessions]);

    // Conflicts Detection
    const conflicts = useMemo(() => {
        const conflictIds = new Set<string>();
        // Placeholder for future conflict detection logic
        // Currently empty to avoid unused variable errors during build
        return conflictIds;
    }, []);

    // Timeline Grid Generation
    const days = useMemo(() => {
        const result = [];
        const start = new Date(startDate);
        start.setDate(start.getDate() - START_OFFSET);
        
        for (let i = 0; i < DAYS_TO_SHOW; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            result.push(d);
        }
        return result;
    }, [startDate]);

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

    const getBarPosition = (session: ChatSession) => {
        // NOTE: In a real production app, reservationSummary needs 'pickupDate' and 'dropoffDate'.
        // Currently, we only have 'deadline' and derive status.
        // We will MOCK dates based on session timestamps or assume a standard duration for demo.
        // Ideally: Update types.ts to include pickupDate/dropoffDate in reservationSummary.
        
        // MOCK LOGIC for demo visualization
        const mockStart = new Date(session.lastMessageTime); // Assume booked around last message
        const durationDays = 3 + (session.user.name.length % 5); // Randomish duration 3-7 days
        const mockEnd = new Date(mockStart);
        mockEnd.setDate(mockEnd.getDate() + durationDays);

        const timelineStart = new Date(startDate);
        timelineStart.setDate(timelineStart.getDate() - START_OFFSET);

        const diffTime = mockStart.getTime() - timelineStart.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        return {
            left: diffDays * DAY_WIDTH,
            width: durationDays * DAY_WIDTH
        };
    };

    const isToday = (d: Date) => {
        return d.toDateString() === new Date().toDateString();
    };

    return (
        <div className="flex flex-col h-full bg-white text-slate-900">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white z-20">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-800">{t('sched_title', lang)}</h2>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button onClick={handlePrev} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronLeft size={16} /></button>
                        <button onClick={handleToday} className="px-3 text-xs font-bold hover:bg-white rounded shadow-sm transition-all">{t('sched_today', lang)}</button>
                        <button onClick={handleNext} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronRight size={16} /></button>
                    </div>
                </div>
                {conflicts.size > 0 && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-100 animate-pulse">
                        <AlertTriangle size={14} /> {t('sched_conflicts_detected', lang)}
                    </div>
                )}
            </div>

            {/* Timeline Container */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                
                {/* Header Row (Dates) */}
                <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                    {/* Vehicle Column Header */}
                    <div className="w-48 md:w-64 shrink-0 p-3 border-r border-slate-200 bg-slate-50 font-bold text-xs text-slate-500 uppercase tracking-wider sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        {t('grp_vehicle', lang)}
                    </div>
                    {/* Date Columns */}
                    <div className="flex">
                        {days.map((d, i) => (
                            <div 
                                key={i} 
                                className={`shrink-0 border-r border-slate-200/50 p-2 text-center flex flex-col items-center justify-center ${isToday(d) ? 'bg-blue-50/50' : ''}`}
                                style={{ width: DAY_WIDTH }}
                            >
                                <span className={`text-[10px] font-bold uppercase ${isToday(d) ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' })}
                                </span>
                                <span className={`text-sm font-bold ${isToday(d) ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm' : 'text-slate-700'}`}>
                                    {d.getDate()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rows (Vehicles) */}
                <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar">
                    {vehicleGroups.map((group) => (
                        <div key={group.id} className="flex border-b border-slate-100 hover:bg-slate-50 transition-colors group relative">
                            {/* Sticky Vehicle Name */}
                            <div className="w-48 md:w-64 shrink-0 p-3 border-r border-slate-200 bg-white group-hover:bg-slate-50 sticky left-0 z-10 flex flex-col justify-center shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                        <Car size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm text-slate-800 truncate">{group.name}</div>
                                        <div className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit">{group.plate}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Track */}
                            <div className="relative flex" style={{ width: days.length * DAY_WIDTH }}>
                                {/* Grid Lines */}
                                {days.map((d, i) => (
                                    <div 
                                        key={i} 
                                        className={`shrink-0 border-r border-slate-100 h-full ${isToday(d) ? 'bg-blue-50/30' : ''}`}
                                        style={{ width: DAY_WIDTH }}
                                    />
                                ))}

                                {/* Bookings */}
                                {group.bookings.map(session => {
                                    const { left, width } = getBarPosition(session);
                                    // Skip if out of view (simple check)
                                    if (left + width < 0 || left > days.length * DAY_WIDTH) return null;

                                    const status = session.reservationSummary?.status || 'pending';
                                    const config = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];

                                    return (
                                        <div
                                            key={session.id}
                                            onClick={() => navigate(`/chat/detail/${session.id}`)}
                                            className={`absolute top-2 bottom-2 rounded-lg border shadow-sm cursor-pointer hover:brightness-95 hover:shadow-md transition-all flex items-center px-2 gap-1 overflow-hidden whitespace-nowrap ${config.bg} ${config.border} ${config.text}`}
                                            style={{ left, width: Math.max(width - 4, DAY_WIDTH - 4) }} // Minus gap
                                            title={`${session.user.name} - ${status}`}
                                        >
                                            <div className="shrink-0">{config.icon}</div>
                                            <span className="text-[10px] font-bold truncate">{session.user.name}</span>
                                            {/* Action Icon overlay on hover could go here */}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {vehicleGroups.length === 0 && (
                        <div className="p-12 text-center text-slate-400 italic">
                            {t('sched_no_vehicles', lang)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SchedulePage;
