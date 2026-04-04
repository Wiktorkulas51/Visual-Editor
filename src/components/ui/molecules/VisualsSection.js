import { createSegmentedControl, createLabel, createColorInput, createSlider } from '../atoms/Atoms.js';
import { Icons } from '../atoms/Icons.js';
import { RadiiLabels, Radii } from '../../../utils/tokens.js';

function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
  const matches = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (!matches) return '#ffffff';
  
  const r = parseInt(matches[1]).toString(16).padStart(2, '0');
  const g = parseInt(matches[2]).toString(16).padStart(2, '0');
  const b = parseInt(matches[3]).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}

function createColorPickerWithTokens({ label, value, onChange, tokens = [] }) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-2';
  
  container.appendChild(createColorInput({ label, value, onChange }));
  
  const tokenContainer = document.createElement('div');
  tokenContainer.className = 'flex flex-wrap gap-1.5 px-0.5';
  
  const displayTokens = (tokens && tokens.length > 0) 
    ? tokens 
    : ['#ffffff', '#000000', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  
  displayTokens.forEach(token => {
    const swatch = document.createElement('button');
    swatch.className = 'h-3.5 w-3.5 rounded-full border border-white/10 hover:scale-125 transition-transform shadow-sm';
    swatch.style.backgroundColor = token;
    swatch.title = token;
    swatch.addEventListener('click', () => onChange(token));
    tokenContainer.appendChild(swatch);
  });
  
  container.appendChild(tokenContainer);
  return container;
}

export function createVisualsSection({ onStyleChange, initialStyles = {}, selection = {} }) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 p-3 border-b border-white/5';

  const tokens = selection.colorTokens || [];

  // 1. COLORS
  const colorGroup = document.createElement('div');
  colorGroup.className = 'grid grid-cols-2 gap-3';
  
  colorGroup.appendChild(createColorPickerWithTokens({
    label: 'Text',
    value: rgbToHex(initialStyles.color),
    tokens: tokens,
    onChange: (val) => onStyleChange('color', val)
  }));

  colorGroup.appendChild(createColorPickerWithTokens({
    label: 'Background',
    value: rgbToHex(initialStyles.backgroundColor),
    tokens: tokens,
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
