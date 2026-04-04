import studioStyles from '../../style.css?inline';
import { createInspectorPanel } from '../ui/organisms/Inspector';
import { createLayoutSection } from '../ui/molecules/LayoutSection';
import { createTypographySection } from '../ui/molecules/TypographySection';
import { createVisualsSection } from '../ui/molecules/VisualsSection';

export function createStudio(shadowRoot, handlers, options = {}) {
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(studioStyles);
  shadowRoot.adoptedStyleSheets = [styleSheet];

  const panel = createInspectorPanel({
    ...handlers,
    mode: options.mode ?? 'sidepanel',
    onStyleChange: (prop, value) => {
      if (handlers.onStyleChange) {
        handlers.onStyleChange(prop, value);
      }
    }
  });

  shadowRoot.appendChild(panel.element);

  return {
    setSelection(selection) {
      panel.setSelection(selection);
      
      const properties = panel.element.querySelector('#inspector-properties');
      properties.innerHTML = ''; // Clear old sections
      
      if (selection) {
        const layoutSection = createLayoutSection({
          initialStyles: selection.styles || {},
          onStyleChange: (prop, value) => {
             if (handlers.onStyleChange) handlers.onStyleChange(prop, value);
          }
        });
        
        const typoSection = createTypographySection({
          initialStyles: selection.styles || {},
          onStyleChange: (prop, value) => {
             if (handlers.onStyleChange) handlers.onStyleChange(prop, value);
          }
        });

        const visualsSection = createVisualsSection({
          initialStyles: selection.styles || {},
          onStyleChange: (prop, value) => {
             if (handlers.onStyleChange) handlers.onStyleChange(prop, value);
          }
        });

        properties.appendChild(layoutSection);
        properties.appendChild(typoSection);
        properties.appendChild(visualsSection);
      }
    },
    setInspecting(isInspecting) {
      panel.setInspecting(isInspecting);
    },
  };
}

export function updateViewportStatus(container, width) {
  void container;
  void width;
}
