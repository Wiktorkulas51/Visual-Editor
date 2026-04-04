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
    value: rgbToHex(initialStyles['color']),
    tokens: tokens,
    onChange: (val) => onStyleChange('color', val)
  }));

  colorGroup.appendChild(createColorPickerWithTokens({
    label: 'Background',
    value: rgbToHex(initialStyles['background-color']),
    tokens: tokens,
    onChange: (val) => onStyleChange('backgroundColor', val)
  }));
  
  container.appendChild(colorGroup);

  // 2. OPACITY
  const rawOpacity = initialStyles['opacity'];
  const opacityValue = rawOpacity !== undefined ? Math.round(parseFloat(rawOpacity) * 100) : 100;
  
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
  radiusContainer.className = 'flex flex-col gap-2 pt-2';
  radiusContainer.appendChild(createLabel('Corners (Rounded)'));
  
  const currentRadius = initialStyles['border-radius'] || '0px';
  // Standardize radius for matching (e.g., '8px 8px 8px 8px' -> '8px')
  const baseRadius = currentRadius.split(' ')[0] || '0px';

  radiusContainer.appendChild(createSegmentedControl({
    options: RadiiLabels.map(label => ({ label, value: Radii[label.toUpperCase()] || '0px' })),
    activeValue: RadiiLabels.map(l => Radii[l.toUpperCase()]).includes(baseRadius) ? baseRadius : '0px',
    onChange: (val) => onStyleChange('borderRadius', val)
  }));
  container.appendChild(radiusContainer);
  
  // 4. BORDERS
  const borderGroup = document.createElement('div');
  borderGroup.className = 'flex flex-col gap-3 pt-2';
  
  const borderStyleRow = document.createElement('div');
  borderStyleRow.className = 'flex flex-col gap-2';
  borderStyleRow.appendChild(createLabel('Border Style'));
  
  const borderWidthValue = parseInt(initialStyles['border-width']) || 0;

  borderStyleRow.appendChild(createSegmentedControl({
    options: [
      { label: 'None', value: 'none' },
      { label: 'Solid', value: 'solid' },
      { label: 'Dashed', value: 'dashed' }
    ],
    activeValue: initialStyles['border-style'] || 'none',
    onChange: (val) => {
      onStyleChange('borderStyle', val);
      // Auto-set width if 0 to make border visible and persist in computed styles
      if (val !== 'none' && borderWidthValue === 0) {
        onStyleChange('borderWidth', '1px');
      }
    }
  }));
  borderGroup.appendChild(borderStyleRow);
  
  borderGroup.appendChild(createSlider({
    label: 'Border Width',
    min: 0,
    max: 20,
    value: borderWidthValue,
    unit: 'px',
    onChange: (val) => onStyleChange('borderWidth', `${val}px`)
  }));
  
  container.appendChild(borderGroup);

  // 5. SHADOWS
  const shadowContainer = document.createElement('div');
  shadowContainer.className = 'flex flex-col gap-2 pt-2';
  shadowContainer.appendChild(createLabel('Box Shadow'));
  
  const shadowPresets = [
    { label: 'None', value: 'none', match: 'none' },
    { label: 'Soft', value: '0 2px 12px rgba(0,0,0,0.08)', match: '2px 12px' },
    { label: 'Hard', value: '0 8px 32px rgba(0,0,0,0.16)', match: '8px 32px' },
    { label: 'Floating', value: '0 24px 64px rgba(0,0,0,0.24)', match: '24px 64px' }
  ];

  const currentShadow = initialStyles['box-shadow'] || 'none';
  // Use fuzzy matching for shadows to ignore color format differences
  const matchingPreset = shadowPresets.find(p => {
    if (p.value === 'none') return currentShadow === 'none' || currentShadow.includes('rgba(0, 0, 0, 0)');
    return currentShadow.includes(p.match);
  }) || shadowPresets[0];

  shadowContainer.appendChild(createSegmentedControl({
    options: shadowPresets.map(p => ({ label: p.label, value: p.value })),
    activeValue: matchingPreset.value,
    onChange: (val) => onStyleChange('boxShadow', val)
  }));
  
  container.appendChild(shadowContainer);
  
  container.appendChild(shadowContainer);

  return container;
}
