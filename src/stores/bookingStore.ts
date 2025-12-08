
import { create } from 'zustand';
import { IBooking } from '../core/models';
import { loadBookingData } from '../services/ownimaApi'; // Using the refactored service

interface BookingState {
    activeBooking: IBooking | null;
    isLoading: boolean;
    error: string | null;
    loadBooking: (id: string) => Promise<void>;
    updateBooking: (booking: IBooking) => void; // For optimistic updates
    // Domain-specific actions will be added here later
}

export const useBookingStore = create<BookingState>((set) => ({
    activeBooking: null,
    isLoading: false,
    error: null,

    loadBooking: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const booking = await loadBookingData(id);
            set({ activeBooking: booking, isLoading: false });
        } catch (e: any) {
            console.error("Failed to load booking:", e);
            set({ error: e.message, isLoading: false });
        }
    },

    updateBooking: (booking: IBooking) => {
        set({ activeBooking: booking });
    },
}));
