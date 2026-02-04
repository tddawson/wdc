(function () {
  const countBtn = document.getElementById("count-btn");
  const totalEl = document.getElementById("total");
  const uniqueEl = document.getElementById("unique");

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  countBtn.addEventListener("click", async () => {
    const tab = await getActiveTab();
    const response = await chrome.tabs.sendMessage(tab.id, { type: "COUNT_WORDS" });
    totalEl.textContent = response.total.toLocaleString();
    uniqueEl.textContent = response.unique.toLocaleString();
  });
})();
