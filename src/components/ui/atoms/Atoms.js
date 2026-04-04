export function createButton({ label, variant = 'primary', onClick, type = 'button' }) {
  const button = document.createElement('button');
  const variants = {
    primary: 'bg-brand text-white shadow-premium',
    secondary: 'bg-white/5 text-text-dim border border-white/10 hover:bg-white/10',
    ghost: 'bg-transparent text-text-dim hover:text-text-main hover:bg-white/5',
  };

  button.type = type;
  button.className = `min-h-11 rounded-button px-4 py-2 text-xs font-bold transition-all active:scale-[0.98] ${variants[variant]}`;
  button.textContent = label;

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}

export function createIconButton({ icon, onClick, active = false, title = '' }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.title = title;
  
  const activeClass = active ? 'bg-brand text-white shadow-premium border-brand' : 'bg-white/5 text-text-dim border-white/10 hover:bg-white/10';
  
  button.className = `flex h-11 w-11 items-center justify-center rounded-md border transition-all active:scale-90 ${activeClass}`;
  
  if (typeof icon === 'string') {
    button.innerHTML = icon;
  } else {
    button.appendChild(icon);
  }

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}

export function createSegmentedControl({ options, activeValue, onChange, size = 'md' }) {
  const container = document.createElement('div');
  const heightClass = size === 'sm' ? 'h-8' : 'h-11';
  container.className = `flex w-full rounded-md bg-white/5 p-1 border border-white/5 ${heightClass}`;

  options.forEach((option) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = option.title || '';
    
    if (option.icon) {
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'flex items-center justify-center';
      iconWrapper.innerHTML = option.icon;
      btn.appendChild(iconWrapper);
    } else {
      btn.textContent = option.label;
    }

    btn.className = `flex-1 flex items-center justify-center p-1.5 rounded-md text-[9px] sm:text-[10px] font-bold transition-all duration-200 border border-transparent shadow-sm whitespace-nowrap truncate`;
    
    if (activeValue === option.value) {
      btn.className += ' bg-white/10 text-brand border-white/10 ring-1 ring-white/5';
    } else {
      btn.className += ' text-white/40 hover:text-white/60 hover:bg-white/5';
    }

    btn.addEventListener('click', () => {
      onChange(option.value);
    });
    container.appendChild(btn);
  });

  return container;
}

export function createLabel(text) {
  const label = document.createElement('span');
  label.className = 'text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim mb-1 block';
  label.textContent = text;
  return label;
}

export function createInput({
  label,
  value = '',
  onChange,
  type = 'text',
  placeholder = '',
  inputMode = 'text',
}) {
  const container = document.createElement('label');
  container.className = 'flex flex-col gap-1 text-xs';

  if (label) {
    container.appendChild(createLabel(label));
  }

  const input = document.createElement('input');
  input.type = type;
  input.value = value;
  input.placeholder = placeholder;
  input.inputMode = inputMode;
  input.className = 'min-h-11 rounded-md border border-white/10 bg-white/5 px-3 text-xs font-mono text-text-main outline-none transition-colors focus:border-brand focus:bg-white/10';

  if (onChange) {
    input.addEventListener('input', (event) => onChange(event.target.value));
  }

  container.appendChild(input);

  return { container, input };
}
