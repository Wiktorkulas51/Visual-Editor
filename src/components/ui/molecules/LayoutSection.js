import { createSegmentedControl, createLabel } from '../atoms/Atoms.js';
import { Icons } from '../atoms/Icons.js';
import { SpacingLabels, SpacingTokens } from '../../../utils/tokens.js';

export function createLayoutSection({ onStyleChange, initialStyles = {} }) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 p-3 border-b border-white/5';

  // State state tracking for internal visibility
  let currentDisplay = initialStyles.display || 'block';

  // --- SUB-SECTIONS (To be toggled) ---
  const flowSection = document.createElement('div');
  const alignSection = document.createElement('div');
  const gapSection = document.createElement('div');

  const updateVisibility = (displayType) => {
    const isLayoutable = displayType === 'flex' || displayType === 'grid';
    const isFlex = displayType === 'flex';
    
    flowSection.style.display = isFlex ? 'flex' : 'none';
    alignSection.style.display = isLayoutable ? 'flex' : 'none';
    gapSection.style.display = isLayoutable ? 'flex' : 'none';
  };

  // 1. TYPE (Always Visible)
  const typeContainer = document.createElement('div');
  typeContainer.className = 'flex flex-col gap-2';
  typeContainer.appendChild(createLabel('Layout Type'));
  typeContainer.appendChild(createSegmentedControl({
    options: [
      { value: 'block', icon: Icons.BLOCK, title: 'Block' },
      { value: 'flex', icon: Icons.FLEX, title: 'Flex' },
      { value: 'grid', icon: Icons.GRID, title: 'Grid' },
    ],
    activeValue: currentDisplay,
    onChange: (val) => {
      currentDisplay = val;
      onStyleChange('display', val);
      updateVisibility(val);
    }
  }));
  container.appendChild(typeContainer);

  // 2. FLOW (Flex only)
  flowSection.className = 'flex flex-col gap-2';
  flowSection.appendChild(createLabel('Direction & Wrap'));
  flowSection.appendChild(createSegmentedControl({
    options: [
      { value: 'row', icon: Icons.ROW, title: 'Row' },
      { value: 'column', icon: Icons.COLUMN, title: 'Column' },
      { value: 'wrap', icon: Icons.WRAP, title: 'Wrap' },
    ],
    activeValue: initialStyles.flexDirection === 'column' ? 'column' : (initialStyles.flexWrap === 'wrap' ? 'wrap' : 'row'),
    onChange: (val) => {
      if (val === 'wrap') {
        const isWrap = initialStyles.flexWrap === 'wrap';
        onStyleChange('flexWrap', isWrap ? 'nowrap' : 'wrap');
      } else {
        onStyleChange('flexDirection', val);
        onStyleChange('flexWrap', 'nowrap');
      }
    }
  }));
  container.appendChild(flowSection);

  // 3. ALIGNMENT (Flex/Grid)
  alignSection.className = 'flex flex-col gap-2';
  alignSection.appendChild(createLabel('Alignment'));
  const alignRow = document.createElement('div');
  alignRow.className = 'grid grid-cols-2 gap-1';

  alignRow.appendChild(createSegmentedControl({
    options: [
      { value: 'start', icon: Icons.JUSTIFY_START, title: 'Left' },
      { value: 'center', icon: Icons.JUSTIFY_CENTER, title: 'Center' },
      { value: 'end', icon: Icons.JUSTIFY_END, title: 'Right' },
      { value: 'between', icon: Icons.JUSTIFY_BETWEEN, title: 'Between' },
    ],
    activeValue: initialStyles.justifyContent?.replace('flex-', '') === 'space-between' ? 'between' : initialStyles.justifyContent?.replace('flex-', '') || 'start',
    onChange: (val) => {
      let cssVal = val;
      if (val === 'center') cssVal = 'center';
      else if (val === 'between') cssVal = 'space-between';
      else cssVal = `flex-${val}`;
      onStyleChange('justifyContent', cssVal);
    }
  }));

  alignRow.appendChild(createSegmentedControl({
    options: [
      { value: 'start', icon: Icons.ALIGN_ITEMS_START, title: 'Top' },
      { value: 'center', icon: Icons.ALIGN_ITEMS_CENTER, title: 'Middle' },
      { value: 'end', icon: Icons.ALIGN_ITEMS_END, title: 'Bottom' },
      { value: 'stretch', icon: Icons.ALIGN_ITEMS_STRETCH, title: 'Stretch' },
    ],
    activeValue: initialStyles.alignItems?.replace('flex-', '') || 'stretch',
    onChange: (val) => {
      let cssVal = val === 'stretch' ? 'stretch' : (val === 'center' ? 'center' : `flex-${val}`);
      onStyleChange('alignItems', cssVal);
    }
  }));

  alignSection.appendChild(alignRow);
  container.appendChild(alignSection);

  // 4. GAP (Flex/Grid)
  gapSection.className = 'flex flex-col gap-2';
  gapSection.appendChild(createLabel('Spacing (Gap)'));
  gapSection.appendChild(createSegmentedControl({
    options: SpacingLabels.map(label => ({ label, value: SpacingTokens[label.toUpperCase()] || '0px' })),
    activeValue: initialStyles.gap || '0px',
    onChange: (val) => onStyleChange('gap', val)
  }));
  container.appendChild(gapSection);

  // 5. POSITIONING (Mode & Z-Index)
  const posSection = document.createElement('div');
  posSection.className = 'flex flex-col gap-2 pt-2 border-t border-white/5';
  posSection.appendChild(createLabel('Position & Layering'));
  
  const posRow = document.createElement('div');
  posRow.className = 'grid grid-cols-2 gap-3';

  // Mode
  const modeCol = document.createElement('div');
  modeCol.className = 'flex flex-col gap-1';
  modeCol.appendChild(createSegmentedControl({
    options: [
      { value: 'static', icon: Icons.BLOCK, title: 'Static' },
      { value: 'absolute', icon: Icons.ABSOLUTE, title: 'Absolute' },
      { value: 'fixed', icon: Icons.FIXED, title: 'Fixed' },
      { value: 'sticky', icon: Icons.STICKY, title: 'Sticky' },
    ],
    activeValue: initialStyles.position || 'static',
    onChange: (val) => onStyleChange('position', val)
  }));
  posRow.appendChild(modeCol);

  // Z-Index Presets
  const zIndexCol = document.createElement('div');
  zIndexCol.className = 'flex flex-col gap-1';
  zIndexCol.appendChild(createSegmentedControl({
    options: [
      { label: 'BASE', value: '0', title: 'Layer 0' },
      { label: 'TOP', value: '100', title: 'Layer 100' },
      { label: 'MAX', value: '999', title: 'Layer 999' },
    ],
    activeValue: initialStyles.zIndex || '0',
    onChange: (val) => onStyleChange('zIndex', val)
  }));
  posRow.appendChild(zIndexCol);

  posSection.appendChild(posRow);
  container.appendChild(posSection);

  // Initial Visibility state
  updateVisibility(currentDisplay);

  return container;
}
