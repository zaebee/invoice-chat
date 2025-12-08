
import React, { useState } from 'react';
import { FileEdit, MapPin, User as UserIcon } from 'lucide-react';
import { ChatSession, Language, LeaseData } from '../../types';
import { IBooking } from '../../core/models';
import LeaseForm from '../../domains/vehicle/components/LeaseForm'; // Kept for compatibility
import InputGroup from '../ui/InputGroup';
import { t } from '../../utils/i18n';

interface RightPanelProps {
    chat: ChatSession;
    booking: IBooking; // Changed from leaseData
    lang: Language;
    handlers: any;
    isOpen: boolean;
}

export const RightPanel: React.FC<RightPanelProps> = ({ 
    chat, booking, lang, handlers, isOpen
}) => {
    const [sidebarTab, setSidebarTab] = useState<'profile' | 'details' | 'map'>('details');

    return (
        <div className={`bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 hidden xl:flex flex-col h-full shadow-lg z-20 transition-all duration-300 ${isOpen ? 'w-[360px]' : 'w-0'}`}>
            <div className="w-[360px] h-full flex flex-col bg-slate-50/50 dark:bg-slate-950/50">
                <div className="bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 gap-1 rounded-xl">
                        {/* Tabs remain the same */}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {sidebarTab === 'details' && (
                        <div className="p-4 bg-white dark:bg-slate-900 min-h-full">
                            {/*
                                COMPATIBILITY LAYER:
                                The LeaseForm is a highly domain-specific component. Instead of refactoring it now,
                                we pass the original, un-mapped data from the booking object. This allows the core
                                of the app to be refactored while isolating legacy components.
                            */}
                            <LeaseForm data={booking.originalData as LeaseData} handlers={handlers} lang={lang} compact={true} />
                        </div>
                    )}

                    {sidebarTab === 'map' && (
                        <div className="h-full bg-slate-100 dark:bg-slate-900 p-6 text-center">
                            <h4 className="font-bold text-sm mb-1">{t('rp_pickup_location', lang)}</h4>
                            {/* Pull address from the booking's metadata */}
                            <p className="text-xs mb-6">{booking.metadata.owner?.address}</p>
                            <div className="w-full aspect-square bg-slate-200 rounded-xl flex items-center justify-center">
                                {t('rp_map_placeholder', lang)}
                            </div>
                        </div>
                    )}

                    {sidebarTab === 'profile' && (
                        <div className="p-4 space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 flex flex-col items-center">
                                <h3 className="font-bold text-xl">{booking.client.name}</h3>
                                <p className="text-xs text-slate-400">{chat.user.role}</p>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase px-2">{t('rp_rider_details', lang)}</h4>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 space-y-4">
                                    {/* These inputs now read from and update the agnostic booking model via handlers */}
                                    <InputGroup label={`${t('rp_full_name', lang)} *`} value={booking.client.name} onChange={(v) => handlers.updateBooking('client', 'name', v)} />
                                    <InputInputGroup label={`${t('rp_contact_info', lang)} *`} value={booking.client.contact.phone || ''} onChange={(v) => handlers.updateBooking('client', 'contact', { ...booking.client.contact, phone: v })} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
