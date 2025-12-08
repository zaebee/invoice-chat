
import { create } from 'zustand';

interface AiSuggestion {
  action: 'confirm' | 'reject' | 'collect' | 'complete';
  reason: string;
}

interface UiState {
  activeBookingId: string | null;
  isLoading: boolean;
  error: string | null;
  aiSuggestion: AiSuggestion | null;
  setActiveBookingId: (id: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setAiSuggestion: (suggestion: AiSuggestion | null) => void;
  clearAiSuggestion: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeBookingId: null,
  isLoading: false,
  error: null,
  aiSuggestion: null,

  setActiveBookingId: (id: string | null) => set({ activeBookingId: id, aiSuggestion: null }), // Clear suggestion on switch
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  setAiSuggestion: (suggestion: AiSuggestion | null) => set({ aiSuggestion: suggestion }),
  clearAiSuggestion: () => set({ aiSuggestion: null }),
}));
