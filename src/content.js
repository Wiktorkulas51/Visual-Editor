import { ACTIONS, DEFAULT_PANEL_WIDTH } from './utils/protocol';
import { buildPanelState } from './utils/panel-state';
import { createInspectorManager } from './utils/inspector';

const state = {
  panelActive: false,
  inspectMode: false,
  savedInlineStyles: null,
  inspector: null,
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message?.action) {
    return;
  }

  switch (message.action) {
    case ACTIONS.PANEL_STATE_CHANGED:
      setPanelActive(Boolean(message.active), message.width);
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

function setPanelActive(active, width = DEFAULT_PANEL_WIDTH) {
  state.panelActive = Boolean(active);
  applyPanelShift(width);

  const inspector = ensureInspector();
  inspector.setActive(state.panelActive && state.inspectMode);

  if (!state.panelActive) {
    inspector.reset();
    restoreInlineStyles();
    publishSelection(null);
  } else {
    clearHostSelectionStyles();
  }
}

function applyPanelShift(width = DEFAULT_PANEL_WIDTH) {
  const panelState = buildPanelState({ active: state.panelActive, width });
  ensureInlineStyleSnapshot();

  document.documentElement.dataset.antigravitySidepanel = panelState.active ? 'open' : 'closed';
  document.body.dataset.antigravitySidepanel = panelState.active ? 'open' : 'closed';
  document.documentElement.style.setProperty('margin-right', panelState.marginRight, 'important');
  document.body.style.setProperty('margin-right', panelState.marginRight, 'important');
  document.documentElement.style.setProperty('transition', 'margin-right 180ms ease');
  document.body.style.setProperty('transition', 'margin-right 180ms ease');
  document.documentElement.style.setProperty('--antigravity-sidepanel-width', panelState.width);
}

function ensureInlineStyleSnapshot() {
  if (state.savedInlineStyles) {
    return;
  }

  state.savedInlineStyles = {
    html: {
      marginRight: document.documentElement.style.marginRight,
      transition: document.documentElement.style.transition,
    },
    body: {
      marginRight: document.body.style.marginRight,
      transition: document.body.style.transition,
    },
  };
}

function restoreInlineStyles() {
  if (!state.savedInlineStyles) {
    return;
  }

  document.documentElement.style.marginRight = state.savedInlineStyles.html.marginRight;
  document.documentElement.style.transition = state.savedInlineStyles.html.transition;
  document.body.style.marginRight = state.savedInlineStyles.body.marginRight;
  document.body.style.transition = state.savedInlineStyles.body.transition;
  document.documentElement.style.removeProperty('--antigravity-sidepanel-width');
  delete document.documentElement.dataset.antigravitySidepanel;
  delete document.body.dataset.antigravitySidepanel;
  state.savedInlineStyles = null;
}

function clearHostSelectionStyles() {
  document.body.style.removeProperty('outline');
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
  state.inspectMode = Boolean(enabled);

  const inspector = ensureInspector();
  inspector.setActive(state.panelActive && state.inspectMode);

  if (!state.panelActive) {
    publishSelection(null);
  }
}
