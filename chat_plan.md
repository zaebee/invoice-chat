
# 🧠 Chat Architecture & Roadmap

> **Status:** Phase 7 (Scheduler & Lifecycle) ✅ -> Phase 8 (AI Copilot) 🚧
> **Context:** Chat is the central operating system for Ownima Pro.

---

## 1. ✅ Implemented Architecture

**The "Trinity of Data"**
1.  **Static State:** `LeaseData` (Vehicle, Pricing).
2.  **System History:** Immutable events from API (History).
3.  **Ephemeral Talk:** Real-time messages (Ntfy/SSE).

---

## 2. ✅ Completed Milestones

### 📱 Mobile & UI
*   **Compact UI:** Humanized dates, optimized headers (`ChatContextHeader`).
*   **Wizard Mode:** Mobile-friendly complex forms.
*   **Dark Mode:** Full dark theme support.
*   **Gestures:** Swipe-to-archive in Sidebar.

### 💬 Interactive Chat
*   **Media Sharing:** Image upload support.
*   **Actions Menu:** Archive, Delete, Mark Read/Unread.
*   **System Events:** Interactive bubbles for **Confirm, Reject, Collect, Complete**.
*   **Read Receipts:** Visibility-based (IntersectionObserver) status updates.
*   **Virtualization:** `useVirtualList` for performant rendering of large lists.

### 📅 Visual Schedule
*   **Gantt View:** `SchedulePage` visualizes chat sessions as bookings on a timeline.
*   **Logic:** "Tetris" packing algorithm for vehicle lanes.

### 💾 Persistence & Offline
*   **IndexedDB:** Full offline history storage (`dbService`).
*   **Service Worker:** App shell caching.

---

## 3. 🚧 Current Focus: Phase 8 - AI Copilot

**Goal:** Transform the chat from a passive communication tool into an intelligent assistant using Google Gemini.

### Implementation Plan
1.  **Interaction Model:**
    *   User types `@AI` or clicks an "Ask AI" button.
    *   System injects a "Thinking..." bubble.
2.  **Context Injection:**
    *   Pass `LeaseData` JSON + recent 10 messages to `gemini-2.5-flash`.
    *   System Instruction: "You are a helpful rental assistant. Use the provided Lease Data to answer."
3.  **Actionable Outputs:**
    *   AI returns structured JSON for actions (e.g., `type: 'update_price', args: { total: 5000 }`).

---

## 4. 🛠️ Refactoring & Technical Improvements

### Immediate Tasks
*   **Drafts:** Persist unsent text input to `localStorage`.
*   **Retry Logic:** Better handling of failed message sends in offline mode.

### Long Term
*   **Voice Notes:** Audio recording and playback.
*   **Global Search:** Integrate server-side search for older history.

---

## 5. 🔮 Backlog

*   **Group Chat:** Multiple participants (Owner, Renter, Driver).
*   **Video Call:** WebRTC integration button (currently mock).
