(function () {
  const selectedWordsEl = document.getElementById("selected-words");
  const letterGrid = document.getElementById("letter-grid");

  const ROWS = 6;

  function buildGrid(letterCount) {
    letterGrid.innerHTML = "";

    for (let row = 0; row < ROWS; row++) {
      const rowEl = document.createElement("div");
      rowEl.className = "flex gap-1.5";

      for (let col = 0; col < letterCount; col++) {
        const cell = document.createElement("div");
        cell.className =
          "w-12 h-12 border-2 border-gray-200 flex items-center justify-center text-2xl font-bold rounded";
        rowEl.appendChild(cell);
      }

      letterGrid.appendChild(rowEl);
    }

    letterGrid.classList.remove("hidden");
    letterGrid.classList.add("grid");
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "WORD_SELECTED") {
      selectedWordsEl.textContent = message.word;
      const letterCount = message.word.replace(/[^a-zA-Z]/g, "").length;
      if (letterCount > 0) {
        buildGrid(letterCount);
      }
    }
  });
})();
