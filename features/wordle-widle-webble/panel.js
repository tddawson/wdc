(function () {
  const selectedWordsEl = document.getElementById("selected-words");
  const letterGrid = document.getElementById("letter-grid");
  const keyboard = document.getElementById("keyboard");

  const ROWS = 6;

  let targetWord = "";
  let currentRow = 0;
  let currentGuess = "";
  let gameOver = false;
  let cells = [];

  function resetGame() {
    currentRow = 0;
    currentGuess = "";
    gameOver = false;
    cells = [];

    // Reset keyboard colors
    keyboard.querySelectorAll(".key").forEach((key) => {
      key.className =
        "key h-12 w-8 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold transition-colors";
    });
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

    const target = targetWord.toUpperCase();
    const guess = currentGuess.toUpperCase();
    const rowCells = cells[currentRow];

    // Track which target letters have been matched
    const targetLetters = target.split("");
    const results = new Array(guess.length).fill("absent");

    // First pass: find exact matches (green)
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === targetLetters[i]) {
        results[i] = "correct";
        targetLetters[i] = null; // Mark as used
      }
    }

    // Second pass: find present letters (yellow)
    for (let i = 0; i < guess.length; i++) {
      if (results[i] === "correct") continue;

      const idx = targetLetters.indexOf(guess[i]);
      if (idx !== -1) {
        results[i] = "present";
        targetLetters[idx] = null; // Mark as used
      }
    }

    // Apply colors to cells
    for (let i = 0; i < guess.length; i++) {
      const cell = rowCells[i];
      cell.classList.remove("border-gray-300", "border-gray-500");

      if (results[i] === "correct") {
        cell.classList.add("bg-green-500", "text-white", "border-green-500");
      } else if (results[i] === "present") {
        cell.classList.add("bg-yellow-500", "text-white", "border-yellow-500");
      } else {
        cell.classList.add("bg-gray-500", "text-white", "border-gray-500");
      }

      // Update keyboard
      updateKeyboard(guess[i], results[i]);
    }

    // Check win/lose
    if (guess === target) {
      gameOver = true;
      selectedWordsEl.textContent = `You won! Click a new word to play again.`;
      keyboard.classList.add("hidden");
      return;
    }

    currentRow++;
    currentGuess = "";

    if (currentRow >= ROWS) {
      gameOver = true;
      selectedWordsEl.textContent = `Game over! You'll never know the word. Click a new word to try again.`;
      keyboard.classList.add("hidden");
    }
  }

  function updateKeyboard(letter, result) {
    const key = keyboard.querySelector(`[data-key="${letter}"]`);
    if (!key) return;

    // Don't downgrade: correct > present > absent
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

  // Keyboard click handler
  keyboard.addEventListener("click", (e) => {
    const button = e.target.closest("[data-key]");
    if (!button) return;
    handleKey(button.dataset.key);
  });

  // Physical keyboard handler
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

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "WORD_SELECTED") {
      targetWord = message.word.toUpperCase();
      selectedWordsEl.textContent = `Guess the ${targetWord.length}-letter word!`;
      resetGame();
      buildGrid(targetWord.length);
      keyboard.classList.remove("hidden");
    }
  });
})();
