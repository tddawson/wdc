(function () {
  const REDACTED_CLASS = "wdc-redacted";
  let initialRedactedCount = 0;

  function getTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim()) nodes.push(node);
    }
    return nodes;
  }

  function redactWords() {
    console.log("Redactle script loaded");
    const words = window.WDC.findUniqueWords();
    console.log(`Found ${words.length} words to redact.`);
    console.log(words);
    const textNodes = getTextNodes(document.body);

    for (const node of textNodes) {
      const text = node.nodeValue;
      // Match words longer than 2 characters
      const parts = text.split(/(\b\w{3,}\b)/g);

      if (parts.length === 1) continue;

      const frag = document.createDocumentFragment();
      for (const part of parts) {
        if (/^\w{3,}$/.test(part)) {
          const span = document.createElement("span");
          span.className = REDACTED_CLASS;
          span.dataset.word = part;
          span.style.backgroundColor = "#000";
          span.style.color = "#000";
          span.style.padding = "0 2px";
          span.style.borderRadius = "2px";
          span.style.userSelect = "none";
          span.textContent = part;
          frag.appendChild(span);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      }
      node.parentNode.replaceChild(frag, node);
    }
  }

  function getRedactedCount() {
    return document.querySelectorAll("." + REDACTED_CLASS).length;
  }

  function revealWord(word) {
    const hits = window.WDC.findText(word);
    console.log("Hits for", word);
    console.log(hits);
    const hitRedactions = hits.map(({ node }) => {
      let el = node.parentNode;
      while (el && !el.classList.contains(REDACTED_CLASS)) {
        el = el.parentNode;
      }
      return el;
    });
    clearRedactions(hitRedactions);
    return { hitCount: hits.length, remainingRedacted: getRedactedCount() };
  }

  function clearAllRedactions() {
    const redacted = document.querySelectorAll("." + REDACTED_CLASS);
    clearRedactions(redacted);
  }

  function clearRedactions(redactions) {
    redactions.forEach((el) => {
      const parent = el.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(el.dataset.word), el);
      parent.normalize();
    });
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message:", message);
    if (message.type === "REVEAL_WORD") {
      console.log("Received REVEAL_WORD message:", message);
      const { hitCount, remainingRedacted } = revealWord(message.query);
      sendResponse({ count: hitCount, remainingRedacted });
    } else if (message.type === "CLEAR_REDACTIONS") {
      clearAllRedactions();
      sendResponse({ ok: true, remainingRedacted: 0 });
    } else if (message.type === "GET_REDACTION_STATS") {
      sendResponse({ initialRedacted: initialRedactedCount, currentRedacted: getRedactedCount() });
    }
    return true;
  });
  

  // Run on enable
  redactWords();
  initialRedactedCount = getRedactedCount();

  // Cleanup on disable
  window.WDC.cleanup = function () {
    clearRedactions();
  };
})();
