import { createButton } from './Atoms';

export function createInspectorToggle({ active, onClick }) {
  const button = createButton({
    label: active ? 'Stop picking' : 'Pick element',
    variant: active ? 'primary' : 'secondary',
    onClick,
  });

  button.setAttribute('aria-pressed', String(active));

  return {
    element: button,
    setActive(nextActive) {
      button.textContent = nextActive ? 'Stop picking' : 'Pick element';
      button.setAttribute('aria-pressed', String(nextActive));
      button.className = nextActive
        ? 'min-h-11 rounded-button border border-brand/20 bg-brand px-4 py-2 text-xs font-bold text-white shadow-premium transition-all active:scale-[0.98]'
        : 'min-h-11 rounded-button border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-text-dim transition-all active:scale-[0.98]';
    },
  };
}
