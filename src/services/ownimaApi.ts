// src/services/ownimaApi.ts

import { IBooking } from "../core/models";
import { mapApiResponseToBooking } from "../domains/vehicle/adapters/reservationAdapter";
import { authService } from "./authService";
import QRCode from 'qrcode';

// --- CONFIGURATION ---

const BASE_RESERVATION_URL = process.env.OWNIMA_API_URL || 'https://stage.ownima.com/api/v1/reservation';
const API_V1_ROOT = BASE_RESERVATION_URL.replace(/\/reservation\/?$/, '');
const INVOICE_ENDPOINT = `${API_V1_ROOT}/finance/invoice`;
const OWNER_PROFILE_ENDPOINT = `${API_V1_ROOT}/rider/owner`;
const CHAT_BASE_URL = 'https://stage.ownima.com';

// --- INTERFACES ---

// This interface remains as it describes a specific, non-core API entity.
interface OwnerProfile {
    id: string;
    username: string;
    name: string;
    address: string;
    rent_service_name?: string;
    bio?: string;
}

// --- HELPER FUNCTIONS ---

const getAuthHeaders = (): Record<string, string> => {
    const token = authService.getToken();
    const headers: Record<string, string> = { 'accept': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const fetchOwnerProfile = async (ownerId: string, signal?: AbortSignal): Promise<OwnerProfile | null> => {
    try {
        const response = await fetch(`${OWNER_PROFILE_ENDPOINT}/${ownerId}/profile`, {
            headers: getAuthHeaders(),
            signal
        });
        if (!response.ok) {
            console.warn(`Failed to fetch owner profile: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (error: any) {
        if (error.name !== 'AbortError') {
            console.error("Fetch Owner Profile Error", error);
        }
        return null;
    }
};

// --- PRIMARY API SERVICES (Refactored) ---

/**
 * Fetches reservation data from the API and maps it to the generic IBooking model.
 * @param id - The reservation ID.
 * @param signal - An optional AbortSignal.
 * @returns A Promise resolving to an IBooking object or null if not found.
 */
export const fetchBooking = async (id: string, signal?: AbortSignal): Promise<IBooking | null> => {
    try {
        const response = await fetch(`${BASE_RESERVATION_URL}/${id}`, {
            headers: getAuthHeaders(),
            signal
        });

        if (response.status === 401) throw new Error("Unauthorized");
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        
        const ownerId = data.reservation?.owner_id;
        const ownerProfile = ownerId ? await fetchOwnerProfile(ownerId, signal) : null;

        // The adapter now handles the entire transformation.
        return mapApiResponseToBooking(data, ownerProfile);

    } catch (error: any) {
        if (error.name === 'AbortError') throw error; // Don't log aborts as errors
        console.error("fetchBooking error:", error);
        throw error; // Propagate error for UI to handle.
    }
};

/**
 * Loads the full booking data, including generating a QR code.
 * This function ensures a complete, UI-ready IBooking object is returned.
 * @param id - The reservation ID.
 * @param signal - An optional AbortSignal.
 * @returns A Promise resolving to a complete IBooking object.
 */
export const loadBookingData = async (id: string, signal?: AbortSignal): Promise<IBooking> => {
    const booking = await fetchBooking(id, signal);
    
    if (!booking) {
        throw new Error("Reservation not found");
    }

    // Generate QR Code and add it to the booking's metadata.
    try {
        const url = `https://stage.ownima.com/qr/${id}`;
        const qrCodeUrl = await QRCode.toDataURL(url, { margin: 1, width: 200 });
        booking.metadata.qrCodeUrl = qrCodeUrl;
    } catch (e) {
        console.error("QR Code generation failed:", e);
        // Do not block return if QR fails; can be handled gracefully in UI.
    }

    return booking;
};


// --- UNCHANGED SERVICES (Invoice, Chat, etc.) ---
// These services are not directly tied to the LeaseData model and remain as they were.

export const fetchInvoiceHtml = async (reservationId: string, templateId: string): Promise<string> => {
    try {
        const url = `${INVOICE_ENDPOINT}/${reservationId}/${templateId}?output=html`;
        const response = await fetch(url, { headers: getAuthHeaders() });
        if (response.status === 401) throw new Error("Unauthorized");
        if (!response.ok) throw new Error(`Invoice API Error: ${response.status}`);
        return await response.text();
    } catch (error) {
        console.error("Fetch Invoice HTML Error", error);
        throw error;
    }
};

export const fetchInvoicePdfBlob = async (reservationId: string, templateId: string): Promise<Blob> => {
    try {
        const url = `${INVOICE_ENDPOINT}/${reservationId}/${templateId}?output=pdf`;
        const response = await fetch(url, { headers: getAuthHeaders() });
        if (response.status === 401) throw new Error("Unauthorized");
        if (!response.ok) throw new Error(`Invoice API Error: ${response.status}`);
        return await response.blob();
    } catch (error) {
        console.error("Fetch Invoice PDF Error", error);
        throw error;
    }
};

export interface HistoryEvent {
    confirmation_date: string;
    confirmation_note?: string;
    status: number | string;
    meta?: { [key: string]: any; };
    [key: string]: any;
}

export const fetchReservationHistory = async (id: string, signal?: AbortSignal): Promise<HistoryEvent[]> => {
    try {
        const response = await fetch(`${BASE_RESERVATION_URL}/${id}/history`, { headers: getAuthHeaders(), signal });
        if (response.status === 401) throw new Error("Unauthorized");
        if (!response.ok) throw new Error("Network response not ok");
        const data = await response.json();
        return data.history?.confirmations || data.history || data || [];
    } catch (e: any) {
        if (e.name === 'AbortError') throw e;
        return [];
    }
};

export const fetchNtfyMessages = async (topicId: string, signal?: AbortSignal) => {
    try {
        const response = await fetch(`${CHAT_BASE_URL}/chat-${topicId}/json?poll=1&since=all`, { signal });
        if (!response.ok) throw new Error("Chat unreachable");
        const text = await response.text();
        return text.trim().split('\n').map(line => {
            try { return JSON.parse(line); } catch (e) { return null; }
        }).filter((msg: any) => msg && msg.event === 'message');
    } catch (e: any) {
        if (e.name === 'AbortError') throw e;
        return [];
    }
};

export const sendNtfyMessage = async (topicId: string, message: string) => {
    try {
        await fetch(`${CHAT_BASE_URL}/chat-${topicId}`, {
            method: 'POST',
            body: message,
            headers: { 'Priority': 'low' }
        });
    } catch (e) {
        console.error("Send chat error", e);
    }
};

export const sendNtfyImage = async (topicId: string, file: File) => {
    try {
        await fetch(`${CHAT_BASE_URL}/chat-${topicId}`, {
            method: 'PUT',
            body: file,
            headers: { 'Filename': file.name }
        });
    } catch (e) {
        console.error("Send image error", e);
    }
};

export const getChatSseUrl = (topicId: string) => `${CHAT_BASE_URL}/chat-${topicId}/sse`;
