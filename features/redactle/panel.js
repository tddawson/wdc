(function () {
  const guessInput = document.getElementById("guessInput");
  const revealBtn = document.getElementById("reveal-btn");
  const completionPercent = document.getElementById("completionPercent");
  const completionChange = document.getElementById("completionChange");
  const attemptsCount = document.getElementById("attemptsCount");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");

  setItem("redactleAttempts", 0);

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  revealBtn.addEventListener("click", async () => {
    console.log("Reveal word clicked");
    const query = guessInput.value.trim();
    if (!query) return;
    const tab = await getActiveTab();
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "REVEAL_WORD",
      query
    });

    let attempts = getItem("redactleAttempts")
    console.log("Current attempts:", attempts);
    attempts = (attempts || 0) + 1;
    console.log("Updated attempts:", attempts);
    setItem("redactleAttempts", attempts);
    attemptsCount.textContent = attempts;
    ;

    const hitContainer = document.getElementById("hitContainer");
    const template = document.createElement('template');
    countText = `${response.count} hit${response.count === 1 ? "" : "s"}`;
    template.innerHTML = hitHTML(query, countText).trim();
    hitContainer.appendChild(template.content.firstChild);




    // result.textContent = `Found ${response.count} hit${response.count === 1 ? "" : "s"}.`;
  });

  // clearBtn.addEventListener("click", async () => {
  //   console.log("Reveal word clicked");
  //   const tab = await getActiveTab();
  //   await chrome.tabs.sendMessage(tab.id, { type: "REVEAL_WORD" });
  //   result.textContent = "Highlights cleared.";
  // });

  guessInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") revealBtn.click();
  });

  function getItem(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  const hitHTML = (query, count) => `<div class="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg"><div class="flex items-center gap-3"><span class="material-symbols-outlined text-primary text-sm">check_circle</span><span class="text-white font-medium">${query}</span></div><span class="text-primary text-xs font-bold">${count}</span></div>`;
})();
