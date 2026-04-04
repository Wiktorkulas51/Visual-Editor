import './style.css';
import { createStudio, updateViewportStatus } from './components/studio/Studio';
import { ACTIONS, DEFAULT_PANEL_WIDTH } from './utils/protocol';
import { ensureContentScript, sendTabMessage } from './utils/content-script.js';

const state = {
  studio: null,
  shadowRoot: null,
  activeTabId: null,
  activeFrameId: null,
  previousFrameId: null,
  inspectMode: true,
  selection: null,
};

let lastSelectionId = null;

function updateUI(force = false) {
  const container = document.getElementById('app');
  if (!container || !state.selection) return;

  // Only re-render if selection changed or forced
  const currentId = `${state.selection.tagName}-${state.selection.label}`;
  if (!force && currentId === lastSelectionId) {
    return;
  }
  lastSelectionId = currentId;

  const studio = createStudio({
    selection: state.selection,
    handlers: {
      onInspectToggle: () => {
        state.inspectMode = !state.inspectMode;
        chrome.tabs.sendMessage(state.activeTabId, { action: ACTIONS.INSPECT_MODE_CHANGED, enabled: state.inspectMode });
      },
      onSpacingChange: handleSpacingChange,
      onStyleChange: (prop, val) => {
        // Update local state to keep it snappy
        if (state.selection?.styles) state.selection.styles[prop] = val;
        handleStyleChange(prop, val);
      },
      onTagChange: handleTagChange,
      onResetSpacing: handleResetSpacing,
    },
    config: { mode: 'sidepanel' },
  });

  container.innerHTML = '';
  container.appendChild(studio);
}

async function boot() {
  try {
    const host = document.querySelector('#app');
    if (!host) {
      return;
    }

    state.shadowRoot = host.attachShadow({ mode: 'open' });
    state.studio = createStudio(
      state.shadowRoot,
      {
        onInspectToggle: () => {},
        onSpacingChange: handleSpacingChange,
        onStyleChange: handleStyleChange,
        onTagChange: handleTagChange,
        onElementAction: handleElementAction,
        onResetSpacing: handleResetSpacing,
      },
      { mode: 'sidepanel' },
    );

    chrome.runtime.onMessage.addListener(handleRuntimeMessage);
    chrome.tabs.onActivated.addListener(() => syncActiveTab().catch(console.error));
    window.addEventListener('resize', handleResize);
    window.addEventListener('pagehide', handlePanelClose);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    state.studio.setInspecting(true);
    state.studio.setSelection(null);
    updateViewportStatus(state.shadowRoot, window.innerWidth);

    // Do not 'await' syncActiveTab here to prevent blocking the UI thread if content-script pings fail
    syncActiveTab().catch(console.error);
  } catch (e) {
    console.error('[SidePanel] Boot failed:', e);
  }
}

async function syncActiveTab() {
  const previousTabId = state.activeTabId;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  state.activeTabId = tab?.id ?? null;

  if (previousTabId && previousTabId !== state.activeTabId) {
    sendTabMessage(previousTabId, {
      action: ACTIONS.PANEL_STATE_CHANGED,
      active: false,
      width: DEFAULT_PANEL_WIDTH,
    });
  }

  if (!state.activeTabId) {
    return;
  }

  await ensureContentScript(state.activeTabId);
  state.studio?.setSelection(null);
  await sendPanelState(true, state.inspectMode);
}

async function sendPanelState(active, inspectMode = state.inspectMode) {
  if (!state.activeTabId) {
    return;
  }

  // Persistence for all frames to pick up
  await chrome.storage.local.set({
    panelActive: active,
    inspectMode,
    panelWidth: window.innerWidth,
    activeTabId: state.activeTabId
  });

  await ensureContentScript(state.activeTabId);
  await sendTabMessage(state.activeTabId, {
    action: ACTIONS.PANEL_STATE_CHANGED,
    active,
    inspectMode,
    width: window.innerWidth,
  });
}

async function sendInspectMode(enabled) {
  if (!state.activeTabId) {
    return;
  }

  await sendPanelState(true, enabled);
}

async function sendSpacingUpdate(action, payload = {}) {
  if (!state.activeTabId) {
    return;
  }
  await ensureContentScript(state.activeTabId);
  const ok = await sendTabMessage(state.activeTabId, { action, ...payload }, { frameId: state.activeFrameId });
  if (!ok) {
    console.error('[SidePanel] Message failed to reach content script.');
  }
}

async function handleSpacingChange(property, side, value) {
  await sendSpacingUpdate(ACTIONS.SPACING_CHANGED, { property, side, value });
}

async function handleStyleChange(property, value) {
  if (!state.activeTabId) return;
  await sendTabMessage(state.activeTabId, { action: ACTIONS.STYLE_CHANGED, property, value }, { frameId: state.activeFrameId }).catch(() => {});
}

async function handleTagChange(tagName) {
  if (!state.activeTabId) return;
  await sendTabMessage(state.activeTabId, { action: ACTIONS.TAG_CHANGED, tagName }, { frameId: state.activeFrameId }).catch(() => {});
}

async function handleResetSpacing() {
  await sendSpacingUpdate(ACTIONS.RESET_SPACING);
}

function handleVisibilityChange() {
  if (document.hidden) {
    handlePanelClose();
    return;
  }

  handlePanelVisible();
}

async function handlePanelVisible() {
  state.studio?.setInspecting(true);

  if (!state.activeTabId) {
    return;
  }

  await ensureContentScript(state.activeTabId);
  await sendPanelState(true, true);
}

function handleRuntimeMessage(message, sender) {
  if (message?.action !== ACTIONS.SELECTION_CHANGED) {
    return;
  }

  if (sender.tab?.id) {
    state.activeTabId = sender.tab.id;
  }

  if (typeof sender.frameId === 'number') {
    if (typeof state.activeFrameId === 'number' && state.activeFrameId !== sender.frameId) {
      sendTabMessage(state.activeTabId, {
        action: ACTIONS.PANEL_STATE_CHANGED,
        active: false,
      }, { frameId: state.activeFrameId }).catch(() => {});
    }
    
    state.previousFrameId = state.activeFrameId;
    state.activeFrameId = sender.frameId;
  }

  state.studio?.setSelection(message.selection);
  state.studio?.setInspecting(true);
}

function handleResize() {
  updateViewportStatus(state.shadowRoot, window.innerWidth);
  sendPanelState(true);
}

function handlePanelClose() {
  state.inspectMode = false;
  state.studio?.setInspecting(false);

  if (!state.activeTabId) {
    return;
  }

  sendPanelState(false, false);
}

boot();
