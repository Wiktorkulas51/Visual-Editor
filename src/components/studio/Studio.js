import studioStyles from '../../style.css?inline';
import { createInspectorPanel } from '../ui/organisms/Inspector';

export function createStudio(shadowRoot, handlers) {
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(studioStyles);
  shadowRoot.adoptedStyleSheets = [styleSheet];

  const panel = createInspectorPanel(handlers);
  shadowRoot.appendChild(panel.element);

  return {
    setSelection(selection) {
      panel.setSelection(selection);
    },
    setInspecting(isInspecting) {
      panel.setInspecting(isInspecting);
    },
  };
}

export function updateViewportStatus(container, width) {
  const statusEl = container.querySelector('#viewport-status');
  if (!statusEl) {
    return;
  }

  statusEl.textContent = `${width < 768 ? 'Mobile' : 'Desktop'} ${width}px`;
}
