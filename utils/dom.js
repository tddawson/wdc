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
   * Returns an array of unique words on the page (case-insensitive).
   */
  function findUniqueWords() {
    const words = findWords();
    const seen = new Set();
    const unique = [];
    for (const word of words) {
      const lower = word.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        unique.push(word);
      }
    }
    return unique;
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

  /**
   * Replace all text nodes under root with new elements.
   * newElCreator is a function that receives the text node and returns a new element.
   */
  function replaceTextNodes(root, newElCreator) {
    const textNodes = getTextNodes(root);
    textNodes.forEach((node) => {
      const replacement = newElCreator(node);
      if (replacement) {
        node.parentNode.replaceChild(replacement, node);
      }
    });
    return textNodes.length;
  }

  const getVisibleElements = () => {
    const selectors = "p, img, h1, h2, h3, h4, h5, h6, li, blockquote, figure";
    const elements = Array.from(document.querySelectorAll(selectors));

    return elements.filter((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      // Check visibility
      if (
        rect.width === 0 ||
        rect.height === 0 ||
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      ) {
        return false;
      }

      // Size constraint - must be reasonably sized
      if (rect.width < 20 || rect.height < 10) {
        return false;
      }

      // Must be in viewport
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        return false;
      }

      // Exclude fixed/sticky
      if (style.position === "fixed" || style.position === "sticky") {
        return false;
      }

      // Skip elements that contain other candidate elements (avoid parent/child duplication)
      if (el.querySelector(selectors)) {
        return false;
      }

      return true;
    });
  };

  const getElementMetrics = (el) => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      rect,
      style,
      originalPosition: {
        top: style.top,
        left: style.left,
        position: style.position,
        transform: style.transform,
        zIndex: style.zIndex,
      },
    };
  };

  window.WDC.getTextNodes = getTextNodes;
  window.WDC.findText = findText;
  window.WDC.findWords = findWords;
  window.WDC.findUniqueWords = findUniqueWords;
  window.WDC.replaceElements = replaceElements;
  window.WDC.replaceTextNodes = replaceTextNodes;
  window.WDC.getVisibleElements = getVisibleElements;
  window.WDC.getElementMetrics = getElementMetrics;
})();
