import { readSpacingFromComputedStyle } from './spacing.js';

const INSPECTOR_ROOT_ID = 'antigravity-inspector-root';
const SIDES = ['top', 'right', 'bottom', 'left'];

function ensurePx(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}px`;
  }

  if (typeof value !== 'string') {
    return '0px';
  }

  return /^\d*\.?\d+$/.test(value) ? `${value}px` : value;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function setBoxVisible(box, visible) {
  box.style.opacity = visible ? '1' : '0';
}

export function applyInspectorBoxStyles(box, color) {
  box.style.position = 'fixed';
  box.style.pointerEvents = 'none';
  box.style.boxSizing = 'border-box';
  box.style.borderStyle = 'solid';
  box.style.borderWidth = '1px';
  box.style.borderRadius = '0.75rem';
  box.style.backgroundColor = 'transparent';
  box.style.transform = 'translateZ(0)';
  box.style.willChange = 'left, top, width, height, opacity';
  box.style.borderColor = color;
  box.style.boxShadow = `0 0 0 1px ${color}`;
  box.style.opacity = '0';
  box.style.transition = 'opacity 120ms ease, transform 120ms ease';
}

function updateBox(box, rect, color, label) {
  box.style.left = ensurePx(rect.left);
  box.style.top = ensurePx(rect.top);
  box.style.width = ensurePx(rect.width);
  box.style.height = ensurePx(rect.height);
  box.style.borderColor = color;
  box.querySelector('[data-inspector-label]').textContent = label;
  setBoxVisible(box, true);
}

function createBox(doc, color) {
  const box = doc.createElement('div');
  applyInspectorBoxStyles(box, color);

  const label = doc.createElement('div');
  label.dataset.inspectorLabel = 'true';
  label.style.position = 'absolute';
  label.style.left = '0';
  label.style.top = '-1.5rem';
  label.style.borderRadius = '9999px';
  label.style.padding = '0.25rem 0.5rem';
  label.style.fontSize = '0.625rem';
  label.style.fontWeight = '700';
  label.style.letterSpacing = '0.2em';
  label.style.textTransform = 'uppercase';
  label.style.color = '#fff';
  label.style.background = color;
  label.textContent = '';
  box.appendChild(label);

  return box;
}

function createOverlayLayer() {
  const host = document.createElement('div');
  host.id = INSPECTOR_ROOT_ID;
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';

  const shadowRoot = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    :host,
    :host * {
      pointer-events: none !important;
    }
  `;
  const hoverBox = createBox(document, 'oklch(0.65 0.24 260 / 85%)');
  const selectionBox = createBox(document, 'oklch(0.70 0.30 330 / 90%)');

  shadowRoot.append(style, hoverBox, selectionBox);
  const detachHost = attachHostWhenBodyReady(document, host);

  return {
    host,
    hoverBox,
    selectionBox,
    destroy() {
      detachHost();
      host.remove();
    },
    showHover(rect, label) {
      updateBox(hoverBox, rect, 'oklch(0.65 0.24 260 / 85%)', label);
    },
    showSelection(rect, label) {
      updateBox(selectionBox, rect, 'oklch(0.70 0.30 330 / 90%)', label);
    },
    hideHover() {
      setBoxVisible(hoverBox, false);
    },
    hideSelection() {
      setBoxVisible(selectionBox, false);
    },
  };
}

export function attachHostWhenBodyReady(doc, host) {
  if (doc.body) {
    doc.body.appendChild(host);
    return () => {};
  }

  const attachWhenReady = () => {
    if (!doc.body) {
      return;
    }

    doc.body.appendChild(host);
    doc.removeEventListener('DOMContentLoaded', attachWhenReady);
  };

  doc.addEventListener('DOMContentLoaded', attachWhenReady, { once: true });

  return () => {
    doc.removeEventListener('DOMContentLoaded', attachWhenReady);
  };
}

export function buildElementLabel(element) {
  if (!element?.tagName) {
    return '';
  }

  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classNames = typeof element.className === 'string'
    ? element.className.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    : [];
  const classSuffix = classNames.length ? `.${classNames.join('.')}` : '';

  return `${tag}${id}${classSuffix}`;
}

export function buildOverlayBoxStyles(rect) {
  return {
    left: ensurePx(rect.left ?? rect.x ?? 0),
    top: ensurePx(rect.top ?? rect.y ?? 0),
    width: ensurePx(rect.width ?? 0),
    height: ensurePx(rect.height ?? 0),
  };
}

export function buildSelectionSnapshot({ tagName, id = '', className = '', rect }) {
  const elementLike = { tagName, id, className };
  return {
    label: buildElementLabel(elementLike),
    tagName: tagName.toLowerCase(),
    width: `${Math.round(rect?.width ?? 0)}px`,
    height: `${Math.round(rect?.height ?? 0)}px`,
  };
}

function getElementRect(element) {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function isIgnoredTarget(target) {
  return !(target instanceof Element) || target.closest(`#${INSPECTOR_ROOT_ID}`);
}

function applyStyleSnapshot(element) {
  const computedStyle = window.getComputedStyle(element);
  const margin = readSpacingFromComputedStyle(computedStyle, 'margin');
  const padding = readSpacingFromComputedStyle(computedStyle, 'padding');

  return {
    margin,
    padding,
    marginSummary: SIDES.map((side) => margin[side]).join(' '),
    paddingSummary: SIDES.map((side) => padding[side]).join(' '),
    styles: {
      display: computedStyle.display,
      flexDirection: computedStyle.flexDirection,
      justifyContent: computedStyle.justifyContent,
      alignItems: computedStyle.alignItems,
      gap: computedStyle.gap,
      flexWrap: computedStyle.flexWrap,
      position: computedStyle.position,
      zIndex: computedStyle.zIndex,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      textAlign: computedStyle.textAlign,
      letterSpacing: computedStyle.letterSpacing,
      borderRadius: computedStyle.borderRadius,
    }
  };
}

export function createInspectorManager({ onSelectionChange, onStateChange } = {}) {
  const layer = createOverlayLayer();
  const state = {
    active: false,
    locked: false,
    hoveredElement: null,
    selectedElement: null,
  };

  function syncSelection() {
    if (!state.selectedElement) {
      onSelectionChange?.(null);
      return;
    }

    const rect = getElementRect(state.selectedElement);
    onSelectionChange?.({
      ...buildSelectionSnapshot({
        tagName: state.selectedElement.tagName,
        id: state.selectedElement.id,
        className: state.selectedElement.className,
        rect,
      }),
      ...applyStyleSnapshot(state.selectedElement),
    });
  }

  function clearSelection() {
    state.locked = false;
    state.selectedElement = null;
    layer.hideSelection();
    onSelectionChange?.(null);
    onStateChange?.({ active: state.active, locked: state.locked });
  }

  function handleMouseMove(event) {
    if (!state.active) {
      return;
    }

    const target = event.target instanceof Element ? event.target : null;
    if (!target || isIgnoredTarget(target)) {
      return;
    }

    state.hoveredElement = target;
    const rect = getElementRect(target);
    layer.showHover(rect, buildElementLabel(target));

    if (!state.locked) {
      layer.hideSelection();
    }
  }

  function handleClick(event) {
    if (!state.active) {
      return;
    }

    const target = event.target instanceof Element ? event.target : null;
    if (!target || isIgnoredTarget(target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    state.locked = true;
    state.selectedElement = target;

    const rect = getElementRect(target);
    layer.showSelection(rect, buildElementLabel(target));
    syncSelection();
    onStateChange?.({ active: state.active, locked: state.locked });
  }

  function handleKeyDown(event) {
    if (event.key !== 'Escape' || !state.locked) {
      return;
    }

    clearSelection();
  }

  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('click', handleClick, true);
  window.addEventListener('keydown', handleKeyDown, true);

  return {
    setActive(active) {
      state.active = Boolean(active);
      if (!state.active) {
        state.hoveredElement = null;
        layer.hideHover();
      }
      onStateChange?.({ active: state.active, locked: state.locked });
    },
    clearSelection,
    updateStyle(property, value) {
      if (!state.selectedElement) {
        console.warn('[Inspector] Cannot update style: no element selected.');
        return;
      }

      state.selectedElement.style[property] = value;
      syncSelection(); // Refresh UI
    },
    updateSpacing(property, side, value) {
      if (!state.selectedElement) {
        return;
      }

      state.selectedElement.style[`${property}${capitalize(side)}`] = value;
      syncSelection();
    },
    resetSpacing() {
      if (!state.selectedElement) {
        return;
      }

      for (const property of ['margin', 'padding']) {
        for (const side of SIDES) {
          state.selectedElement.style[`${property}${capitalize(side)}`] = '0px';
        }
      }
      syncSelection();
    },
    reset() {
      clearSelection();
      layer.hideHover();
      layer.hideSelection();
      state.hoveredElement = null;
      state.selectedElement = null;
      state.locked = false;
    },
    destroy() {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      layer.destroy();
    },
  };
}
