import { createIconButton, createLabel } from '../atoms/Atoms.js';
import { Icons } from '../atoms/Icons.js';

export function createElementActions({ onAction }) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-4 p-3 border-b border-white/5';
  
  container.appendChild(createLabel('Element Management'));
  
  const actionsGrid = document.createElement('div');
  actionsGrid.className = 'grid grid-cols-4 gap-3';

  const actions = [
    { id: 'DUPLICATE', icon: Icons.COPY, title: 'Duplicate' },
    { id: 'MOVE_UP', icon: Icons.CHEVRON_UP, title: 'Move Up' },
    { id: 'MOVE_DOWN', icon: Icons.CHEVRON_DOWN, title: 'Move Down' },
    { id: 'DELETE', icon: Icons.DELETE, title: 'Delete', variant: 'danger' }
  ];

  actions.forEach(action => {
    const btn = createIconButton({
      icon: action.icon,
      title: action.title,
      onClick: () => onAction(action.id)
    });
    
    if (action.variant === 'danger') {
      btn.className += ' hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30';
    }
    
    actionsGrid.appendChild(btn);
  });

  container.appendChild(actionsGrid);
  return container;
}
