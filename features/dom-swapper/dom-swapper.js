(function () {
  const replacements = [];

  function swapText(find, replace) {
    if (!find) return 0;

    const matches = window.WDC.findText(find);
    let count = 0;

    for (const { node, index } of matches) {
      const text = node.nodeValue;
      const before = text.substring(0, index);
      const after = text.substring(index + find.length);
      node.nodeValue = before + replace + after;
      count++;
    }

    if (count > 0) {
      replacements.push({ find, replace, count });
    }

    return count;
  }

  function undoAll() {
    // Reload is the simplest way to undo all text replacements
    location.reload();
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SWAP_TEXT") {
      const count = swapText(message.find, message.replace);
      sendResponse({ count, history: replacements });
    } else if (message.type === "UNDO_SWAPS") {
      undoAll();
      sendResponse({ ok: true });
    }
    return true;
  });

  window.WDC.cleanup = function () {};
})();
