// Finalizing Studio.js with Atoms and Logic
import studioStyles from '../../style.css?inline';
import { createButton, createInput } from '../ui/atoms/Atoms';

export function createStudio(shadowRoot) {
  // Inject Tailwind Styles
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(studioStyles);
  shadowRoot.adoptedStyleSheets = [styleSheet];

  const studioContainer = document.createElement('div');
  studioContainer.className = 'fixed top-4 right-4 z-[2147483647] flex h-[600px] w-[320px] flex-col overflow-hidden glass rounded-3xl shadow-premium animate-in slide-in-from-right fade-in duration-500';
  
  // Header
  const header = document.createElement('header');
  header.className = 'flex items-center justify-between p-5 border-b border-white/5';
  header.innerHTML = `
      <div class="flex items-center space-x-2">
          <div class="h-3 w-3 rounded-full bg-brand shadow-premium"></div>
          <span class="text-sm font-bold tracking-tight">Antigravity Studio</span>
      </div>
      <div id="viewport-status" class="px-2 py-1 rounded-md bg-brand/10 text-[9px] font-mono tracking-tighter text-brand uppercase border border-brand/20">
          Desktop ${window.innerWidth}px
      </div>
  `;

  // Editor Content
  const main = document.createElement('main');
  main.className = 'flex-grow overflow-y-auto p-5 space-y-6';

  // Section: Global Styles (Example Control)
  const globalSection = document.createElement('div');
  globalSection.className = 'space-y-4';
  
  const bgInput = createInput({
      label: 'Main Background Color',
      value: '#ffffff',
      onChange: (val) => {
          injectLiveCSS(`body { background-color: ${val} !important; }`);
      }
  });

  globalSection.appendChild(bgInput.container);
  main.appendChild(globalSection);

  // Footer
  const footer = document.createElement('footer');
  footer.className = 'p-4 border-t border-white/5 bg-black/20 flex items-center justify-between';
  
  const closeBtn = createButton({ label: 'Exit Studio', variant: 'secondary', onClick: () => {
    document.querySelector('#antigravity-editor-root')?.remove();
  }});
  
  const saveBtn = createButton({ label: 'Save Changes', variant: 'primary', onClick: () => {
    console.log('Saved to storage (mock)');
  }});

  footer.appendChild(closeBtn);
  footer.appendChild(saveBtn);

  studioContainer.appendChild(header);
  studioContainer.appendChild(main);
  studioContainer.appendChild(footer);

  shadowRoot.appendChild(studioContainer);
  return studioContainer;
}

/**
 * The Real Magic: Live CSS Injection into the host page
 */
function injectLiveCSS(css) {
    let styleEl = document.querySelector('#antigravity-live-injection');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'antigravity-live-injection';
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
}

export function updateViewportStatus(container, width) {
    const statusEl = container.querySelector('#viewport-status');
    if (!statusEl) return;
    statusEl.textContent = `${width < 768 ? 'Mobile' : 'Desktop'} ${width}px`;
}
