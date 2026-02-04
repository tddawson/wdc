(function () {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "WORDLE") {
      sendResponse({ ok: true});
    }
    return true;
  });

  window.WDC.cleanup = function () {};
})();
