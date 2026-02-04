(function () {
  const HIGHLIGHT_CLASS = "wdc-highlight";

  function highlight(query) {
    clearHighlights();
    if (!query) return 0;

    const matches = window.WDC.findText(query);
    let count = 0;

    for (const { node, index } of matches) {
      const text = node.nodeValue;
      const before = text.substring(0, index);
      const match = text.substring(index, index + query.length);
      const after = text.substring(index + query.length);

      const span = document.createElement("span");
      span.className = HIGHLIGHT_CLASS;
      span.style.backgroundColor = "#ffeb3b";
      span.style.color = "#000";
      span.style.padding = "0 1px";
      span.style.borderRadius = "2px";
      span.textContent = match;

      const parent = node.parentNode;
      const frag = document.createDocumentFragment();
      if (before) frag.appendChild(document.createTextNode(before));
      frag.appendChild(span);
      if (after) frag.appendChild(document.createTextNode(after));
      parent.replaceChild(frag, node);
      count++;
    }

    return count;
  }

  function clearHighlights() {
    const highlights = document.querySelectorAll("." + HIGHLIGHT_CLASS);
    highlights.forEach((el) => {
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "HIGHLIGHT") {
      const count = highlight(message.query);
      sendResponse({ count });
    } else if (message.type === "CLEAR_HIGHLIGHTS") {
      clearHighlights();
      sendResponse({ ok: true });
    }
    return true;
  });

  window.WDC.cleanup = function () {
    clearHighlights();
  };
})();
