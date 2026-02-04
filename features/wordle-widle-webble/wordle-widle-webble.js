(function () {
  const addStyles = () => {
    if (this.styleElement) return;

    this.styleElement = document.createElement("style");
    this.styleElement.id = "wordle-mode-style";
    this.styleElement.textContent = `
      .word-wrapper {
        display: inline-block;
      }
      .letter-wrapper {
        background-color: white !important;
        color: white !important;
        border: 1px solid black !important;
        display: inline-block;
        min-width: 1em;
        text-align: center;
        margin-right: 1px;
        font-family: monospace;
        user-select: none;
      }
    `;
    document.head.appendChild(this.styleElement);
  };

  const wrapLetters = (word, container) => {
    for (const char of word) {
      if (char.match(/[a-zA-Z]/)) {
        const letterSpan = document.createElement("span");
        letterSpan.className = "letter-wrapper";
        letterSpan.textContent = char;
        container.appendChild(letterSpan);
      } else {
        container.appendChild(document.createTextNode(char));
      }
    }
  };

  const wrapLettersAndWords = (textNode) => {
    const text = textNode.nodeValue;
    const container = document.createElement("span");

    // Split into words and whitespace, preserving both
    const parts = text.split(/(\s+)/);

    for (const part of parts) {
      if (part.match(/\s+/)) {
        container.appendChild(document.createTextNode(part));
      } else if (part) {
        const wordSpan = document.createElement("span");
        wordSpan.className = "word-wrapper";
        wordSpan.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          const cleanWord = part.replace(/[^a-zA-Z]/g, "");
          chrome.runtime.sendMessage({ type: "WORD_SELECTED", word: cleanWord });
        };
        wrapLetters(part, wordSpan);
        container.appendChild(wordSpan);
      }
    }

    return container;
  };

  const initialize = () => {
    window.WDC.replaceTextNodes(document.body, wrapLettersAndWords);
    addStyles();
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("received message", message);
    if (message.type === "WORDLE") {
      initialize();
      sendResponse({ ok: true });
    }
    sendResponse({ ok: false, message });
    return true;
  });

  initialize();

  window.WDC.cleanup = function () {};
})();
