
# 🚀 Ownima Pro: Architecture & Roadmap

## 🧐 Current Status Review
**Phases 1-7 Complete. Phase 8 (Intelligence) Active.**
The application is a feature-complete **PWA Rental Workspace** with a robust "Freeze Pane" Gantt-chart schedule, full internationalization, and dark mode.

**Core Strengths:**
*   **Dual Engine:** Seamlessly handles structured Invoices and complex Lease Agreements.
*   **Hybrid Rendering:** Client-Side PDF generation (`@react-pdf`) + Server-Side HTML previews.
*   **Secure:** Integrated Token-based Authentication & Iframe Handshake.
*   **Offline-Ready:** Service Worker caching, IndexedDB persistence, & Background Sync logic.
*   **Collaborative:** Real-time Chat with media, system events, and full lease lifecycle (Confirm -> Collect -> Complete).
*   **Visual Schedule:** High-performance "Spreadsheet-style" Gantt chart with "Tetris" packing algorithm.

---

## 🚧 Current Focus: Phase 8 - AI Intelligence

We are actively enhancing the "Smart" aspects using Google Gemini.

### 1. 🤖 AI Chat Copilot (Implemented)
*   **Intent Detection:** System analyzes the last 10 messages + current Lease Status to suggest workflow actions.
    *   *Example:* Status is `confirmed`, Renter says "I'm outside". AI suggests **Collect Vehicle** action.
*   **Smart Import:** `AiModal` allows pasting unstructured text to auto-fill Invoice or Lease forms.

### 2. 🧠 Next Steps
*   **Smart Replies:** Generate draft text responses for the Owner based on context (e.g., "Yes, the deposit is 5000 THB").
*   **Voice Mode:** Integrate Gemini Live API for voice-based rental management.

---

## 📜 Completed Phases (History)

### ✅ Phase 1-5: Foundation
*   Refactoring, PDF Engine, Mobile Wizard, API Integration, Auth.

### ✅ Phase 6: Digital Signatures
*   **Capture:** `SignaturePad` component integrated.
*   **Storage:** Base64 signatures stored in `LeaseData`.

### ✅ Phase 7: Chat, PWA & Scheduler
*   **PWA:** `manifest.json` and `sw.js` for "Add to Home Screen".
*   **Chat:** Real-time SSE, Ntfy integration, Media sharing, Read receipts.
*   **Lifecycle:** Full workflow support: `Confirm` -> `Collect` (Handover) -> `Complete` (Return).
*   **Schedule:** "Freeze Pane" timeline view with sticky headers and vehicle columns.
*   **Polish:** Dark Mode (`useTheme`), i18n (`useLanguage` with EN/RU/TH/VI/ID).

---

## 🔮 Future Roadmap

### 📊 Phase 9: Dashboard & Analytics
*   **Stats:** "Total Revenue", "Utilization Rate".
*   **Exports:** Bulk PDF export.

### 🧪 Technical Debt
*   **Tests:** Unit tests for pricing logic.
*   **Optimization:** Image compression before upload.

---

## 💡 Backlog & Experiments

### 1. 🧠 AI "God Mode"
*   **Idea:** A single text area entry point. The AI analyzes the text and auto-routes to `InvoiceForm` or `LeaseForm` with pre-filled data.

### 2. 📤 One-Click Share
*   **Idea:** Use Web Share API to send PDF directly to WhatsApp/Telegram.

---

## 📜 Coding Commandments
1.  **Bible:** `types.ts` is the law.
2.  **KISS:** Keep components small.
3.  **DRY:** Reuse styles and utilities.
4.  **UX:** Mobile users are first-class citizens.