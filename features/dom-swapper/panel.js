(function () {
  const findInput = document.getElementById("find");
  const replaceInput = document.getElementById("replace");
  const swapBtn = document.getElementById("swap-btn");
  const undoBtn = document.getElementById("undo-btn");
  const result = document.getElementById("result");

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  swapBtn.addEventListener("click", async () => {
    const find = findInput.value;
    const replace = replaceInput.value;
    if (!find) return;

    const tab = await getActiveTab();
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "SWAP_TEXT",
      find,
      replace
    });
    result.textContent = `Replaced ${response.count} occurrence${response.count === 1 ? "" : "s"}.`;
  });

  undoBtn.addEventListener("click", async () => {
    const tab = await getActiveTab();
    await chrome.tabs.sendMessage(tab.id, { type: "UNDO_SWAPS" });
    result.textContent = "Page reloaded to undo changes.";
  });
})();
