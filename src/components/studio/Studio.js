import studioStyles from '../../style.css?inline';
import { createInspectorPanel } from '../ui/organisms/Inspector.js';
import { createLayoutSection } from '../ui/molecules/LayoutSection.js';
import { createTypographySection } from '../ui/molecules/TypographySection.js';
import { createVisualsSection } from '../ui/molecules/VisualsSection.js';
import { createStrokeSection } from '../ui/molecules/StrokeSection.js';
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
      if (!selection) {
        panel.setSelection(null);
        const properties = panel.element.querySelector('#inspector-properties');
        properties.innerHTML = '';
        currentElementKey = null;
        return;
      }

      const newKey = `${selection.tagName}-${selection.label}`;
      
      // Update basic panel info (label, rect) regardless of recreation
      panel.setSelection(selection);
      
      if (currentElementKey === newKey) {
        // If it's the same element, we DON'T recreate UI to preserve focus/active tabs/slider positions.
        // The individual sections will be updated by the next fresh selection if user re-selects.
        return;
      }
      
      currentElementKey = newKey;
      const properties = panel.element.querySelector('#inspector-properties');
      properties.innerHTML = ''; // Clear old sections
      
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

        const strokeSection = createStrokeSection({
          initialStyles: selection.styles || {},
          onStyleChange: (prop, value) => {
             if (handlers.onStyleChange) handlers.onStyleChange(prop, value);
          }
        });

        properties.appendChild(elementActions);
        properties.appendChild(layoutSection);
        properties.appendChild(typoSection);
        properties.appendChild(visualsSection);
        properties.appendChild(strokeSection);
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
