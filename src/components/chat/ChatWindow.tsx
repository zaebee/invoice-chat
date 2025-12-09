import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Phone, Video, Send, Smile, Image as ImageIcon, ArrowLeft, MoreVertical, PanelRightClose, PanelRightOpen, 
    MessageSquare, FileText, Download, Loader2, Eye, Car, Check, Sparkles, X, PlusCircle, AlertTriangle, PartyPopper, ThumbsUp
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { ChatSession, LeaseData, Language, InvoiceData, INITIAL_INVOICE, NtfyAction } from '../../types';
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
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [showTagSelector, setShowTagSelector] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const tagSelectorRef = useRef<HTMLDivElement>(null);
    
    // Store Actions
    const { 
        sendMessage, 
        sendImage, 
        markMessageAsRead, 
        confirmReservation, 
        rejectReservation, 
        collectReservation, 
        completeReservation,
        aiSuggestion,
        clearAiSuggestion
    } = useChatStore();
    
    // Deadline Hook
    const deadline = useDeadline(leaseData.deadline);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (tagSelectorRef.current && !tagSelectorRef.current.contains(event.target as Node)) {
                setShowTagSelector(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!messageInput.trim()) return;
        
        const tags = selectedTag ? [selectedTag] : [];
        const actions: NtfyAction[] = []; // Could add default view action here if needed

        sendMessage(messageInput, tags, actions);
        setMessageInput('');
        setSelectedTag(null);
        setShowTagSelector(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) sendImage(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Handle suggested action click
    const handleSuggestionClick = async () => {
        if (!aiSuggestion) return;
        
        switch (aiSuggestion.action) {
            case 'confirm':
                await confirmReservation();
                break;
            case 'reject':
                await rejectReservation();
                break;
            case 'collect':
                await collectReservation();
                break;
            case 'complete':
                await completeReservation();
                break;
        }
    };

    const getSuggestionLabel = (action: string) => {
        switch (action) {
            case 'confirm': return t('btn_confirm', lang);
            case 'reject': return t('btn_reject', lang);
            case 'collect': return t('btn_collect', lang);
            case 'complete': return t('btn_complete', lang);
            default: return action;
        }
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

    const REACTION_TAGS = [
        { id: 'warning', icon: <AlertTriangle size={16} />, label: 'Urgent', color: 'text-red-500 bg-red-50 border-red-200' },
        { id: 'white_check_mark', icon: <Check size={16} />, label: 'Done', color: 'text-green-500 bg-green-50 border-green-200' },
        { id: 'tada', icon: <PartyPopper size={16} />, label: 'Party', color: 'text-purple-500 bg-purple-50 border-purple-200' },
        { id: '+1', icon: <ThumbsUp size={16} />, label: 'Ack', color: 'text-blue-500 bg-blue-50 border-blue-200' },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50/30 relative">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

            {/* HEADER */}
            <div className="h-14 md:h-16 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-3 md:px-6 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm z-20">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    {isMobile && (
                        <button onClick={onBack} className="-ml-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative shrink-0">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700 overflow-hidden">
                                {chat.user.avatar ? <img src={chat.user.avatar} alt={chat.user.name} className="w-full h-full object-cover" /> : chat.user.name[0]}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-slate-900 rounded-full ${chat.user.status === 'online' ? 'bg-green-500' : 'bg-slate-300'} md:block hidden`}></div>
                        </div>
                        <div className="flex flex-col min-w-0 justify-center">
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate leading-tight">{chat.user.name}</h3>
                                {isMobile && <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.accent}`} />}
                            </div>
                            {!isMobile && (
                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    {t('chat_active', lang)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-1 md:gap-2 text-slate-400 dark:text-slate-500 items-center shrink-0 relative">
                    {/* Preview Button (Chat Mode Only) */}
                    {activeTab === 'chat' && (
                        <button 
                            onClick={() => setActiveTab('lease')}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition-all"
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
                                ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800' 
                                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                        }`}
                        title={activeTab === 'invoice' ? t('btn_download_invoice', lang) : t('btn_download_lease', lang)}
                    >
                        {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        <span className="hidden lg:inline">{t('download_pdf', lang)}</span>
                    </button>

                    <button className="hidden md:block p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><Phone size={18} /></button>
                    <button className="hidden md:block p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><Video size={18} /></button>
                    
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden xl:block"></div>
                    <button 
                        onClick={onToggleSidebar}
                        className={`p-2 rounded-full transition-colors hidden xl:block ${isSidebarOpen ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        title="Toggle Context Panel"
                    >
                        {isSidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
                    </button>

                    {/* MOBILE MENU DROPDOWN */}
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            <MoreVertical size={18} />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-1.5 space-y-0.5">
                                    <button 
                                        onClick={() => { setActiveTab('chat'); setIsMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'chat' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                    >
                                        <MessageSquare size={16} /> {t('switch_chat', lang)}
                                        {activeTab === 'chat' && <Check size={14} className="ml-auto" />}
                                    </button>
                                    <button 
                                        onClick={() => { setActiveTab('lease'); setIsMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'lease' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                    >
                                        <Car size={16} /> {t('switch_lease', lang)}
                                        {activeTab === 'lease' && <Check size={14} className="ml-auto" />}
                                    </button>
                                    <button 
                                        onClick={() => { setActiveTab('invoice'); setIsMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'invoice' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                    >
                                        <FileText size={16} /> {t('switch_invoice', lang)}
                                        {activeTab === 'invoice' && <Check size={14} className="ml-auto" />}
                                    </button>
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-700 p-1.5 space-y-0.5">
                                    <button 
                                        onClick={() => { handleDownloadPdf('lease'); setIsMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
                                    >
                                        <Download size={14} /> {t('btn_download_lease', lang)}
                                    </button>
                                    <button 
                                        onClick={() => { handleDownloadPdf('invoice'); setIsMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
                                    >
                                        <Download size={14} /> {t('btn_download_invoice', lang)}
                                    </button>
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-700 p-1.5">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
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
                        onCollect={collectReservation}
                        onComplete={completeReservation}
                        leaseStatus={leaseData.status}
                        lang={lang}
                        deadline={deadline}
                    />
                )}

                {/* LEASE VIEW */}
                {activeTab === 'lease' && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-950 p-4 flex justify-center">
                        <div className="w-full max-w-[210mm] origin-top bg-white shadow-lg min-h-[297mm]">
                            <LeasePreview data={leaseData} lang={lang} />
                        </div>
                    </div>
                )}

                {/* INVOICE VIEW */}
                {activeTab === 'invoice' && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-950 p-4 flex justify-center">
                        <div className="w-full max-w-[210mm] origin-top bg-white shadow-lg min-h-[297mm]">
                            <InvoicePreview data={invoiceData} />
                        </div>
                    </div>
                )}

            </div>

            {/* INPUT AREA (Only in Chat) */}
            {activeTab === 'chat' && (
                <div className="p-2 md:p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                    
                    {/* SMART SUGGESTION */}
                    {aiSuggestion && (
                        <div className="mb-3 mx-1 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-100 dark:border-purple-800 rounded-xl p-3 flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300 shadow-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/40 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-full text-purple-600 dark:text-purple-400 shadow-sm shrink-0">
                                <Sparkles size={16} className="animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-0.5">{t('lbl_ai_suggestion', lang)}</div>
                                <div className="text-xs text-slate-700 dark:text-slate-300 truncate">{aiSuggestion.reason}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button 
                                    onClick={handleSuggestionClick}
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
                                >
                                    {getSuggestionLabel(aiSuggestion.action)}
                                </button>
                                <button 
                                    onClick={clearAiSuggestion}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="relative flex items-center gap-2">
                        {/* TAG SELECTOR POPOVER */}
                        {showTagSelector && (
                            <div 
                                ref={tagSelectorRef}
                                className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
                            >
                                {REACTION_TAGS.map(tag => (
                                    <button
                                        key={tag.id}
                                        onClick={() => { setSelectedTag(selectedTag === tag.id ? null : tag.id); setShowTagSelector(false); }}
                                        className={`p-2 rounded-lg transition-all hover:scale-110 flex flex-col items-center gap-1 min-w-[50px]
                                            ${selectedTag === tag.id ? tag.color : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}
                                        `}
                                    >
                                        {tag.icon}
                                        <span className="text-[9px] font-bold uppercase tracking-wider">{tag.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <form className="relative flex items-center gap-2 flex-1" onSubmit={handleSend} autoComplete="off">
                            <button 
                                type="button" 
                                onClick={() => setShowTagSelector(!showTagSelector)} 
                                className={`p-2.5 rounded-full transition-colors hidden md:block ${selectedTag ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <PlusCircle size={20} />
                            </button>

                            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors md:hidden">
                                <ImageIcon size={22} />
                            </button>
                            
                            <div className="flex-1 relative">
                                {selectedTag && (
                                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10">
                                        <span className="flex items-center justify-center w-7 h-7 bg-purple-100 text-purple-600 rounded-full text-xs font-bold shadow-sm">
                                            {REACTION_TAGS.find(t => t.id === selectedTag)?.icon}
                                        </span>
                                    </div>
                                )}
                                <input 
                                    type="text" 
                                    name="message"
                                    className={`w-full bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 border focus:border-blue-300 dark:focus:border-blue-700 rounded-full py-2.5 md:py-3 pr-10 md:pr-12 text-base md:text-sm focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 text-slate-800 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600
                                        ${selectedTag ? 'pl-10' : 'pl-4 md:pl-5'}
                                    `}
                                    placeholder={t('chat_type_message', lang)}
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                />
                            </div>

                            <div className="absolute right-14 md:right-14 flex gap-2 text-slate-400 dark:text-slate-500 hidden md:flex">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1">
                                    <ImageIcon size={20} />
                                </button>
                                <button type="button" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"><Smile size={20} /></button>
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
                </div>
            )}
        </div>
    );
};