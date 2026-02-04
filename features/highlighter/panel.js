(function () {
  const queryInput = document.getElementById("query");
  const highlightBtn = document.getElementById("highlight-btn");
  const clearBtn = document.getElementById("clear-btn");
  const result = document.getElementById("result");

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  highlightBtn.addEventListener("click", async () => {
    const query = queryInput.value.trim();
    if (!query) return;
    const tab = await getActiveTab();
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "HIGHLIGHT",
      query
    });
    result.textContent = `Found ${response.count} match${response.count === 1 ? "" : "es"}.`;
  });

  clearBtn.addEventListener("click", async () => {
    const tab = await getActiveTab();
    await chrome.tabs.sendMessage(tab.id, { type: "CLEAR_HIGHLIGHTS" });
    result.textContent = "Highlights cleared.";
  });

  queryInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") highlightBtn.click();
  });
})();
