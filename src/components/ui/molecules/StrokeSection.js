import { createSegmentedControl, createLabel, createSlider, createPalettePicker } from '../atoms/Atoms.js';
import { ColorTokens } from '../../../utils/tokens.js';

export function createStrokeSection({ onStyleChange, initialStyles = {} }) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 p-3 border-b border-white/5';

  // State local for smart mapping
  let currentWidth = parseInt(initialStyles.borderWidth) || 0;
  // Heuristic to detect current position
  let currentPos = 'outside';
  if (initialStyles.boxShadow?.includes('inset')) currentPos = 'inside';
  else if (initialStyles.boxShadow && initialStyles.boxShadow !== 'none') currentPos = 'center';

  let currentColor = initialStyles.borderColor || ColorTokens.PRIMARY;

  const palette = Object.entries(ColorTokens).map(([name, value]) => ({ name, value }));

  const applyStroke = (width, color, pos) => {
    // Reset all to avoid conflict before apply
    onStyleChange('borderWidth', '0px');
    onStyleChange('borderStyle', 'none');
    onStyleChange('boxShadow', 'none');

    let effectiveWidth = width;
    if (effectiveWidth <= 0) {
      effectiveWidth = 1; // Default to 1px if color is picked but width was 0
      currentWidth = 1;
    }

    if (pos === 'outside') {
      onStyleChange('borderStyle', 'solid');
      onStyleChange('borderWidth', `${effectiveWidth}px`);
      onStyleChange('borderColor', color);
    } else if (pos === 'inside') {
      onStyleChange('boxShadow', `inset 0 0 0 ${effectiveWidth}px ${color}`);
    } else if (pos === 'center') {
      onStyleChange('boxShadow', `0 0 0 ${effectiveWidth/2}px ${color}, inset 0 0 0 ${effectiveWidth/2}px ${color}`);
    }
  };

  // 1. WIDTH SLIDER
  container.appendChild(createLabel('Stroke Width'));
  container.appendChild(createSlider({
    min: 0,
    max: 20,
    step: 1,
    value: currentWidth,
    unit: 'px',
    onChange: (val) => {
      currentWidth = val;
      applyStroke(currentWidth, currentColor, currentPos);
    }
  }));

  // 2. POSITION SWITCHER
  container.appendChild(createLabel('Position'));
  container.appendChild(createSegmentedControl({
    options: [
      { label: 'INSIDE', value: 'inside' },
      { label: 'OUTSIDE', value: 'outside' },
      { label: 'CENTER', value: 'center' },
    ],
    activeValue: currentPos,
    onChange: (val) => {
      currentPos = val;
      applyStroke(currentWidth, currentColor, currentPos);
    }
  }));

  // 3. COLOR PALETTE
  container.appendChild(createLabel('Stroke Color'));
  container.appendChild(createPalettePicker({
    colors: palette,
    activeColor: currentColor,
    onChange: (val) => {
      currentColor = val;
      applyStroke(currentWidth, currentColor, currentPos);
    }
  }));

  return container;
}
