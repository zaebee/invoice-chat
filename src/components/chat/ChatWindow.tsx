
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Phone, Video, Send, Smile, Image as ImageIcon, ArrowLeft, MoreVertical, PanelRightClose, PanelRightOpen, 
    MessageSquare, FileText, Download, Loader2, Eye, Car, Check, Sparkles, X
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { ChatSession, Language, InvoiceData, INITIAL_INVOICE, LeaseData } from '../../types';
import { IBooking } from '../../core/models'; // Import IBooking
import { useIsMobile } from '../../hooks/useIsMobile';
import { useChatStore } from '../../stores/chatStore';
import { t } from '../../utils/i18n';
import { getGenericStatusConfig } from './ChatUtils'; // Use new generic config
import { useDeadline } from '../../hooks/useDeadline';
import LeasePreview from '../../domains/vehicle/components/LeasePreview'; // Keep for now
import InvoicePreview from '../InvoicePreview';
import { LeasePdf } from '../LeasePdf'; // Keep for now
import { InvoicePdf } from '../PdfDocument';
import { ChatContextHeader } from './ChatContextHeader';
import { ChatContextMobile } from './ChatContextMobile';
import { ChatMessageList } from './ChatMessageList';

interface ChatWindowProps {
    chat: ChatSession;
    booking: IBooking; // Changed from leaseData to booking
    lang: Language;
    onBack: () => void;
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
    chat, booking, lang, onBack, onToggleSidebar, isSidebarOpen
}) => {
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState<'chat' | 'lease' | 'invoice'>('chat');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    
    const { 
        sendMessage, sendImage, markMessageAsRead,
        confirmReservation, rejectReservation, collectReservation, completeReservation,
        aiSuggestion, clearAiSuggestion
    } = useChatStore();
    
    const deadline = useDeadline(booking.metadata.deadline);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!messageInput.trim()) return;
        sendMessage(messageInput);
        setMessageInput('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) sendImage(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSuggestionClick = async () => {
        if (!aiSuggestion) return;
        const actions: { [key: string]: () => Promise<void> } = {
            'confirm': confirmReservation, 'reject': rejectReservation,
            'collect': collectReservation, 'complete': completeReservation,
        };
        await actions[aiSuggestion.action]?.();
    };

    const getSuggestionLabel = (action: string) => t(`btn_${action}` as any, lang) || action;

    // --- REFACTORED INVOICE DATA ---
    // Invoice data is now generated from the agnostic IBooking model
    const invoiceData = useMemo<InvoiceData>(() => ({
        ...INITIAL_INVOICE,
        number: booking.id,
        date: booking.dateFrom.toISOString().split('T')[0],
        currency: booking.currency,
        seller: { ...INITIAL_INVOICE.seller, name: booking.metadata.owner?.name || 'Owner' },
        buyer: { ...INITIAL_INVOICE.buyer, name: booking.client.name },
        items: [{
            id: 'rent',
            name: `Rental: ${booking.resource.name} (${booking.resource.metadata.plate})`,
            quantity: 1,
            price: booking.totalPrice
        }],
        vatRate: -1,
    }), [booking]);

    const handleDownloadPdf = async (targetType?: 'lease' | 'invoice') => {
        const type = targetType || (activeTab === 'invoice' ? 'invoice' : 'lease');
        setIsGeneratingPdf(true);
        try {
            let doc, filename;
            if (type === 'invoice') {
                doc = <InvoicePdf data={invoiceData} />;
                filename = `invoice_${invoiceData.number}.pdf`;
            } else {
                // The LeasePdf component still expects the old LeaseData format.
                // We pass the `originalData` from the booking object as a compatibility layer.
                doc = <LeasePdf data={booking.originalData as LeaseData} />;
                filename = `lease_${booking.id}.pdf`;
            }
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF Error", error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // Use the new generic status config
    const statusConfig = getGenericStatusConfig(booking.status, lang);

    return (
        <div className="flex flex-col h-full bg-slate-50/30 relative">
            {/* HEADER */}
            <div className="h-14 md:h-16 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-3 md:px-6 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-20">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    {isMobile && <button onClick={onBack} className="p-2"><ArrowLeft size={20} /></button>}
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">{chat.user.name}</h3>
                </div>
            </div>

            {/* Use IBooking in context headers */}
            {activeTab === 'chat' && <ChatContextMobile booking={booking} lang={lang} deadline={deadline} />}
            {activeTab === 'chat' && <ChatContextHeader booking={booking} lang={lang} deadline={deadline} />}

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                {activeTab === 'chat' && (
                    <ChatMessageList 
                        messages={chat.messages}
                        currentUser={chat.user}
                        onReadMessage={(id) => markMessageAsRead(chat.id, id)}
                        leaseStatus={(booking.originalData as LeaseData)?.status} // Still needed for some message types
                        lang={lang}
                    />
                )}
                {activeTab === 'lease' && (
                    <div className="flex-1 overflow-y-auto p-4 justify-center">
                        <div className="w-full max-w-[210mm] bg-white shadow-lg"><LeasePreview data={booking.originalData as LeaseData} lang={lang} /></div>
                    </div>
                )}
                {activeTab === 'invoice' && (
                    <div className="flex-1 overflow-y-auto p-4 justify-center">
                        <div className="w-full max-w-[210mm] bg-white shadow-lg"><InvoicePreview data={invoiceData} /></div>
                    </div>
                )}
            </div>

            {/* INPUT AREA */}
            {activeTab === 'chat' && (
                <div className="p-2 md:p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
                    {aiSuggestion && (
                        <div className="mb-3 p-3 flex items-center gap-3">
                            <button onClick={handleSuggestionClick} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg">{getSuggestionLabel(aiSuggestion.action)}</button>
                            <button onClick={clearAiSuggestion} className="p-1.5"><X size={14} /></button>
                        </div>
                    )}
                    <form className="relative flex items-center gap-2" onSubmit={handleSend}>
                        <input type="text" className="flex-1 bg-slate-50 rounded-full py-2.5 pl-4 pr-10" placeholder={t('chat_type_message', lang)} value={messageInput} onChange={(e) => setMessageInput(e.target.value)} />
                        <button type="submit" disabled={!messageInput.trim()} className="bg-blue-600 text-white p-2.5 rounded-full"><Send size={18} /></button>
                    </form>
                </div>
            )}
        </div>
    );
};
