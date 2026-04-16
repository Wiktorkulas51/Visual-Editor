import { createInspectorToggle } from '../atoms/InspectorToggle';
import { createIconButton } from '../atoms/Atoms.js';
import { Icons } from '../atoms/Icons.js';

export function createInspectorPanel({
  onInspectToggle,
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
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-text-dim">Selection</p>
        </div>
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
  footer.className = 'flex items-center justify-end gap-3 border-t border-white/10 p-4';

  const status = document.createElement('span');
  status.id = 'inspector-status';
  status.className = 'text-[10px] font-bold uppercase tracking-[0.24em] text-text-dim';
  status.textContent = 'Inspecting';

  footer.appendChild(status);
  panel.appendChild(footer);

  const selectionTitleRow = panel.querySelector('#selection-label')?.parentElement?.querySelector('div');
  let lastSelection = null;

  const copyBtn = createIconButton({
    icon: Icons.COPY,
    title: 'Copy selection',
    onClick: async () => {
      const selectionLabel = panel.querySelector('#selection-label')?.textContent ?? '';
      if (!lastSelection || !selectionLabel || selectionLabel === 'No element selected') {
        return;
      }

      const badgeEl = panel.querySelector('#selection-badge');
      const prevBadgeText = badgeEl?.textContent ?? '';

      try {
        if (navigator.clipboard?.writeText) {
          const payload = {
            tagName: lastSelection.tagName,
            className: lastSelection.attributes?.className,
            textContent: lastSelection.textContent ?? selectionLabel,
            path: lastSelection.path,
            dimensions: {
              width: lastSelection.width,
              height: lastSelection.height,
            },
            keyStyles: lastSelection.keyStyles,
            attributes: lastSelection.attributes,
            childrenSummary: lastSelection.childrenSummary,
            key: `${lastSelection.tagName}-${lastSelection.label}`,
            // Extra: keep the original label and color tokens for completeness,
            // but AI usually benefits more from the top-level fields above.
            label: lastSelection.label,
            copiedAt: Date.now(),
          };

          await navigator.clipboard.writeText(JSON.stringify(payload, null, 0));

          badgeEl && (badgeEl.textContent = 'Copied');
          window.setTimeout(() => {
            if (!panel.isConnected) return;
            // Revert based on current state; if selection disappeared, default to Idle.
            const current = lastSelection;
            if (!current) {
              if (badgeEl) badgeEl.textContent = 'Idle';
              return;
            }
            if (badgeEl && panel.querySelector('#selection-badge')) {
              badgeEl.textContent = current.tagName;
            }
          }, 1200);
          return;
        }
      } catch (e) {
        // Fallback below
      }

      // Fallback for environments without Clipboard API
      const ta = document.createElement('textarea');
      const payload = {
        tagName: lastSelection.tagName,
        className: lastSelection.attributes?.className,
        textContent: lastSelection.textContent ?? selectionLabel,
        path: lastSelection.path,
        dimensions: {
          width: lastSelection.width,
          height: lastSelection.height,
        },
        keyStyles: lastSelection.keyStyles,
        attributes: lastSelection.attributes,
        childrenSummary: lastSelection.childrenSummary,
        key: `${lastSelection.tagName}-${lastSelection.label}`,
        label: lastSelection.label,
        copiedAt: Date.now(),
      };
      ta.value = JSON.stringify(payload, null, 0);
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        badgeEl && (badgeEl.textContent = 'Copied');
      } finally {
        document.body.removeChild(ta);
      }

      // Best-effort revert
      window.setTimeout(() => {
        if (!panel.isConnected) return;
        if (!badgeEl) return;
        badgeEl.textContent = lastSelection?.tagName ?? prevBadgeText ?? 'Idle';
      }, 1200);
    },
  });
  copyBtn.dataset.aiRole = 'selection-copy';
  copyBtn.dataset.aiSelectionKey = '';
  copyBtn.dataset.aiSelectionLabel = '';
  copyBtn.dataset.aiSelectionTag = '';
  copyBtn.className += ' opacity-50 pointer-events-none';
  selectionTitleRow?.appendChild(copyBtn);

  return {
    element: panel,
    setSelection(selection) {
      lastSelection = selection;
      const target = panel.querySelector('#inspector-target');
      const label = panel.querySelector('#selection-label');
      const meta = panel.querySelector('#selection-meta');
      const badge = panel.querySelector('#selection-badge');
      const aiKeyEl = copyBtn;

      if (!selection) {
        target.textContent = 'Click an element to inspect it.';
        label.textContent = 'No element selected';
        badge.textContent = 'Idle';
        meta.classList.remove('grid-cols-2');
        meta.innerHTML = '<p>Pick an element on the page to inspect its details.</p>';
        aiKeyEl.dataset.aiSelectionKey = '';
        aiKeyEl.dataset.aiSelectionLabel = '';
        aiKeyEl.dataset.aiSelectionTag = '';
        aiKeyEl.className = aiKeyEl.className.replace(' opacity-50 pointer-events-none', '');
        aiKeyEl.className += ' opacity-50 pointer-events-none';
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

      const selectionKey = `${selection.tagName}-${selection.label}`;
      aiKeyEl.dataset.aiSelectionKey = selectionKey;
      aiKeyEl.dataset.aiSelectionLabel = selection.label;
      aiKeyEl.dataset.aiSelectionTag = selection.tagName;
      aiKeyEl.className = aiKeyEl.className.replace(' opacity-50 pointer-events-none', '');
    },
    setInspecting(isInspecting) {
      const statusEl = panel.querySelector('#inspector-status');
      statusEl.textContent = isInspecting ? 'Inspecting' : 'Paused';
      inspectToggle.setActive(isInspecting);
    },
  };
}
