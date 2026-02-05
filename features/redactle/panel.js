(function () {
  const guessInput = document.getElementById("guessInput");
  const revealBtn = document.getElementById("reveal-btn");
  const completionPercent = document.getElementById("completionPercent");
  const completionChange = document.getElementById("completionChange");
  const attemptsCount = document.getElementById("attemptsCount");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const giveUpBtn = document.getElementById("give-up-btn");
  const guesses = new Set();

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
    const query = guessInput.value.trim();
    if (!query) return;
    if (guesses.has(query.toLowerCase())) return; // prevent duplicate guesses
    guesses.add(query.toLowerCase());
    const tab = await getActiveTab();
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "REVEAL_WORD",
      query
    });

    let attempts = getItem("redactleAttempts")
    attempts = (attempts || 0) + 1;
    setItem("redactleAttempts", attempts);
    attemptsCount.textContent = attempts;
    ;

    // Update current redacted count in localStorage
    setItem("redactleCurrentRedacted", response.remainingRedacted);

    const hitContainer = document.getElementById("hitContainer");
    const template = document.createElement('template');
    countText = `${response.count} hit${response.count === 1 ? "" : "s"}`;
    template.innerHTML = hitHTML(query, countText).trim();
    hitContainer.prepend(template.content.firstChild);

    guessInput.value = "";
    guessInput.focus();

    // Update completion percentage
    const initialRedacted = getItem("redactleInitialRedacted") || 1; // prevent division by zero
    const currentRedacted = getItem("redactleCurrentRedacted") || 0;
    const completion = ((initialRedacted - currentRedacted) / initialRedacted) * 100;
    completionPercent.textContent = `${completion.toFixed(1)}%`;
  });

  giveUpBtn.addEventListener("click", async () => {
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
