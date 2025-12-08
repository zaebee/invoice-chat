
import { useState, useEffect, lazy, Suspense } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download, Wand2, Loader2, RotateCcw, FileText, Car, Share2, MessageCircle, CalendarDays } from 'lucide-react';
import { Link, useParams, useLocation } from 'react-router-dom';

// Standard component imports
import InvoicePreview from '../components/InvoicePreview';
import { InvoicePdf } from '../components/PdfDocument';
import { LeasePdf } from '../components/LeasePdf';
import InvoiceForm from '../components/forms/InvoiceForm';
import { LoginModal } from '../components/modals/LoginModal';
import { AiModal } from '../components/modals/AiModal';
import { ChatLayout } from '../components/chat/ChatLayout';
import SchedulePage from './SchedulePage';

// Hooks and State
import { useInvoice } from '../hooks/useInvoice';
import { useLease } from '../hooks/useLease';
import { useAiAssistant } from '../hooks/useAiAssistant';
import { useIsMobile } from '../hooks/useIsMobile';
import { useLanguage } from '../hooks/useLanguage';
import { useChatStore } from '../stores/chatStore';
import { InvoiceData, LeaseData } from '../types';
import { IBooking } from '../core/models';
import { mapEquipmentLeaseToBooking } from '../domains/equipment/adapters/equipmentAdapter'; // Import new adapter
import { t } from '../utils/i18n';
import { BrandLogo } from '../components/ui/BrandLogo';
import { LanguageSelector } from '../components/ui/LanguageSelector';

// --- DYNAMIC DOMAIN COMPONENT REGISTRY (Updated) ---
const domainRegistry = {
  vehicle: {
    form: lazy(() => import('../domains/vehicle/components/LeaseForm')),
    preview: lazy(() => import('../domains/vehicle/components/LeasePreview')),
  },
  equipment: {
    form: lazy(() => import('../domains/equipment/components/EquipmentForm')),
    preview: lazy(() => import('../domains/equipment/components/EquipmentPreview')),
  }
};

type DocType = 'invoice' | 'lease' | 'chat' | 'schedule';

// Mock data for the equipment pilot
const mockEquipmentLease = {
    leaseId: 'EQ-789',
    equipmentItem: { serialNumber: 'SN-12345', model: 'Excavator CAT 320', category: 'Heavy Machinery', hourlyRate: 150 },
    customer: { id: 'CUST-XYZ', fullName: 'John Doe Construction', phone: '555-1234' },
    hoursBooked: 40, totalCharge: 6000,
    startDate: new Date().toISOString(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'RENTED' as const
};

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [docType, setDocType] = useState<DocType>('lease'); // Default to lease to show the form
  const { lang, setLang } = useLanguage('en');
  const [isMobile, setMobileTab] = useIsMobile() ? [true, useState('edit')[0]] : [false, 'edit'];
  const lease = useLease();
  const invoice = useInvoice();
  const ai = useAiAssistant(lang);
  const chatStore = useChatStore();
  const [activeBooking, setActiveBooking] = useState<IBooking | null>(null);

  useEffect(() => {
    // --- PILOT SIMULATION ---
    // This simulates loading a booking. We'll check the route.
    // If the route is for a vehicle, load from chat store.
    // If we add a new route like /edit/equipment/EQ-789, we would load that here.
    // For now, we'll just hardcode the equipment booking for demonstration.
    if (location.pathname.includes('/equipment')) { // Fictional route for testing
        const equipmentBooking = mapEquipmentLeaseToBooking(mockEquipmentLease);
        setActiveBooking(equipmentBooking);
        // Also set the legacy `lease.data` with the original data for the form
        lease.setData(equipmentBooking.originalData);
        setDocType('lease');
    } else if (id) {
        setDocType('chat');
        chatStore.loadChatSession(id);
    } else {
        // Default to showing the equipment editor for this pilot
        const equipmentBooking = mapEquipmentLeaseToBooking(mockEquipmentLease);
        setActiveBooking(equipmentBooking);
        lease.setData(equipmentBooking.originalData);
        setDocType('lease');
    }
  }, [id, location.pathname]);


  const renderDomainFormComponent = () => {
    if (!activeBooking) return <div>Loading booking...</div>;
    const domain = activeBooking.resource.type as keyof typeof domainRegistry;
    const FormComponent = domainRegistry[domain]?.form;
    if (!FormComponent) return <div>Editor not available for '{domain}'.</div>;
    // The legacy `lease` hook holds the `originalData` needed by the old forms.
    return <FormComponent data={lease.data} handlers={lease} lang={lang} />;
  };

  const renderDomainPreviewComponent = () => {
    if (!activeBooking) return <div>Loading preview...</div>;
    const domain = activeBooking.resource.type as keyof typeof domainRegistry;
    const PreviewComponent = domainRegistry[domain]?.preview;
    if (!PreviewComponent) return <div>Preview not available for '{domain}'.</div>;
    return <PreviewComponent data={lease.data} lang={lang} />;
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
            <h1 className="font-bold">Multi-Domain Editor</h1>
        </header>
        <div className="flex-1 flex overflow-hidden">
            {docType === 'lease' ? (
                 <div className="w-full flex">
                      <div className="w-1/3 bg-white h-full p-8 overflow-y-auto">
                           <Suspense fallback={<Loader2 className="animate-spin" />}>
                              {renderDomainFormComponent()}
                           </Suspense>
                      </div>
                      <div className="w-2/3 bg-slate-800 p-8">
                           <Suspense fallback={<Loader2 className="animate-spin" />}>
                               {renderDomainPreviewComponent()}
                           </Suspense>
                      </div>
                 </div>
            ) : (
                <div className="w-full h-full"><p>Chat / Schedule view</p></div>
            )}
        </div>
    </div>
  );
}
