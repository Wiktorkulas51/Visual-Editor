import './style.css';

const statusEl = document.querySelector('#page-status');
const launchButton = document.querySelector('#launch-editor');

launchButton?.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    setStatus('No active tab found.', true);
    return;
  }

  setStatus('Launching inspector...');

  chrome.tabs.sendMessage(tab.id, { action: 'INIT_STUDIO' }, () => {
    if (chrome.runtime.lastError) {
      setStatus('Inspector is unavailable on this page.', true);
      return;
    }

    setStatus('Inspector ready.');
  });
});

function setStatus(message, isError = false) {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
  statusEl.classList.toggle('text-brand', !isError);
  statusEl.classList.toggle('text-accent', isError);
}
