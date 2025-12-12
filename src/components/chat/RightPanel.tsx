


import React, { useState } from 'react';
import { FileEdit, MapPin, User as UserIcon, Car, CalendarPlus, Check } from 'lucide-react';
import { ChatSession, LeaseData, Language } from '../../types';
import LeaseForm from '../forms/LeaseForm';
import InputGroup from '../ui/InputGroup';
import { t } from '../../utils/i18n';
import { StatusBadge } from './StatusBadge';
import { formatShortDate } from '../../utils/dateUtils';
import { requestNotificationPermission, scheduleBrowserNotification, generateCalendarUrl } from '../../utils/notificationUtils';

interface RightPanelProps {
    chat: ChatSession;
    leaseData: LeaseData;
    lang: Language;
    handlers: any;
    isOpen: boolean;
}

export const RightPanel: React.FC<RightPanelProps> = ({ 
    chat, leaseData, lang, handlers, isOpen 
}) => {
    const [sidebarTab, setSidebarTab] = useState<'profile' | 'details' | 'map'>('details');
    const [reminderSet, setReminderSet] = useState<string | null>(null); // 'pickup' | 'dropoff'
    const { vehicle, status, pickup, dropoff, pricing, owner } = leaseData;

    const handleReminder = async (type: 'pickup' | 'dropoff') => {
        const dateStr = type === 'pickup' ? pickup.date : dropoff.date;
        const timeStr = type === 'pickup' ? pickup.time : dropoff.time;
        
        if (!dateStr) return;

        // Construct full Date object
        // Assuming timeStr format "HH:MM" or similar, fallback to noon if missing
        let date = new Date(dateStr);
        if (timeStr) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            if (!isNaN(hours)) {
                date.setHours(hours, minutes || 0, 0, 0);
            } else {
                date.setHours(12, 0, 0, 0);
            }
        } else {
            date.setHours(12, 0, 0, 0);
        }

        // 1. Browser Notification Logic
        const granted = await requestNotificationPermission();
        if (granted) {
            // Schedule for 1 hour before
            const remindTime = new Date(date.getTime() - 60 * 60 * 1000);
            const title = `${type === 'pickup' ? 'Pickup' : 'Return'}: ${vehicle.name}`;
            scheduleBrowserNotification(title, `Time to ${type} the vehicle.`, remindTime);
        }

        // 2. Calendar Event (ICS) - "Add to Calendar"
        const eventTitle = `${type === 'pickup' ? 'Pickup' : 'Return'}: ${vehicle.name}`;
        const eventDesc = `Reservation #${leaseData.reservationId}\nVehicle: ${vehicle.name} (${vehicle.plate})`;
        const endDate = new Date(date.getTime() + 60 * 60 * 1000); // 1 hour duration
        
        const url = generateCalendarUrl(eventTitle, eventDesc, date, endDate);
        
        // Trigger download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}_reminder.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Visual Feedback
        setReminderSet(type);
        setTimeout(() => setReminderSet(null), 3000);
    };

    return (
        <div className={`bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 hidden xl:flex flex-col h-full shadow-lg z-20 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'w-[360px] opacity-100' : 'w-0 opacity-0 border-none'}`}>
            <div className="w-[360px] h-full flex flex-col bg-slate-50/50 dark:bg-slate-950/50">
                {/* Sidebar Header/Tabs */}
                <div className="bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 gap-1 rounded-xl">
                        <button onClick={() => setSidebarTab('details')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${sidebarTab === 'details' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                            <FileEdit size={14} /> {t('rp_details', lang)}
                        </button>
                        <button onClick={() => setSidebarTab('map')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${sidebarTab === 'map' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                            <MapPin size={14} /> {t('rp_map', lang)}
                        </button>
                        <button onClick={() => setSidebarTab('profile')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${sidebarTab === 'profile' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                            <UserIcon size={14} /> {t('rp_profile', lang)}
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {sidebarTab === 'details' && (
                        <div className="p-4 bg-white dark:bg-slate-900 min-h-full">
                            {/* CONTEXT DASHBOARD CARD */}
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 mb-6 shadow-sm">
                                {/* Vehicle Header */}
                                <div className="flex items-start justify-between mb-4">
                                     <div className="flex items-center gap-3">
                                         <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shadow-sm">
                                             {vehicle.imageUrl ? (
                                                <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
                                             ) : (
                                                <Car className="text-slate-300 dark:text-slate-500" size={24} />
                                             )}
                                         </div>
                                         <div>
                                             <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{vehicle.name}</div>
                                             <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 w-fit mt-1">{vehicle.plate}</div>
                                         </div>
                                     </div>
                                     <div className="scale-90 origin-top-right">
                                        <StatusBadge status={status || 'pending'} lang={lang} />
                                     </div>
                                </div>

                                {/* Dates Timeline with Reminders */}
                                <div className="flex justify-between items-center text-xs mb-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <div className="text-center min-w-[80px] group relative">
                                        <div className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold mb-1 tracking-wide flex items-center justify-center gap-1">
                                            {t('grp_pickup', lang)}
                                            <button 
                                                onClick={() => handleReminder('pickup')}
                                                className={`p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors ${reminderSet === 'pickup' ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'}`}
                                                title={t('btn_add_calendar', lang)}
                                            >
                                                {reminderSet === 'pickup' ? <Check size={10} /> : <CalendarPlus size={10} />}
                                            </button>
                                        </div>
                                        <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">{formatShortDate(pickup.date, lang)}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">{pickup.time}</div>
                                    </div>
                                    
                                    <div className="text-slate-300 dark:text-slate-600 flex flex-col items-center">
                                        <span className="text-[10px] font-bold text-slate-400 mb-1">{leaseData.pricing.daysRegular + leaseData.pricing.daysSeason}d</span>
                                        <div className="w-16 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full relative">
                                            <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-slate-200 dark:border-slate-700 rotate-45"></div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-center min-w-[80px]">
                                        <div className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold mb-1 tracking-wide flex items-center justify-center gap-1">
                                            {t('grp_return', lang)}
                                            <button 
                                                onClick={() => handleReminder('dropoff')}
                                                className={`p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors ${reminderSet === 'dropoff' ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'}`}
                                                title={t('btn_add_calendar', lang)}
                                            >
                                                {reminderSet === 'dropoff' ? <Check size={10} /> : <CalendarPlus size={10} />}
                                            </button>
                                        </div>
                                        <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">{formatShortDate(dropoff.date, lang)}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">{dropoff.time}</div>
                                    </div>
                                </div>

                                {/* Financials */}
                                <div className="flex justify-between items-end border-t border-slate-200 dark:border-slate-700 pt-3">
                                    <div>
                                        <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wide mb-0.5">{t('lbl_deposit', lang)}</div>
                                        <div className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md">{pricing.deposit.toLocaleString()} {pricing.currency}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wide mb-0.5">{t('lbl_total_paid', lang)}</div>
                                        <div className="font-mono text-xl font-bold text-blue-600 dark:text-blue-400 leading-none tracking-tight">{pricing.total.toLocaleString()} <span className="text-sm font-normal text-slate-400">{pricing.currency}</span></div>
                                    </div>
                                </div>
                            </div>

                            <LeaseForm data={leaseData} handlers={handlers} lang={lang} compact={true} />
                        </div>
                    )}

                    {sidebarTab === 'map' && (
                        <div className="h-full bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 relative p-6 text-center">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                                <MapPin size={32} className="text-blue-500 dark:text-blue-400" />
                            </div>
                            <h4 className="text-slate-800 dark:text-slate-200 font-bold text-sm mb-1">{t('rp_pickup_location', lang)}</h4>
                            <p className="text-xs mb-6 max-w-[200px]">{owner.address}</p>
                            
                            <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden relative shadow-inner">
                                {owner.coords ? (
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        frameBorder="0" 
                                        scrolling="no" 
                                        marginHeight={0} 
                                        marginWidth={0} 
                                        src={`https://maps.google.com/maps?q=${owner.coords.latitude},${owner.coords.longitude}&z=15&output=embed`}
                                        className="absolute inset-0"
                                        title="Google Maps"
                                    />
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-10 dark:opacity-5 grayscale"></div>
                                        <span className="text-xs font-bold relative z-10 bg-white/80 dark:bg-slate-900/80 dark:text-slate-200 px-3 py-1 rounded-full backdrop-blur-sm">{t('rp_map_placeholder', lang)}</span>
                                    </>
                                )}
                            </div>
                            
                            {owner.coords && (
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${owner.coords.latitude},${owner.coords.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <MapPin size={14} /> Open in Google Maps
                                </a>
                            )}
                        </div>
                    )}

                    {sidebarTab === 'profile' && (
                        <div className="p-4 space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6 flex flex-col items-center relative">
                                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 z-0"></div>
                                <div className="relative z-10 w-24 h-24 rounded-full bg-white dark:bg-slate-800 p-1 mb-3 shadow-md">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-3xl text-slate-300 dark:text-slate-500 border border-slate-100 dark:border-slate-700">
                                        {chat.user.avatar ? <img src={chat.user.avatar} alt="Profile" className="w-full h-full object-cover" /> : chat.user.name[0]}
                                    </div>
                                    <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-white dark:border-slate-800 ${chat.user.status === 'online' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'} hidden`}></div>
                                </div>
                                <h3 className="font-bold text-xl text-slate-800 dark:text-white text-center relative z-10">{chat.user.name}</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-3 relative z-10">{chat.user.role}</p>
                                <div className="flex gap-2 w-full pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex-1 flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{t('rp_leases', lang)}</span>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">1</span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{t('rp_status', lang)}</span>
                                        <span className="text-sm font-bold text-green-600 dark:text-green-400">{t('rp_active', lang)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase px-2">{t('rp_rider_details', lang)}</h4>
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm space-y-4">
                                    <InputGroup label={`${t('rp_full_name', lang)} *`} value={leaseData.renter.surname || chat.user.name} onChange={(v) => handlers.updateLease('renter', 'surname', v)} placeholder={t('rp_enter_name', lang)} />
                                    <InputGroup label={`${t('rp_contact_info', lang)} *`} value={leaseData.renter.contact || ''} onChange={(v) => handlers.updateLease('renter', 'contact', v)} placeholder={t('rp_phone_email', lang)} />
                                    <InputGroup label={t('rp_passport_id', lang)} value={leaseData.renter.passport || ''} onChange={(v) => handlers.updateLease('renter', 'passport', v)} placeholder={t('rp_passport_number', lang)} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase px-2">{t('rp_owner_details', lang)}</h4>
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm space-y-4">
                                    <InputGroup label={`${t('rp_rent_service_name', lang)} *`} value={leaseData.owner.surname} onChange={(v) => handlers.updateLease('owner', 'surname', v)} helperText={t('rp_shown_on_contract', lang)} />
                                    <InputGroup label={t('rp_business_address', lang)} value={leaseData.owner.address} onChange={(v) => handlers.updateLease('owner', 'address', v)} placeholder={t('rp_full_address', lang)} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};