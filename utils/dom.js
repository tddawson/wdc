(function () {
  window.WDC = window.WDC || {};

  function getTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim()) nodes.push(node);
    }
    return nodes;
  }

  /**
   * Find all text nodes containing the query string (case-insensitive).
   * Returns an array of { node, index } objects.
   */
  function findText(query) {
    if (!query) return [];
    const lower = query.toLowerCase();
    const textNodes = getTextNodes(document.body);
    const results = [];
    for (const node of textNodes) {
      const text = node.nodeValue.toLowerCase();
      let idx = text.indexOf(lower);
      while (idx !== -1) {
        results.push({ node, index: idx });
        idx = text.indexOf(lower, idx + 1);
      }
    }
    return results;
  }

  /**
   * Returns an array of all individual words on the page.
   */
  function findWords() {
    const textNodes = getTextNodes(document.body);
    const words = [];
    for (const node of textNodes) {
      const nodeWords = node.nodeValue.trim().split(/\s+/).filter(Boolean);
      words.push(...nodeWords);
    }
    return words;
  }

  /**
   * Replace all elements matching a CSS selector with a new element.
   * newElCreator is a function that receives the old element and returns a new one.
   */
  function replaceElements(selector, newElCreator) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      const replacement = newElCreator(el);
      if (replacement) {
        el.parentNode.replaceChild(replacement, el);
      }
    });
    return elements.length;
  }

  window.WDC.findText = findText;
  window.WDC.findWords = findWords;
  window.WDC.replaceElements = replaceElements;
})();
