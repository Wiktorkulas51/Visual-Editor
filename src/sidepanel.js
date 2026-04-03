import './style.css';
import { createStudio, updateViewportStatus } from './components/studio/Studio';
import { ACTIONS, DEFAULT_PANEL_WIDTH } from './utils/protocol';
import { ensureContentScript, sendTabMessage } from './utils/content-script.js';

const state = {
  studio: null,
  shadowRoot: null,
  activeTabId: null,
  inspectMode: false,
};

async function boot() {
  const host = document.querySelector('#app');
  if (!host) {
    return;
  }

  state.shadowRoot = host.attachShadow({ mode: 'open' });
  state.studio = createStudio(
    state.shadowRoot,
    {
      onInspectToggle: toggleInspectMode,
      onSpacingChange: handleSpacingChange,
      onResetSpacing: handleResetSpacing,
    },
    { mode: 'sidepanel' },
  );

  chrome.runtime.onMessage.addListener(handleRuntimeMessage);
  chrome.tabs.onActivated.addListener(() => syncActiveTab(false));
  window.addEventListener('resize', handleResize);
  window.addEventListener('pagehide', handlePanelClose);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  state.studio.setInspecting(false);
  state.studio.setSelection(null);
  updateViewportStatus(state.shadowRoot, window.innerWidth);

  await syncActiveTab();
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
  sendTabMessage(state.activeTabId, {
    action,
    ...payload,
  });
}

async function toggleInspectMode() {
  state.inspectMode = !state.inspectMode;
  state.studio?.setInspecting(state.inspectMode);
  await sendPanelState(true, state.inspectMode);
}

async function handleSpacingChange(property, side, value) {
  await sendSpacingUpdate(ACTIONS.SPACING_CHANGED, { property, side, value });
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
  state.studio?.setInspecting(state.inspectMode);

  if (!state.activeTabId) {
    return;
  }

  await ensureContentScript(state.activeTabId);
  await sendPanelState(true, state.inspectMode);
}

function handleRuntimeMessage(message, sender) {
  if (message?.action !== ACTIONS.SELECTION_CHANGED) {
    return;
  }

  if (sender.tab?.id) {
    state.activeTabId = sender.tab.id;
  }

  state.studio?.setSelection(message.selection);
  state.studio?.setInspecting(Boolean(message.inspecting));
}

function handleResize() {
  updateViewportStatus(state.shadowRoot, window.innerWidth);
  sendPanelState();
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
