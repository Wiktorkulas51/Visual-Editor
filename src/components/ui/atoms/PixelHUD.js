/**
 * Pixel HUD Atoms: Dark Fantasy - SciFi Aesthetic
 */

/**
 * Creates a notched pixel container
 * @param {Object} options 
 */
export function createPixelBox({ children = [], className = '', variant = 'default' }) {
  const box = document.createElement('div');
  
  const variants = {
    default: 'bg-pixel-bg pixel-border-heavy',
    blood: 'bg-pixel-blood/20 border-pixel-blood border-2',
    void: 'bg-pixel-void/20 border-pixel-void border-2',
  };

  box.className = `pixel-notched relative p-4 ${variants[variant]} ${className}`;
  
  // Add scanline overlay for that scifi feel
  const scanlines = document.createElement('div');
  scanlines.className = 'absolute inset-0 pixel-scanlines pointer-events-none opacity-20';
  box.appendChild(scanlines);

  const content = document.createElement('div');
  content.className = 'relative z-10';
  children.forEach(child => {
    if (typeof child === 'string') {
      content.innerHTML += child;
    } else {
      content.appendChild(child);
    }
  });
  box.appendChild(content);

  return box;
}

/**
 * Creates a pixel-font label
 */
export function createPixelLabel(text, { variant = 'silver', size = 'text-xs' } = {}) {
  const label = document.createElement('span');
  
  const colors = {
    silver: 'text-pixel-silver',
    blood: 'text-pixel-blood',
    data: 'text-pixel-data',
    void: 'text-pixel-void',
  };

  label.className = `pixel-font ${size} ${colors[variant]} uppercase font-bold`;
  label.textContent = text;
  
  return label;
}
