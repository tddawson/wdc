/**
 * Side panel helpers — used only in the background service worker.
 */

async function openSidePanel(tabId) {
  await chrome.sidePanel.open({ tabId });
}

async function setPanel(path) {
  await chrome.sidePanel.setOptions({ path });
}
