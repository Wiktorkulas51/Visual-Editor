export function createButton({ label, variant = 'primary', onClick, type = 'button' }) {
  const button = document.createElement('button');
  const variants = {
    primary: 'bg-brand text-white shadow-premium',
    secondary: 'bg-white/5 text-text-dim border border-white/10 hover:bg-white/10',
  };

  button.type = type;
  button.className = `min-h-11 rounded-button px-4 py-2 text-xs font-bold transition-all active:scale-[0.98] ${variants[variant]}`;
  button.textContent = label;

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
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

  const labelEl = document.createElement('span');
  labelEl.className = 'ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim';
  labelEl.textContent = label;

  const input = document.createElement('input');
  input.type = type;
  input.value = value;
  input.placeholder = placeholder;
  input.inputMode = inputMode;
  input.className = 'min-h-11 rounded-md border border-white/10 bg-white/5 px-3 text-xs font-mono text-text-main outline-none transition-colors focus:border-brand focus:bg-white/10';

  if (onChange) {
    input.addEventListener('input', (event) => onChange(event.target.value));
  }

  container.appendChild(labelEl);
  container.appendChild(input);

  return { container, input };
}
