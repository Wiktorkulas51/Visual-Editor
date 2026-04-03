import { createInspectorToggle } from '../atoms/InspectorToggle';
import { createSpacingControl } from '../molecules/SpacingControl';

export function createInspectorPanel({
  onInspectToggle,
  onSpacingChange,
  onResetSpacing,
  mode = 'sidepanel',
}) {
  const panel = document.createElement('aside');
  panel.className = mode === 'floating'
    ? 'fixed right-4 top-4 z-[2147483647] flex h-[min(88dvh,44rem)] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface-glass text-text-main shadow-premium backdrop-blur-xl'
    : 'flex h-full min-h-screen w-full flex-col overflow-hidden border-0 bg-surface-glass text-text-main';

  const header = document.createElement('header');
  header.className = 'flex items-start justify-between gap-4 border-b border-white/10 p-4 sm:p-5';
  header.innerHTML = `
    <div class="space-y-1">
      <p class="text-[10px] font-bold uppercase tracking-[0.28em] text-text-dim">Inspector</p>
      <h2 class="text-lg font-bold tracking-tight">Spacing Controls</h2>
      <p id="inspector-target" class="text-[11px] text-text-dim">Click an element to inspect it.</p>
    </div>
  `;

  const inspectToggle = createInspectorToggle({ active: false, onClick: onInspectToggle });
  const headerActions = document.createElement('div');
  headerActions.className = 'flex flex-col items-end gap-2';
  headerActions.appendChild(inspectToggle.element);
  header.appendChild(headerActions);
  panel.appendChild(header);

  const main = document.createElement('main');
  main.className = 'flex-1 space-y-4 overflow-y-auto p-4 sm:p-5';

  const summary = document.createElement('section');
  summary.className = 'space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4';
  summary.innerHTML = `
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-text-dim">Selection</p>
        <p id="selection-label" class="mt-1 text-sm font-semibold">No element selected</p>
      </div>
      <span id="selection-badge" class="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim">Idle</span>
    </div>
    <div id="selection-meta" class="grid gap-2 text-[11px] text-text-dim"></div>
  `;
  main.appendChild(summary);

  const marginControl = createSpacingControl({
    title: 'Margin',
    property: 'margin',
    onChange: onSpacingChange,
  });
  const paddingControl = createSpacingControl({
    title: 'Padding',
    property: 'padding',
    onChange: onSpacingChange,
  });
  main.appendChild(marginControl.element);
  main.appendChild(paddingControl.element);
  panel.appendChild(main);

  const footer = document.createElement('footer');
  footer.className = 'flex items-center justify-between gap-3 border-t border-white/10 p-4';

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'min-h-11 rounded-button border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-text-dim transition-all active:scale-[0.98]';
  resetButton.textContent = 'Reset spacing';
  resetButton.addEventListener('click', onResetSpacing);

  const status = document.createElement('span');
  status.id = 'inspector-status';
  status.className = 'text-[10px] font-bold uppercase tracking-[0.24em] text-text-dim';
  status.textContent = 'Inspecting';

  footer.appendChild(status);
  footer.appendChild(resetButton);
  panel.appendChild(footer);

  function setSpacingValues(selection) {
    marginControl.setValues(selection?.spacing?.margin ?? {});
    paddingControl.setValues(selection?.spacing?.padding ?? {});
  }

  return {
    element: panel,
    setSelection(selection) {
      const target = panel.querySelector('#inspector-target');
      const label = panel.querySelector('#selection-label');
      const meta = panel.querySelector('#selection-meta');
      const badge = panel.querySelector('#selection-badge');

      if (!selection) {
        target.textContent = 'Click an element to inspect it.';
        label.textContent = 'No element selected';
        meta.innerHTML = '<p>Pick an element on the page to read and edit its spacing.</p>';
        badge.textContent = 'Idle';
        setSpacingValues(null);
        return;
      }

      target.textContent = selection.label;
      label.textContent = selection.label;
      badge.textContent = selection.tagName;
      meta.innerHTML = `
        <p><span class="text-text-main">Dimensions:</span> ${selection.width} × ${selection.height}</p>
        <p><span class="text-text-main">Margin:</span> ${selection.spacing?.marginSummary ?? '0px 0px 0px 0px'}</p>
        <p><span class="text-text-main">Padding:</span> ${selection.spacing?.paddingSummary ?? '0px 0px 0px 0px'}</p>
      `;
      setSpacingValues(selection);
    },
    setInspecting(isInspecting) {
      const statusEl = panel.querySelector('#inspector-status');
      statusEl.textContent = isInspecting ? 'Inspecting' : 'Paused';
      inspectToggle.setActive(isInspecting);
    },
  };
}
