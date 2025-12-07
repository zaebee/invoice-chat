

import React, { useState } from 'react';
import { FileEdit, MapPin, User as UserIcon } from 'lucide-react';
import { ChatSession, LeaseData, Language } from '../../types';
import LeaseForm from '../forms/LeaseForm';
import InputGroup from '../ui/InputGroup';
import { t } from '../../utils/i18n';

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

    return (
        <div className={`bg-white border-l border-slate-100 hidden xl:flex flex-col h-full shadow-lg z-20 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'w-[360px] opacity-100' : 'w-0 opacity-0 border-none'}`}>
            <div className="w-[360px] h-full flex flex-col bg-slate-50/50">
                {/* Sidebar Header/Tabs */}
                <div className="bg-white px-4 py-3 border-b border-slate-200 shrink-0">
                    <div className="flex bg-slate-100 p-1 gap-1 rounded-xl">
                        <button onClick={() => setSidebarTab('details')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${sidebarTab === 'details' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>
                            <FileEdit size={14} /> {t('rp_details', lang)}
                        </button>
                        <button onClick={() => setSidebarTab('map')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${sidebarTab === 'map' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>
                            <MapPin size={14} /> {t('rp_map', lang)}
                        </button>
                        <button onClick={() => setSidebarTab('profile')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${sidebarTab === 'profile' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>
                            <UserIcon size={14} /> {t('rp_profile', lang)}
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {sidebarTab === 'details' && (
                        <div className="p-4 bg-white min-h-full">
                            <LeaseForm data={leaseData} handlers={handlers} lang={lang} compact={true} />
                        </div>
                    )}

                    {sidebarTab === 'map' && (
                        <div className="h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 relative p-6 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <MapPin size={32} className="text-blue-500" />
                            </div>
                            <h4 className="text-slate-800 font-bold text-sm mb-1">{t('rp_pickup_location', lang)}</h4>
                            <p className="text-xs mb-6 max-w-[200px]">{leaseData.owner.address}</p>
                            <div className="w-full aspect-square bg-slate-200 rounded-xl border border-slate-300 flex items-center justify-center overflow-hidden relative">
                                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-10 grayscale"></div>
                                <span className="text-xs font-bold relative z-10 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">{t('rp_map_placeholder', lang)}</span>
                            </div>
                        </div>
                    )}

                    {sidebarTab === 'profile' && (
                        <div className="p-4 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 flex flex-col items-center relative">
                                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-br from-blue-50 to-slate-100 z-0"></div>
                                <div className="relative z-10 w-24 h-24 rounded-full bg-white p-1 mb-3 shadow-md">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center font-bold text-3xl text-slate-300 border border-slate-100">
                                        {chat.user.avatar ? <img src={chat.user.avatar} alt="Profile" className="w-full h-full object-cover" /> : chat.user.name[0]}
                                    </div>
                                    <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-white ${chat.user.status === 'online' ? 'bg-green-500' : 'bg-slate-300'} hidden`}></div>
                                </div>
                                <h3 className="font-bold text-xl text-slate-800 text-center relative z-10">{chat.user.name}</h3>
                                <p className="text-xs text-slate-400 font-medium mb-3 relative z-10">{chat.user.role}</p>
                                <div className="flex gap-2 w-full pt-4 border-t border-slate-100">
                                    <div className="flex-1 flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">{t('rp_leases', lang)}</span>
                                        <span className="text-sm font-bold text-slate-700">1</span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">{t('rp_status', lang)}</span>
                                        <span className="text-sm font-bold text-green-600">{t('rp_active', lang)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase px-2">{t('rp_rider_details', lang)}</h4>
                                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
                                    <InputGroup label={`${t('rp_full_name', lang)} *`} value={leaseData.renter.surname || chat.user.name} onChange={(v) => handlers.updateLease('renter', 'surname', v)} placeholder={t('rp_enter_name', lang)} />
                                    <InputGroup label={`${t('rp_contact_info', lang)} *`} value={leaseData.renter.contact || ''} onChange={(v) => handlers.updateLease('renter', 'contact', v)} placeholder={t('rp_phone_email', lang)} />
                                    <InputGroup label={t('rp_passport_id', lang)} value={leaseData.renter.passport || ''} onChange={(v) => handlers.updateLease('renter', 'passport', v)} placeholder={t('rp_passport_number', lang)} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase px-2">{t('rp_owner_details', lang)}</h4>
                                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
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
