import studioStyles from '../../style.css?inline';
import { createInspectorPanel } from '../ui/organisms/Inspector';
import { createLayoutSection } from '../ui/molecules/LayoutSection';
import { createTypographySection } from '../ui/molecules/TypographySection';
import { createVisualsSection } from '../ui/molecules/VisualsSection';
import { createElementActions } from '../ui/molecules/ElementActions';

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
      const newKey = selection ? `${selection.tagName}-${selection.label}` : null;

      // Only re-render sections if we actually switched elements
      if (newKey === currentElementKey && selection) {
        return;
      }
      currentElementKey = newKey;
      
      properties.innerHTML = ''; // Clear old sections
      
      if (selection) {
        const elementActions = createElementActions({
          onAction: (id) => {
            if (handlers.onElementAction) handlers.onElementAction(id);
          }
        });
        properties.appendChild(elementActions);

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
