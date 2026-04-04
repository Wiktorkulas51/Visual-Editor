import { ACTIONS } from './protocol.js';

const CONTENT_SCRIPT_PATH = 'src/content.js';

export function sendTabMessage(tabId, message, options = {}) {
  return new Promise((resolve) => {
    try {
      chrome.tabs.sendMessage(tabId, message, options, () => {
        resolve(!chrome.runtime.lastError);
      });
    } catch {
      resolve(false);
    }
  });
}

export async function ensureContentScript(tabId) {
  if (!tabId) {
    return false;
  }

  if (await sendTabMessage(tabId, { action: ACTIONS.PING })) {
    return true;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [CONTENT_SCRIPT_PATH],
    });
  } catch {
    return false;
  }

  return sendTabMessage(tabId, { action: ACTIONS.PING });
}
