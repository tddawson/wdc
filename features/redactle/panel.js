(function () {
  const guessInput = document.getElementById("guessInput");
  const revealBtn = document.getElementById("reveal-btn");
  const completionPercent = document.getElementById("completionPercent");
  const completionChange = document.getElementById("completionChange");
  const attemptsCount = document.getElementById("attemptsCount");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const giveUpBtn = document.getElementById("give-up-btn");

  setItem("redactleAttempts", 0);

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  // Initialize redaction stats on panel load
  async function initRedactionStats() {
    const tab = await getActiveTab();
    const response = await chrome.tabs.sendMessage(tab.id, { type: "GET_REDACTION_STATS" });
    if (response) {
      setItem("redactleInitialRedacted", response.initialRedacted);
      setItem("redactleCurrentRedacted", response.currentRedacted);
    }
  }
  initRedactionStats();

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

    // Update current redacted count in localStorage
    setItem("redactleCurrentRedacted", response.remainingRedacted);

    const hitContainer = document.getElementById("hitContainer");
    const template = document.createElement('template');
    countText = `${response.count} hit${response.count === 1 ? "" : "s"}`;
    template.innerHTML = hitHTML(query, countText).trim();
    hitContainer.appendChild(template.content.firstChild);

    guessInput.value = "";
    guessInput.focus();

    // Update completion percentage
    const initialRedacted = getItem("redactleInitialRedacted") || 1; // prevent division by zero
    const currentRedacted = getItem("redactleCurrentRedacted") || 0;
    const completion = ((initialRedacted - currentRedacted) / initialRedacted) * 100;
    completionPercent.textContent = `${completion.toFixed(1)}%`;



    // result.textContent = `Found ${response.count} hit${response.count === 1 ? "" : "s"}.`;
  });

  giveUpBtn.addEventListener("click", async () => {
    console.log("Give up clicked");
    const tab = await getActiveTab();
    await chrome.tabs.sendMessage(tab.id, { type: "CLEAR_REDACTIONS" });
    // Reset attempts
    setItem("redactleAttempts", 0);
    attemptsCount.textContent = "0";
    // Set current redacted to 0 (all revealed)
    setItem("redactleCurrentRedacted", 0);
    // Clear history UI
    const hitContainer = document.getElementById("hitContainer");
    hitContainer.innerHTML = "";
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
