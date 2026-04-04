import { createSegmentedControl, createLabel, createColorInput, createSlider } from '../atoms/Atoms.js';
import { Icons } from '../atoms/Icons.js';
import { RadiiLabels, Radii } from '../../../utils/tokens.js';

function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent') return '#00000000';
  const matches = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (!matches) return '#000000';
  
  const r = parseInt(matches[1]).toString(16).padStart(2, '0');
  const g = parseInt(matches[2]).toString(16).padStart(2, '0');
  const b = parseInt(matches[3]).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}

export function createVisualsSection({ onStyleChange, initialStyles = {} }) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 p-3 border-b border-white/5';

  // 1. COLORS
  const colorGroup = document.createElement('div');
  colorGroup.className = 'grid grid-cols-2 gap-2';
  
  colorGroup.appendChild(createColorInput({
    label: 'Text',
    value: rgbToHex(initialStyles.color),
    onChange: (val) => onStyleChange('color', val)
  }));

  colorGroup.appendChild(createColorInput({
    label: 'Background',
    value: rgbToHex(initialStyles.backgroundColor),
    onChange: (val) => onStyleChange('backgroundColor', val)
  }));
  
  container.appendChild(colorGroup);

  // 2. OPACITY
  const opacityValue = initialStyles.opacity !== undefined ? Math.round(parseFloat(initialStyles.opacity) * 100) : 100;
  container.appendChild(createSlider({
    label: 'Opacity',
    min: 0,
    max: 100,
    value: opacityValue,
    unit: '%',
    onChange: (val) => onStyleChange('opacity', (val / 100).toString())
  }));

  // 3. CORNER RADIUS
  const radiusContainer = document.createElement('div');
  radiusContainer.className = 'flex flex-col gap-2';
  radiusContainer.appendChild(createLabel('Corners (Rounded)'));
  radiusContainer.appendChild(createSegmentedControl({
    options: RadiiLabels.map(label => ({ label, value: Radii[label.toUpperCase()] || '0px' })),
    activeValue: initialStyles.borderRadius || Radii.NONE,
    onChange: (val) => onStyleChange('borderRadius', val)
  }));
  container.appendChild(radiusContainer);

  return container;
}
