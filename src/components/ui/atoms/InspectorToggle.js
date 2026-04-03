import { createButton } from './Atoms.js';

export function getInspectorToggleLabel(active) {
  return active ? 'Stop picking' : 'Pick element';
}

export function getInspectorTogglePath(active) {
  return active
    ? 'M6 6h4v4H6zM14 6h4v4h-4zM6 14h4v4H6zM14 14h4v4h-4z'
    : 'M12 3v4M12 17v4M3 12h4M17 12h4M8.25 8.25l7.5 7.5M15.75 8.25l-7.5 7.5';
}

function getInspectorToggleClasses(active) {
  return active
    ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-button border border-brand/20 bg-brand px-4 py-2 text-xs font-bold text-white shadow-premium transition-all active:scale-[0.98]'
    : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-button border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-text-dim transition-all active:scale-[0.98]';
}

function applyInspectorToggleIcon(path, active) {
  path.setAttribute('d', getInspectorTogglePath(active));
  path.setAttribute('fill', active ? 'currentColor' : 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', active ? '0' : '1.8');
}

function createInspectorToggleIcon(active) {
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(svgNamespace, 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('class', 'h-4 w-4 shrink-0');
  icon.setAttribute('width', '16');
  icon.setAttribute('height', '16');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');

  const path = document.createElementNS(svgNamespace, 'path');
  icon.appendChild(path);
  applyInspectorToggleIcon(path, active);

  return { icon, path };
}

export function createInspectorToggle({ active, onClick }) {
  const label = getInspectorToggleLabel(active);
  const button = createButton({
    label: '',
    variant: active ? 'primary' : 'secondary',
    onClick,
  });

  button.className = getInspectorToggleClasses(active);
  button.setAttribute('aria-pressed', String(active));
  button.setAttribute('aria-label', label);
  button.title = label;
  const { icon, path } = createInspectorToggleIcon(active);
  button.appendChild(icon);

  return {
    element: button,
    setActive(nextActive) {
      const nextLabel = getInspectorToggleLabel(nextActive);
      button.setAttribute('aria-label', nextLabel);
      button.title = nextLabel;
      button.setAttribute('aria-pressed', String(nextActive));
      button.className = getInspectorToggleClasses(nextActive);
      applyInspectorToggleIcon(path, nextActive);
    },
  };
}
