import { createSegmentedControl, createLabel, createSlider, createIconButton, createPalettePicker } from '../atoms/Atoms.js';
import { Icons } from '../atoms/Icons.js';
import { RadiiLabels, Radii, ColorTokens } from '../../../utils/tokens.js';

export function createVisualsSection({ onStyleChange, initialStyles = {} }) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 p-3 border-b border-white/5';

  // State local for transformations (since we use modern individual CSS properties)
  const scaleParts = initialStyles.scale && initialStyles.scale !== 'none' ? initialStyles.scale.split(' ') : ['1', '1'];
  let currentFlipX = scaleParts[0] === '-1' ? -1 : 1;
  let currentFlipY = scaleParts[1] === '-1' ? -1 : 1;

  // 1. COLORS (Background)
  const colorGroup = document.createElement('div');
  colorGroup.className = 'flex flex-col gap-2';
  colorGroup.appendChild(createLabel('Background Color'));
  colorGroup.appendChild(createPalettePicker({
    colors: Object.entries(ColorTokens).map(([name, value]) => ({ name, value })),
    activeColor: initialStyles.backgroundColor || 'transparent',
    onChange: (val) => onStyleChange('backgroundColor', val)
  }));
  container.appendChild(colorGroup);

  // 2. CORNER RADIUS (Grouped)
  const radiusGroup = document.createElement('div');
  radiusGroup.className = 'flex flex-col gap-2';
  radiusGroup.appendChild(createLabel('Rounded Corners'));
  radiusGroup.appendChild(createSegmentedControl({
    options: RadiiLabels.map(label => ({ label, value: Radii[label.toUpperCase()] || '0px' })),
    activeValue: initialStyles.borderRadius || '0px',
    onChange: (val) => onStyleChange('borderRadius', val)
  }));
  container.appendChild(radiusGroup);

  // 2. SLIDERS ROW (Rotate & Opacity)
  const sliderRow = document.createElement('div');
  sliderRow.className = 'grid grid-cols-1 gap-4';

  // Opacity
  const opacityVal = (initialStyles.opacity !== undefined && initialStyles.opacity !== 'none') ? parseFloat(initialStyles.opacity) : 1;
  sliderRow.appendChild(createSlider({
    label: 'Opacity',
    min: 0,
    max: 1,
    step: 0.01,
    value: opacityVal,
    unit: '',
    onChange: (val) => onStyleChange('opacity', val)
  }));

  // Rotate
  const rotateVal = (initialStyles.rotate && initialStyles.rotate !== 'none') ? parseInt(initialStyles.rotate) : 0;
  sliderRow.appendChild(createSlider({
    label: 'Rotate',
    min: 0,
    max: 360,
    step: 1,
    value: rotateVal,
    unit: '°',
    onChange: (val) => onStyleChange('rotate', `${val}deg`)
  }));

  container.appendChild(sliderRow);

  // 3. FLIP CONTROLS
  const flipGroup = document.createElement('div');
  flipGroup.className = 'flex flex-col gap-2';
  flipGroup.appendChild(createLabel('Flip element'));
  
  const flipActions = document.createElement('div');
  flipActions.className = 'flex gap-2';

  const btnFlipH = createIconButton({
    icon: Icons.FLIP_H,
    title: 'Flip Horizontal',
    active: currentFlipX === -1,
    onClick: () => {
      currentFlipX = currentFlipX === 1 ? -1 : 1;
      onStyleChange('scale', `${currentFlipX} ${currentFlipY}`);
      btnFlipH.classList.toggle('active-action', currentFlipX === -1);
    }
  });

  const btnFlipV = createIconButton({
    icon: Icons.FLIP_V,
    title: 'Flip Vertical',
    active: currentFlipY === -1,
    onClick: () => {
      currentFlipY = currentFlipY === 1 ? -1 : 1;
      onStyleChange('scale', `${currentFlipX} ${currentFlipY}`);
      btnFlipV.classList.toggle('active-action', currentFlipY === -1);
    }
  });

  flipActions.appendChild(btnFlipH);
  flipActions.appendChild(btnFlipV);
  flipGroup.appendChild(flipActions);
  container.appendChild(flipGroup);

  return container;
}
