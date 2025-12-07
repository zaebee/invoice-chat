
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Phone, Video, Send, Smile, Image as ImageIcon, ArrowLeft, MoreVertical, PanelRightClose, PanelRightOpen, 
    MessageSquare, FileText, Download, Loader2, Eye, Car, Check
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { ChatSession, LeaseData, Language, InvoiceData, INITIAL_INVOICE } from '../../types';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useChatStore } from '../../stores/chatStore';
import { t } from '../../utils/i18n';
import { STATUS_CONFIG } from './ChatUtils';
import { useDeadline } from '../../hooks/useDeadline';
import LeasePreview from '../LeasePreview';
import InvoicePreview from '../InvoicePreview';
import { LeasePdf } from '../LeasePdf';
import { InvoicePdf } from '../PdfDocument';
import { ChatContextHeader } from './ChatContextHeader';
import { ChatContextMobile } from './ChatContextMobile';
import { ChatMessageList } from './ChatMessageList';
import { StatusBadge } from './StatusBadge';

interface ChatWindowProps {
    chat: ChatSession;
    leaseData: LeaseData;
    lang: Language;
    onBack: () => void;
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
    chat, leaseData, lang, onBack, onToggleSidebar, isSidebarOpen 
}) => {
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState<'chat' | 'lease' | 'invoice'>('chat');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    
    // Store Actions
    const { sendMessage, sendImage, markMessageAsRead, confirmReservation, rejectReservation } = useChatStore();
    
    // Deadline Hook
    const deadline = useDeadline(leaseData.deadline);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!messageInput.trim()) return;
        sendMessage(messageInput);
        setMessageInput('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) sendImage(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Construct Invoice Data from Lease Data on the fly
    const invoiceData = useMemo<InvoiceData>(() => {
        return {
            ...INITIAL_INVOICE,
            number: leaseData.reservationId,
            date: leaseData.createdDate?.split(' ')[0] || new Date().toISOString().split('T')[0],
            currency: leaseData.pricing.currency || 'RUB',
            seller: {
                ...INITIAL_INVOICE.seller,
                name: leaseData.owner.surname,
                address: leaseData.owner.address,
            },
            buyer: {
                ...INITIAL_INVOICE.buyer,
                name: leaseData.renter.surname,
            },
            items: [
                {
                    id: 'rent',
                    name: `Rental: ${leaseData.vehicle.name} (${leaseData.vehicle.plate})`,
                    quantity: 1,
                    price: leaseData.pricing.total
                }
            ],
            vatRate: -1,
        };
    }, [leaseData]);

    const handleDownloadPdf = async (targetType?: 'lease' | 'invoice') => {
        const type = targetType || (activeTab === 'invoice' ? 'invoice' : 'lease');
        setIsGeneratingPdf(true);
        try {
            let doc;
            let filename;
            
            if (type === 'invoice') {
                doc = <InvoicePdf data={invoiceData} />;
                filename = `invoice_${invoiceData.number}.pdf`;
            } else {
                doc = <LeasePdf data={leaseData} />;
                filename = `lease_${leaseData.reservationId}.pdf`;
            }

            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF Error", error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const statusConfig = STATUS_CONFIG[leaseData.status || 'pending'] || STATUS_CONFIG['pending'];

    return (
        <div className="flex flex-col h-full bg-slate-50/30 relative">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

            {/* HEADER */}
            <div className="h-14 md:h-16 border-b border-slate-200 flex justify-between items-center px-3 md:px-6 shrink-0 bg-white/95 backdrop-blur-sm shadow-sm z-20">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    {isMobile && (
                        <button onClick={onBack} className="-ml-2 p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative shrink-0">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 overflow-hidden">
                                {chat.user.avatar ? <img src={chat.user.avatar} alt={chat.user.name} className="w-full h-full object-cover" /> : chat.user.name[0]}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${chat.user.status === 'online' ? 'bg-green-500' : 'bg-slate-300'} md:block hidden`}></div>
                        </div>
                        <div className="flex flex-col min-w-0 justify-center">
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-slate-800 text-sm truncate leading-tight">{chat.user.name}</h3>
                                {isMobile && <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.accent}`} />}
                            </div>
                            {!isMobile && (
                                <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    {t('chat_active', lang)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-1 md:gap-2 text-slate-400 items-center shrink-0 relative">
                    {/* Preview Button (Chat Mode Only) */}
                    {activeTab === 'chat' && (
                        <button 
                            onClick={() => setActiveTab('lease')}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold transition-all"
                            title={t('preview', lang)}
                        >
                            <Eye size={16} />
                            <span>{t('preview', lang)}</span>
                        </button>
                    )}

                    {/* Download Button (Always Visible) */}
                    <button 
                        onClick={() => handleDownloadPdf()}
                        disabled={isGeneratingPdf}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                            activeTab === 'chat' 
                                ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' 
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                        title={activeTab === 'invoice' ? t('btn_download_invoice', lang) : t('btn_download_lease', lang)}
                    >
                        {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        <span className="hidden lg:inline">{t('download_pdf', lang)}</span>
                    </button>

                    <button className="hidden md:block p-2 hover:bg-slate-100 rounded-full hover:text-slate-600 transition-colors"><Phone size={18} /></button>
                    <button className="hidden md:block p-2 hover:bg-slate-100 rounded-full hover:text-slate-600 transition-colors"><Video size={18} /></button>
                    
                    <div className="h-6 w-px bg-slate-200 mx-1 hidden xl:block"></div>
                    <button 
                        onClick={onToggleSidebar}
                        className={`p-2 rounded-full transition-colors hidden xl:block ${isSidebarOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 hover:text-slate-600'}`}
                        title="Toggle Context Panel"
                    >
                        {isSidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
                    </button>

                    {/* MOBILE MENU DROPDOWN */}
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100 hover:text-slate-600'}`}
                        >
                            <MoreVertical size={18} />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-1.5 space-y-0.5">
                                    <button 
                                        onClick={() => { setActiveTab('chat'); setIsMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'chat' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <MessageSquare size={16} /> {t('switch_chat', lang)}
                                        {activeTab === 'chat' && <Check size={14} className="ml-auto" />}
                                    </button>
                                    <button 
                                        onClick={() => { setActiveTab('lease'); setIsMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'lease' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <Car size={16} /> {t('switch_lease', lang)}
                                        {activeTab === 'lease' && <Check size={14} className="ml-auto" />}
                                    </button>
                                    <button 
                                        onClick={() => { setActiveTab('invoice'); setIsMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'invoice' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <FileText size={16} /> {t('switch_invoice', lang)}
                                        {activeTab === 'invoice' && <Check size={14} className="ml-auto" />}
                                    </button>
                                </div>
                                <div className="border-t border-slate-100 p-1.5 space-y-0.5">
                                    <button 
                                        onClick={() => { handleDownloadPdf('lease'); setIsMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                                    >
                                        <Download size={14} /> {t('btn_download_lease', lang)}
                                    </button>
                                    <button 
                                        onClick={() => { handleDownloadPdf('invoice'); setIsMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                                    >
                                        <Download size={14} /> {t('btn_download_invoice', lang)}
                                    </button>
                                </div>
                                <div className="border-t border-slate-100 p-1.5">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                                        <Phone size={16} /> {t('btn_call', lang)}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CONTEXT STRIP (Mobile) */}
            {activeTab === 'chat' && (
                <ChatContextMobile leaseData={leaseData} lang={lang} deadline={deadline} />
            )}

            {/* CONTEXT ISLAND (Desktop) */}
            {activeTab === 'chat' && (
                <ChatContextHeader 
                    leaseData={leaseData} 
                    lang={lang} 
                    deadline={deadline} 
                />
            )}

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                
                {/* CHAT VIEW */}
                {activeTab === 'chat' && (
                    <ChatMessageList 
                        messages={chat.messages}
                        currentUser={chat.user}
                        onReadMessage={(id) => markMessageAsRead(chat.id, id)}
                        onConfirm={confirmReservation}
                        onReject={rejectReservation}
                        leaseStatus={leaseData.status}
                        lang={lang}
                        deadline={deadline}
                    />
                )}

                {/* LEASE VIEW */}
                {activeTab === 'lease' && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100 p-4 flex justify-center">
                        <div className="w-full max-w-[210mm] origin-top bg-white shadow-lg min-h-[297mm]">
                            <LeasePreview data={leaseData} lang={lang} />
                        </div>
                    </div>
                )}

                {/* INVOICE VIEW */}
                {activeTab === 'invoice' && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100 p-4 flex justify-center">
                        <div className="w-full max-w-[210mm] origin-top bg-white shadow-lg min-h-[297mm]">
                            <InvoicePreview data={invoiceData} />
                        </div>
                    </div>
                )}

            </div>

            {/* INPUT AREA (Only in Chat) */}
            {activeTab === 'chat' && (
                <div className="p-2 md:p-4 border-t border-slate-200 shrink-0 bg-white z-10 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                    <form className="relative flex items-center gap-2" onSubmit={handleSend} autoComplete="off">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors md:hidden">
                            <ImageIcon size={22} />
                        </button>
                        <input 
                            type="text" 
                            name="message"
                            className="flex-1 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-300 rounded-full py-2.5 md:py-3 pl-4 md:pl-5 pr-10 md:pr-12 text-base md:text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                            placeholder={t('chat_type_message', lang)}
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                        />
                        <div className="absolute right-14 md:right-14 flex gap-2 text-slate-400 hidden md:flex">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="hover:text-blue-600 transition-colors p-1">
                                <ImageIcon size={20} />
                            </button>
                            <button type="button" className="hover:text-blue-600 transition-colors p-1"><Smile size={20} /></button>
                        </div>
                        <button 
                            type="submit"
                            disabled={!messageInput.trim()}
                            className="bg-blue-600 text-white p-2.5 md:p-3 rounded-full hover:bg-blue-700 transition-all shadow-md flex-shrink-0 disabled:opacity-50 disabled:shadow-none active:scale-95"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
