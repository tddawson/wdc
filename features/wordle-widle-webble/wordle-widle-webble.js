(function () {
  let wordIdCounter = 0;

  const addStyles = () => {
    if (this.styleElement) return;

    this.styleElement = document.createElement("style");
    this.styleElement.id = "wordle-mode-style";
    this.styleElement.textContent = `
      .word-wrapper {
        display: inline-block;
        cursor: pointer;
        margin-right: 3px;
      }
      .letter-wrapper {
        background-color: white !important;
        color: white !important;
        border: 1px solid #d1d5db !important;
        display: inline-block;
        min-width: 1em;
        text-align: center;
        margin-right: 1px;
        font-family: monospace;
        user-select: none;
        border-radius: 3px;
        text-shadow: none !important;
      }
      .letter-wrapper.correct {
        background-color: #22c55e !important;
        border-color: #22c55e !important;
        color: white !important;
      }
      .letter-wrapper.present {
        background-color: #eab308 !important;
        border-color: #eab308 !important;
        color: white !important;
      }
      .letter-wrapper.absent {
        background-color: #6b7280 !important;
        border-color: #6b7280 !important;
        color: white !important;
      }
      .word-wrapper.won .letter-wrapper {
        background-color: #22c55e !important;
        border-color: #22c55e !important;
        color: white !important;
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

    const parts = text.split(/(\s+)/);

    for (const part of parts) {
      if (part.match(/\s+/)) {
        container.appendChild(document.createTextNode(part));
      } else if (part) {
        const cleanWord = part.replace(/[^a-zA-Z]/g, "").toUpperCase();
        if (!cleanWord) {
          container.appendChild(document.createTextNode(part));
          continue;
        }

        const wordId = `word-${wordIdCounter++}`;
        const wordSpan = document.createElement("span");
        wordSpan.className = "word-wrapper";
        wordSpan.dataset.wordId = wordId;
        wordSpan.dataset.word = cleanWord;
        wordSpan.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          chrome.runtime.sendMessage({
            type: "WORD_SELECTED",
            wordId,
            word: cleanWord,
          });
        };
        wrapLetters(part, wordSpan);
        container.appendChild(wordSpan);
      }
    }

    return container;
  };

  const getResults = (guess, target) => {
    const targetLetters = target.split("");
    const results = new Array(guess.length).fill("absent");

    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === targetLetters[i]) {
        results[i] = "correct";
        targetLetters[i] = null;
      }
    }

    for (let i = 0; i < guess.length; i++) {
      if (results[i] === "correct") continue;
      const idx = targetLetters.indexOf(guess[i]);
      if (idx !== -1) {
        results[i] = "present";
        targetLetters[idx] = null;
      }
    }

    return results;
  };

  const updateWordState = (wordId, targetWord, lastGuess, won) => {
    const wrapper = document.querySelector(
      `.word-wrapper[data-word-id="${wordId}"]`,
    );
    if (!wrapper) return;

    const letters = wrapper.querySelectorAll(".letter-wrapper");

    // Reset classes
    letters.forEach((letter) => {
      letter.classList.remove("correct", "present", "absent");
    });
    wrapper.classList.remove("won");

    if (won) {
      wrapper.classList.add("won");
      // Show the actual word when won
      letters.forEach((letter, i) => {
        letter.textContent = targetWord[i] || "";
      });
      return;
    }

    if (!lastGuess) return;

    // Show the last guess with its colors
    const results = getResults(lastGuess, targetWord);

    letters.forEach((letter, i) => {
      letter.textContent = lastGuess[i] || "";
      if (results[i]) {
        letter.classList.add(results[i]);
      }
    });
  };

  const initialize = () => {
    window.WDC.replaceTextNodes(document.body, wrapLettersAndWords);
    addStyles();
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "WORDLE") {
      initialize();
      sendResponse({ ok: true });
      return true;
    }

    if (message.type === "WORD_STATE_UPDATE") {
      updateWordState(
        message.wordId,
        message.word,
        message.lastGuess,
        message.won,
      );
      sendResponse({ ok: true });
      return true;
    }

    sendResponse({ ok: false, message });
    return true;
  });

  initialize();

  window.WDC.cleanup = function () {
    location.reload();
  };
})();
