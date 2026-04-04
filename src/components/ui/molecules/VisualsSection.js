import { createSectionHeader, createColorInput, createSlider, createSegmentedControl } from '../atoms/Atoms.js';
import { BorderWidths, BorderWidthLabels, Shadows, ShadowLabels } from '../../../utils/tokens.js';

export function createVisualsSection({
  selection,
  initialStyles,
  onStyleChange,
}) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-6';

  // Section Header
  container.appendChild(createSectionHeader('Visuals', 'Appearance & Effects'));

  const content = document.createElement('div');
  content.className = 'grid gap-6';

  // Opacity Control
  const opacityVal = initialStyles.opacity || '1';
  const opacityControl = createSlider({
    label: 'Opacity',
    value: parseFloat(opacityVal) * 100,
    min: 0,
    max: 100,
    unit: '%',
    onChange: (val) => onStyleChange('opacity', (val / 100).toString())
  });
  content.appendChild(opacityControl);

  const colorsGrid = document.createElement('div');
  colorsGrid.className = 'grid grid-cols-2 gap-4';

  // Text Color
  const textColor = createColorInput({
    label: 'Text',
    value: initialStyles.color || '#000000',
    tokens: selection?.colorTokens || [],
    onChange: (val) => onStyleChange('color', val),
  });
  colorsGrid.appendChild(textColor);

  // Background Color
  const bgColor = createColorInput({
    label: 'Background',
    value: initialStyles.backgroundColor || 'transparent',
    tokens: selection?.colorTokens || [],
    onChange: (val) => onStyleChange('backgroundColor', val),
  });
  colorsGrid.appendChild(bgColor);
  content.appendChild(colorsGrid);

  // Border Section
  const borderGroup = document.createElement('div');
  borderGroup.className = 'space-y-4 rounded-xl border border-white/10 bg-white/5 p-4';
  
  const borderHeader = document.createElement('div');
  borderHeader.className = 'flex items-center justify-between mb-1';
  borderHeader.innerHTML = '<span class="text-[10px] font-bold uppercase tracking-wider text-text-dim">Border Styling</span>';
  borderGroup.appendChild(borderHeader);

  const currentWidthValue = initialStyles.borderWidth || '0px';
  const activeWidthLabel = BorderWidthLabels.find(l => BorderWidths[l.toUpperCase()] === currentWidthValue) || 'None';

  const borderWidth = createSegmentedControl({
    label: 'Width',
    options: BorderWidthLabels,
    activeOption: activeWidthLabel,
    onChange: (label) => {
      const val = BorderWidths[label.toUpperCase()];
      onStyleChange('borderWidth', val);
      // Ensure solid border if width > 0
      if (val !== '0px') onStyleChange('borderStyle', 'solid');
    }
  });
  borderGroup.appendChild(borderWidth);

  const borderColor = createColorInput({
    label: 'Color',
    value: initialStyles.borderColor || 'transparent',
    tokens: selection?.colorTokens || [],
    onChange: (val) => onStyleChange('borderColor', val),
  });
  borderGroup.appendChild(borderColor);
  content.appendChild(borderGroup);

  // Shadow Section
  const shadowGroup = document.createElement('div');
  shadowGroup.className = 'space-y-4 rounded-xl border border-white/10 bg-white/5 p-4';
  
  const shadowHeader = document.createElement('div');
  shadowHeader.className = 'flex items-center justify-between mb-1';
  shadowHeader.innerHTML = '<span class="text-[10px] font-bold uppercase tracking-wider text-text-dim">Shadow Presets</span>';
  shadowGroup.appendChild(shadowHeader);

  const currentShadow = initialStyles.boxShadow || 'none';
  const activeShadowLabel = ShadowLabels.find(l => Shadows[l.toUpperCase()] === currentShadow) || 'None';

  const shadowControl = createSegmentedControl({
    label: 'Style',
    options: ShadowLabels,
    activeOption: activeShadowLabel,
    onChange: (label) => onStyleChange('boxShadow', Shadows[label.toUpperCase()]),
  });
  shadowGroup.appendChild(shadowControl);
  content.appendChild(shadowGroup);

  container.appendChild(content);
  return container;
}
