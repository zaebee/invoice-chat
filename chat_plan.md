
# 🧠 Chat Architecture & Roadmap

> **Status:** Phase 5 (Actions & Management) ✅ -> Phase 6 (Intelligence) 🚧
> **Context:** `InvoiceGen Pro` is a PWA collaborative workspace. Chat is now the central hub for operations.

---

## 1. ✅ Implemented Architecture

**The "Trinity of Data"**
1.  **Static State:** `LeaseData` (Vehicle, Pricing).
2.  **System History:** Immutable events from API.
3.  **Ephemeral Talk:** Real-time messages (Ntfy/SSE).

---

## 2. ✅ Completed Milestones

### 📱 Mobile & UI
*   **Compact UI:** Humanized dates, optimized headers.
*   **Wizard Mode:** Mobile-friendly complex forms.
*   **Gestures:** Swipe-to-archive in Sidebar.

### 💬 Interactive Chat
*   **Media Sharing:** Image upload support with preview (`ChatWindow` & `ChatStore`).
*   **Actions Menu:** Context menu in sidebar for Archive, Delete, Mark as Read/Unread.
*   **System Events:** Interactive bubbles for Lease Confirmation/Rejection.
*   **Read Receipts:** Visibility-based (IntersectionObserver) status updates.
*   **Virtualization:** `useVirtualList` for performant rendering of large lists.

### 💾 Persistence & Offline
*   **IndexedDB:** Full offline history storage (`dbService`).
*   **Service Worker:** App shell caching and background sync prep.

---

## 3. 🚧 Current Focus: Phase 6 - AI Participant (The "Copilot")

**Goal:** Transform the chat from a passive communication tool into an active assistant.

### Implementation Plan
1.  **Interaction Model:**
    *   User types `@AI` or clicks an "Ask AI" button.
    *   System injects a "Thinking..." bubble.
2.  **Context Injection:**
    *   AI receives the current `LeaseData` JSON + recent message history.
    *   Prompt engineering: "You are a rental assistant. Use the provided Lease Data to answer."
3.  **Actionable Outputs:**
    *   If AI detects a request for an invoice, it returns a structured "Action Suggestion" (e.g., `type: 'suggestion', action: 'create_invoice'`).

---

## 4. 🛠️ Refactoring & Technical Improvements

### Immediate Tasks
*   **Error Boundaries:** Add specific error states for Image Upload failures.
*   **Optimistic Rollback:** Handle cases where `sendNtfyMessage` fails (remove the optimistic bubble).
*   **Drafts:** Persist unsent text input to `localStorage` per session ID to prevent data loss on navigation.

### Long Term
*   **Voice Notes:** Audio recording and playback using Web Audio API.
*   **Global Search:** Integrate server-side search for older history not in IDB.

---

## 5. 🔮 Backlog

*   **Group Chat:** Multiple participants (Owner, Renter, Driver).
*   **Video Call:** WebRTC integration button (currently mock).
