import { createInspectorToggle } from '../atoms/InspectorToggle';
import { createButton } from '../atoms/Atoms';

export function createInspectorPanel({
  onInspectToggle,
  onDuplicate,
  onDelete,
  mode = 'sidepanel',
}) {
  const panel = document.createElement('aside');
  // ... existing code ...
  panel.className = mode === 'floating'
    ? 'fixed right-4 top-4 z-[2147483647] flex h-[min(88dvh,44rem)] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface-glass text-text-main shadow-premium backdrop-blur-xl'
    : 'flex h-full min-h-screen w-full flex-col overflow-hidden border-0 bg-surface-glass text-text-main';

  const header = document.createElement('header');
  // ... rest of the header code ...
  header.className = 'flex items-start justify-between gap-4 border-b border-white/10 p-4 sm:p-5';
  header.innerHTML = `
    <div class="space-y-1">
      <p class="text-[10px] font-bold uppercase tracking-[0.28em] text-text-dim">Inspector</p>
      <h2 class="text-lg font-bold tracking-tight">Element Details</h2>
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

  const properties = document.createElement('section');
  properties.id = 'inspector-properties';
  properties.className = 'mt-6 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/5 overflow-hidden';
  main.appendChild(properties);

  panel.appendChild(main);

  const footer = document.createElement('footer');
  footer.className = 'flex items-center justify-between gap-3 border-t border-white/10 p-4 bg-white/5';

  const footerLeft = document.createElement('div');
  footerLeft.className = 'flex items-center gap-2';
  
  const status = document.createElement('span');
  status.id = 'inspector-status';
  status.className = 'text-[10px] font-bold uppercase tracking-[0.24em] text-text-dim';
  status.textContent = 'Paused';
  footerLeft.appendChild(status);
  footer.appendChild(footerLeft);

  const footerRight = document.createElement('div');
  footerRight.className = 'flex items-center gap-2 hidden'; // Hidden by default (no selection)
  footerRight.id = 'inspector-actions';

  const duplicateBtn = createButton({
    label: 'Duplicate',
    variant: 'secondary',
    onClick: onDuplicate
  });
  duplicateBtn.className += ' !h-8 !px-3 !text-[11px]';
  footerRight.appendChild(duplicateBtn);

  const deleteBtn = createButton({
    label: 'Delete',
    variant: 'danger',
    onClick: onDelete
  });
  deleteBtn.className += ' !h-8 !px-3 !text-[11px] !bg-red-500/10 !text-red-400 !border-red-500/20 hover:!bg-red-500/20';
  footerRight.appendChild(deleteBtn);

  footer.appendChild(footerRight);
  panel.appendChild(footer);

  return {
    element: panel,
    setSelection(selection) {
      const target = panel.querySelector('#inspector-target');
      const label = panel.querySelector('#selection-label');
      const meta = panel.querySelector('#selection-meta');
      const badge = panel.querySelector('#selection-badge');
      const actions = panel.querySelector('#inspector-actions');

      if (!selection) {
        target.textContent = 'Click an element to inspect it.';
        label.textContent = 'No element selected';
        badge.textContent = 'Idle';
        meta.classList.remove('grid-cols-2');
        meta.innerHTML = '<p>Pick an element on the page to inspect its details.</p>';
        actions.classList.add('hidden');
        return;
      }

      target.textContent = selection.label;
      label.textContent = selection.label;
      badge.textContent = selection.tagName;
      meta.classList.add('grid-cols-2');
      meta.innerHTML = `
        <p><span class="text-text-main">Dimensions:</span> ${selection.width} × ${selection.height}</p>
        <p><span class="text-text-main">Tag:</span> ${selection.tagName.toUpperCase()}</p>
      `;
      actions.classList.remove('hidden');
    },
    setInspecting(isInspecting) {
      const statusEl = panel.querySelector('#inspector-status');
      statusEl.textContent = isInspecting ? 'Inspecting' : 'Paused';
      inspectToggle.setActive(isInspecting);
    },
  };
}
