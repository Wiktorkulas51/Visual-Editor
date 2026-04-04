import studioStyles from '../../style.css?inline';
import { createInspectorPanel } from '../ui/organisms/Inspector.js';
import { createLayoutSection } from '../ui/molecules/LayoutSection.js';
import { createTypographySection } from '../ui/molecules/TypographySection.js';
import { createVisualsSection } from '../ui/molecules/VisualsSection.js';
import { createElementActions } from '../ui/molecules/ElementActions.js';

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
  
  let currentElementKey = null;

  return {
    setSelection(selection) {
      panel.setSelection(selection);
      
      const properties = panel.element.querySelector('#inspector-properties');
      properties.innerHTML = ''; // Clear old sections
      
      const newKey = selection ? `${selection.tagName}-${selection.label}` : null;
      currentElementKey = newKey;
      
      if (selection) {
        const elementActions = createElementActions({
          onAction: (id) => {
            if (handlers.onElementAction) handlers.onElementAction(id);
          }
        });

        const layoutSection = createLayoutSection({
          initialStyles: selection.styles || {},
          onStyleChange: (prop, value) => {
             if (handlers.onStyleChange) handlers.onStyleChange(prop, value);
          }
        });
        
        const typoSection = createTypographySection({
          tagName: selection.tagName,
          initialStyles: selection.styles || {},
          onStyleChange: (prop, value) => {
             if (handlers.onStyleChange) handlers.onStyleChange(prop, value);
          },
          onTagChange: (tagName) => {
             if (handlers.onTagChange) handlers.onTagChange(tagName);
          }
        });

        const visualsSection = createVisualsSection({
          selection: selection,
          initialStyles: selection.styles || {},
          onStyleChange: (prop, value) => {
             if (handlers.onStyleChange) handlers.onStyleChange(prop, value);
          }
        });

        properties.appendChild(elementActions);
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
