import { createButton, createInput } from '../atoms/Atoms';

const SIDES = ['top', 'right', 'bottom', 'left'];

function createSpacingGroup(title, property, onChange) {
  const section = document.createElement('section');
  section.className = 'space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4';

  const header = document.createElement('div');
  header.className = 'flex items-center justify-between gap-3';

  const heading = document.createElement('div');
  heading.innerHTML = `
    <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-text-dim">${title}</p>
    <p class="text-[11px] text-text-dim">Live edit on selected element</p>
  `;

  header.appendChild(heading);
  section.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-2 gap-3';

  const inputs = {};

  for (const side of SIDES) {
    const control = createInput({
      label: side,
      value: '0px',
      onChange: (value) => onChange(property, side, value),
    });

    inputs[side] = control.input;
    grid.appendChild(control.container);
  }

  section.appendChild(grid);

  return {
    element: section,
    setValues(values) {
      for (const side of SIDES) {
        inputs[side].value = values[side] ?? '0px';
      }
    },
  };
}

export function createInspectorPanel({ onInspectToggle, onSpacingChange, onResetSpacing }) {
  const panel = document.createElement('aside');
  panel.className = 'fixed right-4 top-4 z-[2147483647] flex h-[min(88dvh,44rem)] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface-glass text-text-main shadow-premium backdrop-blur-xl';

  const header = document.createElement('header');
  header.className = 'flex items-start justify-between gap-4 border-b border-white/10 p-5';
  header.innerHTML = `
    <div class="space-y-1">
      <p class="text-[10px] font-bold uppercase tracking-[0.28em] text-text-dim">Inspector</p>
      <h2 class="text-lg font-bold tracking-tight">Spacing Controls</h2>
      <p id="inspector-target" class="text-[11px] text-text-dim">Click an element to inspect it.</p>
    </div>
  `;

  const headerActions = document.createElement('div');
  headerActions.className = 'flex flex-col items-end gap-2';

  const viewportStatus = document.createElement('span');
  viewportStatus.id = 'viewport-status';
  viewportStatus.className = 'rounded-full border border-brand/20 bg-brand/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand';
  viewportStatus.textContent = 'Desktop 0px';

  const inspectButton = createButton({
    label: 'Pick element',
    variant: 'secondary',
    onClick: onInspectToggle,
  });

  headerActions.appendChild(viewportStatus);
  headerActions.appendChild(inspectButton);
  header.appendChild(headerActions);
  panel.appendChild(header);

  const main = document.createElement('main');
  main.className = 'flex-1 space-y-4 overflow-y-auto p-5';

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

  const marginGroup = createSpacingGroup('Margin', 'margin', onSpacingChange);
  const paddingGroup = createSpacingGroup('Padding', 'padding', onSpacingChange);
  main.appendChild(marginGroup.element);
  main.appendChild(paddingGroup.element);

  panel.appendChild(main);

  const footer = document.createElement('footer');
  footer.className = 'flex items-center justify-between gap-3 border-t border-white/10 p-4';

  const resetButton = createButton({
    label: 'Reset spacing',
    variant: 'secondary',
    onClick: onResetSpacing,
  });

  const status = document.createElement('span');
  status.id = 'inspector-status';
  status.className = 'text-[10px] font-bold uppercase tracking-[0.24em] text-text-dim';
  status.textContent = 'Inspecting';

  footer.appendChild(status);
  footer.appendChild(resetButton);
  panel.appendChild(footer);

  function setSpacingValues(selection) {
    marginGroup.setValues(selection?.spacing?.margin ?? {});
    paddingGroup.setValues(selection?.spacing?.padding ?? {});
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
        <p><span class="text-text-main">Margin:</span> ${selection.spacingSummary.margin}</p>
        <p><span class="text-text-main">Padding:</span> ${selection.spacingSummary.padding}</p>
      `;
      setSpacingValues(selection);
    },
    setInspecting(isInspecting) {
      const statusEl = panel.querySelector('#inspector-status');
      const badge = panel.querySelector('#selection-badge');
      statusEl.textContent = isInspecting ? 'Inspecting' : 'Paused';
      badge.textContent = isInspecting ? (badge.textContent === 'Idle' ? 'Active' : badge.textContent) : 'Paused';
      inspectButton.textContent = isInspecting ? 'Stop picking' : 'Pick element';
    },
  };
}
