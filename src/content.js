// src/content.js - Final Integration
import { createStudio, updateViewportStatus } from './components/studio/Studio';

let studioInstance = null;
let shadowRoot = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'INIT_STUDIO') {
    initVisualEditor();
  }
});

function initVisualEditor() {
  if (studioInstance) return;

  const container = document.createElement('div');
  container.id = 'antigravity-editor-root';
  document.body.appendChild(container);

  shadowRoot = container.attachShadow({ mode: 'open' });
  studioInstance = createStudio(shadowRoot);
}

/**
 * Handle Viewport Changes for Responsive Editing logic
 */
window.addEventListener('resize', () => {
    if (studioInstance && shadowRoot) {
        updateViewportStatus(studioInstance, window.innerWidth);
    }
});
