import { createInspectorManager } from './utils/inspector';

const ACTIONS = {
  PANEL_STATE_CHANGED: 'ANTIGRAVITY_PANEL_STATE_CHANGED',
  PANEL_WIDTH_CHANGED: 'ANTIGRAVITY_PANEL_WIDTH_CHANGED',
  INSPECT_MODE_CHANGED: 'ANTIGRAVITY_INSPECT_MODE_CHANGED',
  SELECTION_CHANGED: 'ANTIGRAVITY_SELECTION_CHANGED',
  SPACING_CHANGED: 'ANTIGRAVITY_SPACING_CHANGED',
  STYLE_CHANGED: 'ANTIGRAVITY_STYLE_CHANGED',
  TAG_CHANGED: 'ANTIGRAVITY_TAG_CHANGED',
  DUPLICATE_ELEMENT: 'ANTIGRAVITY_DUPLICATE_ELEMENT',
  DELETE_ELEMENT: 'ANTIGRAVITY_DELETE_ELEMENT',
  RESET_SPACING: 'ANTIGRAVITY_RESET_SPACING',
  PING: 'ANTIGRAVITY_PING',
};

const DEFAULT_PANEL_WIDTH = 360;

const state = {
  panelActive: false,
  inspectMode: false,
  inspector: null,
};

// Initialize from storage (important for iframes to sync when panel is open)
chrome.storage.local.get(['panelActive', 'inspectMode', 'panelWidth'], (data) => {
  applyPanelState({
    active: Boolean(data.panelActive),
    inspectMode: Boolean(data.inspectMode),
    width: data.panelWidth,
  });
});

// Sync when storage changes (global switch)
chrome.storage.onChanged.addListener((changes) => {
  const active = changes.panelActive ? changes.panelActive.newValue : state.panelActive;
  const inspectMode = changes.inspectMode ? changes.inspectMode.newValue : state.inspectMode;
  const width = changes.panelWidth ? changes.panelWidth.newValue : undefined;
  
  applyPanelState({
    active: Boolean(active),
    inspectMode: Boolean(inspectMode),
    width,
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message?.action) {
    return;
  }

  switch (message.action) {
    case ACTIONS.PANEL_STATE_CHANGED:
      applyPanelState({
        active: Boolean(message.active),
        inspectMode: typeof message.inspectMode === 'boolean' ? message.inspectMode : state.inspectMode,
        width: message.width,
      });
      sendResponse?.({ ok: true });
      break;
    case ACTIONS.PANEL_WIDTH_CHANGED:
      applyPanelShift(message.width);
      sendResponse?.({ ok: true });
      break;
    case ACTIONS.INSPECT_MODE_CHANGED:
      setInspectMode(Boolean(message.enabled));
      sendResponse?.({ ok: true });
      break;
    case ACTIONS.SPACING_CHANGED:
      ensureInspector().updateSpacing(message.property, message.side, message.value);
      sendResponse?.({ ok: true });
      break;
    case ACTIONS.STYLE_CHANGED:
      ensureInspector().updateStyle(message.property, message.value);
      sendResponse?.({ ok: true });
      break;
    case ACTIONS.TAG_CHANGED:
      ensureInspector().updateTag(message.tagName);
      sendResponse?.({ ok: true });
      break;
    case ACTIONS.DUPLICATE_ELEMENT:
      ensureInspector().duplicateElement();
      sendResponse?.({ ok: true });
      break;
    case ACTIONS.DELETE_ELEMENT:
      ensureInspector().deleteElement();
      sendResponse?.({ ok: true });
      break;
    case ACTIONS.RESET_SPACING:
      ensureInspector().resetSpacing();
      sendResponse?.({ ok: true });
      break;
    case ACTIONS.PING:
      sendResponse?.({ ok: true });
      break;
    default:
      break;
  }
});

function ensureInspector() {
  if (state.inspector) {
    return state.inspector;
  }

  state.inspector = createInspectorManager({
    onSelectionChange: publishSelection,
  });

  return state.inspector;
}

function applyPanelState({ active, inspectMode, width = DEFAULT_PANEL_WIDTH }) {
  state.panelActive = Boolean(active);
  state.inspectMode = Boolean(inspectMode);

  applyPanelShift(width);

  const inspector = ensureInspector();
  inspector.setActive(state.panelActive && state.inspectMode);

  if (!state.panelActive || !state.inspectMode) {
    inspector.reset();
    clearHostSelectionStyles();
    return;
  }

  clearHostSelectionStyles();
}

function applyPanelShift(width = DEFAULT_PANEL_WIDTH) {
  void width;
  // Desktop-only mode: keep the page viewport untouched.
}

function ensureInlineStyleSnapshot() {
  return;
}

function restoreInlineStyles() {
  return;
}

function clearHostSelectionStyles() {
  document.body?.style.removeProperty('outline');
}

function publishSelection(selection) {
  chrome.runtime.sendMessage({
    action: ACTIONS.SELECTION_CHANGED,
    selection,
    active: state.panelActive,
    inspecting: state.panelActive && state.inspectMode,
  });
}

function setInspectMode(enabled) {
  applyPanelState({
    active: state.panelActive,
    inspectMode: Boolean(enabled),
  });
}
