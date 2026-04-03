import { createStudio, updateViewportStatus } from './components/studio/Studio';
import { applySpacingToStyle, normalizeSpacingValue, readSpacingFromComputedStyle } from './utils/spacing';

const state = {
  studio: null,
  shadowRoot: null,
  selectedElement: null,
  inspectMode: true,
  hoveredElement: null,
  previousHoverOutline: '',
  previousSelectionOutline: '',
};

const SIDES = ['top', 'right', 'bottom', 'left'];

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'INIT_STUDIO') {
    initVisualEditor();
  }
});

function initVisualEditor() {
  if (state.studio) {
    return;
  }

  const container = document.createElement('div');
  container.id = 'antigravity-editor-root';
  document.body.appendChild(container);

  state.shadowRoot = container.attachShadow({ mode: 'open' });
  state.studio = createStudio(state.shadowRoot, {
    onInspectToggle: toggleInspectMode,
    onSpacingChange: handleSpacingChange,
    onResetSpacing: resetSpacing,
  });

  attachInspectorListeners();
  state.studio.setInspecting(true);
  updateSelection(null);
  handleResize();
}

function attachInspectorListeners() {
  document.addEventListener('pointermove', handlePointerMove, true);
  document.addEventListener('click', handleClick, true);
  window.addEventListener('resize', handleResize);
}

function handleResize() {
  if (state.studio && state.shadowRoot) {
    updateViewportStatus(state.shadowRoot, window.innerWidth);
  }
}

function toggleInspectMode() {
  state.inspectMode = !state.inspectMode;
  if (!state.inspectMode) {
    clearHoverOutline();
  }

  state.studio?.setInspecting(state.inspectMode);
}

function handlePointerMove(event) {
  if (!state.inspectMode) {
    return;
  }

  const target = getInspectableElement(event.target);
  if (!target || target === state.selectedElement) {
    return;
  }

  setHoverOutline(target);
}

function handleClick(event) {
  if (!state.inspectMode) {
    return;
  }

  const target = getInspectableElement(event.target);
  if (!target) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  selectElement(target);
}

function getInspectableElement(node) {
  if (!(node instanceof Element)) {
    return null;
  }

  if (node.closest('#antigravity-editor-root')) {
    return null;
  }

  return node;
}

function setHoverOutline(element) {
  if (state.hoveredElement === element) {
    return;
  }

  clearHoverOutline();
  state.hoveredElement = element;
  state.previousHoverOutline = element.style.outline;
  element.style.outline = '2px dashed oklch(0.65 0.24 260 / 85%)';
}

function clearHoverOutline() {
  if (!state.hoveredElement || state.hoveredElement === state.selectedElement) {
    state.hoveredElement = null;
    return;
  }

  state.hoveredElement.style.outline = state.previousHoverOutline;
  state.hoveredElement = null;
  state.previousHoverOutline = '';
}

function selectElement(element) {
  if (state.selectedElement && state.selectedElement !== element) {
    state.selectedElement.style.outline = state.previousSelectionOutline;
  }

  clearHoverOutline();
  state.selectedElement = element;
  state.previousSelectionOutline = element.style.outline;
  element.style.outline = '2px solid oklch(0.70 0.30 330 / 90%)';
  state.studio?.setSelection(buildSelectionSnapshot(element));
}

function updateSelection(selection) {
  state.studio?.setSelection(selection);
}

function buildSelectionSnapshot(element) {
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  const margin = readSpacingFromComputedStyle(computedStyle, 'margin');
  const padding = readSpacingFromComputedStyle(computedStyle, 'padding');
  const className = element.className && typeof element.className === 'string' ? `.${element.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.')}` : '';

  return {
    label: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${className}`,
    tagName: element.tagName.toLowerCase(),
    width: `${Math.round(rect.width)}px`,
    height: `${Math.round(rect.height)}px`,
    spacing: { margin, padding },
    spacingSummary: {
      margin: SIDES.map((side) => margin[side]).join(' '),
      padding: SIDES.map((side) => padding[side]).join(' '),
    },
  };
}

function handleSpacingChange(property, side, value) {
  if (!state.selectedElement) {
    return;
  }

  state.selectedElement.style[`${property}${side.charAt(0).toUpperCase()}${side.slice(1)}`] = normalizeSpacingValue(value) || '0px';
  state.studio?.setSelection(buildSelectionSnapshot(state.selectedElement));
}

function resetSpacing() {
  if (!state.selectedElement) {
    return;
  }

  applySpacingToStyle(state.selectedElement.style, 'margin', {
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  });

  applySpacingToStyle(state.selectedElement.style, 'padding', {
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  });

  state.studio?.setSelection(buildSelectionSnapshot(state.selectedElement));
}
