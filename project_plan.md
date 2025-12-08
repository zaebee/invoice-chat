
# 🚀 Ownima Pro: Architecture & Roadmap

## 🧐 Current Status Review
**Phases 1-7 Complete. Phase 8 (Intelligence) In Progress.**
The application is now a feature-complete **PWA Rental Workspace** with a Gantt-chart schedule view, full internationalization, and dark mode.

**Core Strengths:**
*   **Dual Engine:** Seamlessly handles structured Invoices and complex Lease Agreements.
*   **Hybrid Rendering:** Client-Side PDF generation (`@react-pdf`) + Server-Side HTML previews.
*   **Secure:** Integrated Token-based Authentication & Iframe Handshake.
*   **Offline-Ready:** Service Worker caching, IndexedDB persistence, & Background Sync logic.
*   **Collaborative:** Real-time Chat with media, system events, and lease lifecycle actions.
*   **Visual Schedule:** Tetris-packed Gantt chart for vehicle availability (`SchedulePage`).

---

## 🚧 Current Focus: Phase 8 - AI Intelligence

We are now enhancing the "Smart" aspects using Google Gemini.

### 1. 🤖 AI Chat Copilot
*   **Goal:** Allow users to invoke AI within the chat stream.
*   **Interaction:** User types `@AI` -> System generates context-aware replies.
*   **Context:** AI has access to `LeaseData` (Price, Dates, Vehicle) to answer questions like "Is the deposit paid?".

### 2. 🧠 Smart Actions
*   **Intent Detection:** AI analyzes chat messages to suggest status changes (e.g., "Customer said they are here" -> Suggest "Collect Vehicle").

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
*   **Lifecycle:** Confirm/Reject/Collect/Complete actions within chat bubbles.
*   **Schedule:** Virtualized Gantt chart view for fleet management.
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
