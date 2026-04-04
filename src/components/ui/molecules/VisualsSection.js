import { createSegmentedControl, createLabel } from '../atoms/Atoms.js';
import { Icons } from '../atoms/Icons.js';
import { RadiiLabels, Radii } from '../../../utils/tokens.js';

export function createVisualsSection({ onStyleChange, initialStyles = {} }) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 p-3 border-b border-white/5';

  // 1. CORNER RADIUS
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
