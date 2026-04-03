import './style.css';
import { ensureContentScript, sendTabMessage } from './utils/content-script.js';

const statusEl = document.querySelector('#page-status');
const launchButton = document.querySelector('#launch-editor');

launchButton?.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    setStatus('No active tab found.', true);
    return;
  }

  setStatus('Launching inspector...');

  if (await ensureContentScript(tab.id)) {
    await sendTabMessage(tab.id, { action: 'INIT_STUDIO' });
    setStatus('Inspector ready.');
    return;
  }

  setStatus('Inspector is unavailable on this page.', true);
});

function setStatus(message, isError = false) {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
  statusEl.classList.toggle('text-brand', !isError);
  statusEl.classList.toggle('text-accent', isError);
}
