(function () {
  const selectedWordsEl = document.getElementById("selected-words");
  const letterGrid = document.getElementById("letter-grid");
  const keyboard = document.getElementById("keyboard");

  const ROWS = 6;
  const STORAGE_KEY = "wordle_game_states";

  let currentWordId = "";
  let targetWord = "";
  let currentRow = 0;
  let currentGuess = "";
  let gameOver = false;
  let won = false;
  let cells = [];
  let guesses = [];

  async function loadGameState(wordId) {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    const states = data[STORAGE_KEY] || {};
    return states[wordId] || null;
  }

  async function saveGameState() {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    const states = data[STORAGE_KEY] || {};
    states[currentWordId] = { word: targetWord, guesses, gameOver, won };
    await chrome.storage.local.set({ [STORAGE_KEY]: states });
    sendStateToPage();
  }

  async function sendStateToPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;
      chrome.tabs.sendMessage(tab.id, {
        type: "WORD_STATE_UPDATE",
        wordId: currentWordId,
        word: targetWord,
        lastGuess,
        won,
      });
    }
  }

  function resetGame() {
    currentRow = 0;
    currentGuess = "";
    gameOver = false;
    won = false;
    cells = [];
    guesses = [];

    keyboard.querySelectorAll(".key").forEach((key) => {
      key.className =
        "key h-12 w-8 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold transition-colors";
    });
  }

  function getResults(guess, target) {
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
  }

  function applyResultsToRow(rowIndex, guess, results) {
    const rowCells = cells[rowIndex];
    if (!rowCells) return;

    for (let i = 0; i < guess.length; i++) {
      const cell = rowCells[i];
      cell.textContent = guess[i];
      cell.classList.remove("border-gray-300", "border-gray-500");

      if (results[i] === "correct") {
        cell.classList.add("bg-green-500", "text-white", "border-green-500");
      } else if (results[i] === "present") {
        cell.classList.add("bg-yellow-500", "text-white", "border-yellow-500");
      } else {
        cell.classList.add("bg-gray-500", "text-white", "border-gray-500");
      }

      updateKeyboard(guess[i], results[i]);
    }
  }

  function restoreState(state) {
    guesses = state.guesses || [];
    gameOver = state.gameOver || false;
    won = state.won || false;
    currentRow = guesses.length;

    for (let i = 0; i < guesses.length; i++) {
      const guess = guesses[i];
      const results = getResults(guess, targetWord);
      applyResultsToRow(i, guess, results);
    }

    if (gameOver) {
      keyboard.classList.add("hidden");
      if (won) {
        selectedWordsEl.textContent = `You won! Click a new word to play again.`;
      } else {
        selectedWordsEl.textContent = `Game over! You'll never know the word. Click a new word to try again.`;
      }
    }

    // Update the main page with the last guess
    sendStateToPage();
  }

  function buildGrid(letterCount) {
    letterGrid.innerHTML = "";
    cells = [];

    for (let row = 0; row < ROWS; row++) {
      const rowEl = document.createElement("div");
      rowEl.className = "flex gap-1.5";
      const rowCells = [];

      for (let col = 0; col < letterCount; col++) {
        const cell = document.createElement("div");
        cell.className =
          "w-10 h-10 border-2 border-gray-300 flex items-center justify-center text-xl font-bold rounded uppercase";
        rowEl.appendChild(cell);
        rowCells.push(cell);
      }

      letterGrid.appendChild(rowEl);
      cells.push(rowCells);
    }

    letterGrid.classList.remove("hidden");
    letterGrid.classList.add("grid");
  }

  function updateCurrentRow() {
    const rowCells = cells[currentRow];
    if (!rowCells) return;

    for (let i = 0; i < rowCells.length; i++) {
      rowCells[i].textContent = currentGuess[i] || "";
      if (currentGuess[i]) {
        rowCells[i].classList.add("border-gray-500");
      } else {
        rowCells[i].classList.remove("border-gray-500");
      }
    }
  }

  function addLetter(letter) {
    if (gameOver || currentGuess.length >= targetWord.length) return;
    currentGuess += letter.toUpperCase();
    updateCurrentRow();
  }

  function removeLetter() {
    if (gameOver || currentGuess.length === 0) return;
    currentGuess = currentGuess.slice(0, -1);
    updateCurrentRow();
  }

  function submitGuess() {
    if (gameOver) return;
    if (currentGuess.length !== targetWord.length) return;

    const guess = currentGuess.toUpperCase();
    const results = getResults(guess, targetWord);

    applyResultsToRow(currentRow, guess, results);
    guesses.push(guess);

    if (guess === targetWord) {
      gameOver = true;
      won = true;
      selectedWordsEl.textContent = `You won! Click a new word to play again.`;
      keyboard.classList.add("hidden");
      saveGameState();
      return;
    }

    currentRow++;
    currentGuess = "";

    if (currentRow >= ROWS) {
      gameOver = true;
      selectedWordsEl.textContent = `Game over! You'll never know the word. Click a new word to try again.`;
      keyboard.classList.add("hidden");
    }

    saveGameState();
  }

  function updateKeyboard(letter, result) {
    const key = keyboard.querySelector(`[data-key="${letter}"]`);
    if (!key) return;

    if (key.classList.contains("bg-green-500")) return;
    if (key.classList.contains("bg-yellow-500") && result !== "correct") return;

    key.classList.remove(
      "bg-gray-200",
      "bg-gray-500",
      "bg-yellow-500",
      "bg-green-500",
      "hover:bg-gray-300",
    );

    if (result === "correct") {
      key.classList.add("bg-green-500", "text-white");
    } else if (result === "present") {
      key.classList.add("bg-yellow-500", "text-white");
    } else {
      key.classList.add("bg-gray-500", "text-white");
    }
  }

  function handleKey(key) {
    if (key === "ENTER") {
      submitGuess();
    } else if (key === "BACKSPACE") {
      removeLetter();
    } else if (/^[A-Z]$/.test(key)) {
      addLetter(key);
    }
  }

  keyboard.addEventListener("click", (e) => {
    const button = e.target.closest("[data-key]");
    if (!button) return;
    handleKey(button.dataset.key);
  });

  document.addEventListener("keydown", (e) => {
    if (!targetWord) return;

    if (e.key === "Enter") {
      handleKey("ENTER");
    } else if (e.key === "Backspace") {
      handleKey("BACKSPACE");
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      handleKey(e.key.toUpperCase());
    }
  });

  chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === "WORD_SELECTED") {
      currentWordId = message.wordId;
      targetWord = message.word.toUpperCase();
      resetGame();
      buildGrid(targetWord.length);

      const savedState = await loadGameState(currentWordId);
      if (savedState) {
        restoreState(savedState);
      } else {
        selectedWordsEl.textContent = `Guess the ${targetWord.length}-letter word!`;
        keyboard.classList.remove("hidden");
      }

      if (!gameOver) {
        keyboard.classList.remove("hidden");
      }
    }
  });
})();
