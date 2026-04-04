import { createSegmentedControl, createLabel } from '../atoms/Atoms.js';
import { Icons } from '../atoms/Icons.js';
import { FontSizeLabels, FontSizes, FontWeights, LetterSpacings } from '../../../utils/tokens.js';

export function createTypographySection({ onStyleChange, initialStyles = {} }) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-3 p-3 border-b border-white/5';

  // 1. SIZE (Full Width to avoid overflow)
  const sizeGroup = document.createElement('div');
  sizeGroup.className = 'flex flex-col gap-2';
  sizeGroup.appendChild(createLabel('Font Size'));
  sizeGroup.appendChild(createSegmentedControl({
    options: FontSizeLabels.map(label => ({ label, value: FontSizes[label] })),
    activeValue: initialStyles.fontSize || FontSizes.M,
    onChange: (val) => onStyleChange('fontSize', val)
  }));
  container.appendChild(sizeGroup);

  // 2. ALIGN & WEIGHT (Joined side-by-side)
  const midRow = document.createElement('div');
  midRow.className = 'grid grid-cols-2 gap-3';

  // Alignment
  const alignCol = document.createElement('div');
  alignCol.className = 'flex flex-col gap-2';
  alignCol.appendChild(createLabel('Text Align'));
  alignCol.appendChild(createSegmentedControl({
    options: [
      { value: 'left', icon: Icons.TEXT_LEFT, title: 'Left' },
      { value: 'center', icon: Icons.TEXT_CENTER, title: 'Center' },
      { value: 'right', icon: Icons.TEXT_RIGHT, title: 'Right' },
    ],
    activeValue: initialStyles.textAlign || 'left',
    onChange: (val) => onStyleChange('textAlign', val)
  }));
  midRow.appendChild(alignCol);

  // Weight
  const weightCol = document.createElement('div');
  weightCol.className = 'flex flex-col gap-2';
  weightCol.appendChild(createLabel('Weight'));
  weightCol.appendChild(createSegmentedControl({
    options: [
      { label: 'REG', value: FontWeights.REGULAR, title: 'Regular' },
      { label: 'SEMI', value: FontWeights.SEMIBOLD, title: 'Semibold' },
      { label: 'BOLD', value: FontWeights.BOLD, title: 'Bold' },
    ],
    activeValue: initialStyles.fontWeight || FontWeights.REGULAR,
    onChange: (val) => onStyleChange('fontWeight', val)
  }));
  midRow.appendChild(weightCol);
  container.appendChild(midRow);

  // 3. LETTER SPACING (Full Width)
  const spacingGroup = document.createElement('div');
  spacingGroup.className = 'flex flex-col gap-2';
  spacingGroup.appendChild(createLabel('Letter Spacing'));
  spacingGroup.appendChild(createSegmentedControl({
    options: [
      { label: 'TIGHT', value: LetterSpacings.TIGHT, title: 'Tight' },
      { label: 'NORMAL', value: LetterSpacings.NORMAL, title: 'Normal' },
      { label: 'WIDE', value: LetterSpacings.WIDE, title: 'Wide' },
    ],
    activeValue: initialStyles.letterSpacing || LetterSpacings.NORMAL,
    onChange: (val) => onStyleChange('letterSpacing', val)
  }));
  container.appendChild(spacingGroup);

  return container;
}
