import { createInput } from '../atoms/Atoms';

const SIDES = ['top', 'right', 'bottom', 'left'];

export function createSpacingControl({ title, property, onChange }) {
  const section = document.createElement('section');
  section.className = 'space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4';

  const header = document.createElement('div');
  header.className = 'flex items-center justify-between gap-3';
  header.innerHTML = `
    <div>
      <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-text-dim">${title}</p>
      <p class="text-[11px] text-text-dim">Live edit on selected element</p>
    </div>
  `;
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
        inputs[side].value = values?.[side] ?? '0px';
      }
    },
  };
}
