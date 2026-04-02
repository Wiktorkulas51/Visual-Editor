// src/main.js - Popup Logic
import './style.css'

document.querySelector('#launch-editor')?.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Visual Feedback for user
  const statusEl = document.querySelector('#page-status');
  if (statusEl) {
    statusEl.textContent = 'Launching Editor...';
    statusEl.classList.add('text-brand');
  }

  // Messaging the content script to initialize the Visual Studio
  chrome.tabs.sendMessage(tab.id, { action: 'INIT_STUDIO' });
});
