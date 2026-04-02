// src/components/ui/atoms/Button.js
export function createButton({ label, variant = 'primary', onClick }) {
    const btn = document.createElement('button');
    
    const variants = {
        primary: 'bg-brand text-white shadow-premium hover:scale-[1.02] active:scale-[0.98]',
        secondary: 'bg-white/5 text-text-dim hover:bg-white/10'
    };

    btn.className = `px-4 py-2 rounded-lg text-xs font-bold transition-all ${variants[variant]}`;
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    
    return btn;
}

// src/components/ui/atoms/Input.js
export function createInput({ label, value, onChange }) {
    const container = document.createElement('div');
    container.className = 'flex flex-col space-y-1';
    
    const labelEl = document.createElement('label');
    labelEl.className = 'text-[10px] uppercase tracking-widest text-text-dim ml-1 font-bold';
    labelEl.textContent = label;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.className = 'bg-white/5 border border-white/10 rounded-md p-2 text-xs font-mono outline-none focus:border-brand focus:bg-white/10 transition-all';
    
    input.addEventListener('input', (e) => onChange(e.target.value));
    
    container.appendChild(labelEl);
    container.appendChild(input);
    
    return { container, input };
}
