importScripts("features/registry.js");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_FEATURES") {
    sendResponse({ features: FEATURES });
    return true;
  }

  if (message.type === "ACTIVATE_FEATURE") {
    handleActivateFeature(message.featureId, message.tabId)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  if (message.type === "DEACTIVATE_FEATURE") {
    handleDeactivateFeature(message.tabId)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true;
  }
});

async function handleActivateFeature(featureId, tabId) {
  const feature = FEATURES.find((f) => f.id === featureId);
  if (!feature) throw new Error(`Unknown feature: ${featureId}`);

  // Clean up previous feature
  await cleanupContentScripts(tabId);

  // Save active feature
  await chrome.storage.sync.set({ activeFeature: featureId });

  // Inject utils then feature script
  await chrome.scripting.executeScript({
    target: { tabId },
    files: feature.scripts
  });
}

async function handleDeactivateFeature(tabId) {
  await cleanupContentScripts(tabId);
  await chrome.storage.sync.remove("activeFeature");
}

async function cleanupContentScripts(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        if (window.WDC && typeof window.WDC.cleanup === "function") {
          window.WDC.cleanup();
        }
        window.WDC = undefined;
      }
    });
  } catch {
    // Tab may not be scriptable, ignore
  }
}
