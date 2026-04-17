import { createInspectorManager } from './utils/inspector';

const ACTIONS = {
  PANEL_STATE_CHANGED: 'ANTIGRAVITY_PANEL_STATE_CHANGED',
  PANEL_WIDTH_CHANGED: 'ANTIGRAVITY_PANEL_WIDTH_CHANGED',
  INSPECT_MODE_CHANGED: 'ANTIGRAVITY_INSPECT_MODE_CHANGED',
  SELECTION_CHANGED: 'ANTIGRAVITY_SELECTION_CHANGED',
  SPACING_CHANGED: 'ANTIGRAVITY_SPACING_CHANGED',
  STYLE_CHANGED: 'ANTIGRAVITY_STYLE_CHANGED',
  TAG_CHANGED: 'ANTIGRAVITY_TAG_CHANGED',
  ELEMENT_ACTION: 'ANTIGRAVITY_ELEMENT_ACTION',
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
    case ACTIONS.ELEMENT_ACTION:
      ensureInspector().handleElementAction(message.actionType);
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
    onAltCopy: async (snapshot) => {
      if (!snapshot) return;

      const selectionLabel = panelSelectionLabel(snapshot);
      const payload = {
        tagName: snapshot.tagName,
        className: snapshot.attributes?.className,
        textContent: snapshot.textContent ?? selectionLabel,
        path: snapshot.path,
        dimensions: {
          width: snapshot.width,
          height: snapshot.height,
        },
        keyStyles: snapshot.keyStyles,
        attributes: snapshot.attributes,
        childrenSummary: snapshot.childrenSummary,
        key: `${snapshot.tagName}-${snapshot.label}`,
        label: snapshot.label,
        copiedAt: Date.now(),
      };

      await copyPayloadToClipboard(payload);
      showAltCopyToast('Copied');
    },
  });

  return state.inspector;
}

function panelSelectionLabel(snapshot) {
  return snapshot?.textContent || snapshot?.label || '';
}

async function copyPayloadToClipboard(payload) {
  const text = JSON.stringify(payload);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback
  }

  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    return true;
  } finally {
    document.body.removeChild(ta);
  }
}

function showAltCopyToast(message) {
  try {
    const existing = document.getElementById('antigravity-alt-toast');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = 'antigravity-alt-toast';
    el.textContent = message;
    el.style.cssText = [
      'position:fixed',
      'right:16px',
      'bottom:16px',
      'z-index:2147483647',
      'padding:10px 12px',
      'border-radius:12px',
      'border:1px solid rgba(255,255,255,0.15)',
      'background:rgba(0,0,0,0.65)',
      'color:#fff',
      'font:700 12px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial',
      'backdrop-filter: blur(10px)',
      'box-shadow: 0 10px 30px rgba(0,0,0,0.35)',
      'opacity:0',
      'transform: translateY(4px)',
      'transition: opacity 120ms ease, transform 120ms ease',
    ].join(';');

    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      el.remove();
    }, 900);
  } catch {
    // ignore
  }
}

let altHeld = false;

function setAltInspectMode(enabled) {
  altHeld = Boolean(enabled);
  const inspector = ensureInspector();
  inspector.setAltCopyEnabled(Boolean(enabled));
  inspector.setActive(Boolean(enabled));

  if (!enabled) {
    inspector.setAltCopyEnabled(false);
    inspector.setActive(false);
  }
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

// ALT+click quick copy mode (no sidepanel UI)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Alt' && !e.repeat) {
    setAltInspectMode(true);
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'Alt') {
    setAltInspectMode(false);
  }
});
