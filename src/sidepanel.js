import './style.css';
import { createStudio, updateViewportStatus } from './components/studio/Studio';
import { ACTIONS, DEFAULT_PANEL_WIDTH } from './utils/protocol';

const state = {
  studio: null,
  shadowRoot: null,
  activeTabId: null,
  inspectMode: true,
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

  state.studio.setInspecting(true);
  state.studio.setSelection(null);
  updateViewportStatus(state.shadowRoot, window.innerWidth);

  await syncActiveTab();
}

async function syncActiveTab() {
  const previousTabId = state.activeTabId;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  state.activeTabId = tab?.id ?? null;

  if (previousTabId && previousTabId !== state.activeTabId) {
    chrome.tabs.sendMessage(previousTabId, {
      action: ACTIONS.PANEL_STATE_CHANGED,
      active: false,
      width: DEFAULT_PANEL_WIDTH,
    });
  }

  if (!state.activeTabId) {
    return;
  }

  state.studio?.setSelection(null);
  sendPanelState();
  sendInspectMode(state.inspectMode);
}

function sendPanelState() {
  if (!state.activeTabId) {
    return;
  }

  chrome.tabs.sendMessage(state.activeTabId, {
    action: ACTIONS.PANEL_STATE_CHANGED,
    active: true,
    width: window.innerWidth,
  });
}

function sendInspectMode(enabled) {
  if (!state.activeTabId) {
    return;
  }

  chrome.tabs.sendMessage(state.activeTabId, {
    action: ACTIONS.INSPECT_MODE_CHANGED,
    enabled,
  });
}

function sendSpacingUpdate(action, payload = {}) {
  if (!state.activeTabId) {
    return;
  }

  chrome.tabs.sendMessage(state.activeTabId, {
    action,
    ...payload,
  });
}

function toggleInspectMode() {
  state.inspectMode = !state.inspectMode;
  state.studio?.setInspecting(state.inspectMode);
  sendInspectMode(state.inspectMode);
}

function handleSpacingChange(property, side, value) {
  sendSpacingUpdate(ACTIONS.SPACING_CHANGED, { property, side, value });
}

function handleResetSpacing() {
  sendSpacingUpdate(ACTIONS.RESET_SPACING);
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
  if (!state.activeTabId) {
    return;
  }

  chrome.tabs.sendMessage(state.activeTabId, {
    action: ACTIONS.PANEL_STATE_CHANGED,
    active: false,
    width: DEFAULT_PANEL_WIDTH,
  });
}

boot();
