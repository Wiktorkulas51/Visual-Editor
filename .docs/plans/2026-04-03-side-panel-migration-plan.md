# Side Panel Migration Implementation Plan

> **For Antigravity:** Use `executing-plans` logic to implement this plan task-by-task.

**Goal:** Replace the floating popup-driven editor with a Chrome Side Panel workflow that opens from the extension icon, shifts page content, and keeps inspector interactions working.
**Architecture:** Move the UI entry point into a dedicated side panel page, keep the content script responsible for host-page highlighting and spacing edits, and add messaging plus layout-shift helpers to synchronize panel state. Preserve the current Shadow DOM and Atomic Design approach inside the side panel.
**Tech Stack:** Vite, Vanilla JS, Chrome Extensions MV3, Tailwind CSS.

### Task 1: Manifest and service worker
**Files:**
- Modify: `public/manifest.json`
- Create: `src/background.js`

**Steps:**
1. Add side panel permission and background service worker wiring.
2. Configure `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`.
3. Verify manifest shape with a build.

### Task 2: Side panel entry point
**Files:**
- Create: `sidepanel.html`
- Create: `src/sidepanel.js`
- Modify: `vite.config.js`

**Steps:**
1. Add a failing build expectation for the new HTML entry.
2. Create the side panel bootstrap that mounts the existing studio UI.
3. Verify the side panel entry is emitted by Vite.

### Task 3: Content push and messaging
**Files:**
- Modify: `src/content.js`
- Create: `src/utils/panel-state.js`

**Steps:**
1. Add failing tests for panel width normalization and body shift behavior.
2. Implement the helper that applies/removes the page shift.
3. Wire runtime messages between side panel and content script.

### Task 4: UI cleanup and validation
**Files:**
- Modify: `src/components/studio/Studio.js`
- Modify: `src/main.js` or remove unused popup entry if no longer needed

**Steps:**
1. Remove redundant floating-panel assumptions.
2. Ensure selection state and spacing editing still work from the side panel.
3. Run `npm test` and `npm run build`.
