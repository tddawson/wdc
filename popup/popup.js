(async function () {
  const list = document.getElementById("feature-list");

  // Get features from registry via background
  const { features } = await chrome.runtime.sendMessage({
    type: "GET_FEATURES",
  });
  // const { activeFeature } = await chrome.storage.sync.get("activeFeature");
  activeFeature = null;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  for (const feature of features) {
    const btn = document.createElement("button");
    btn.className =
      "feature-btn" + (activeFeature === feature.id ? " active" : "");
    btn.innerHTML = `<span class="name">${feature.name}</span><span class="desc">${feature.description}</span>`;
    btn.addEventListener("click", () => handleClick(feature, btn));
    list.appendChild(btn);
  }

  async function handleClick(feature, btn) {
    const isActive = btn.classList.contains("active");

    // Remove active from all buttons
    list
      .querySelectorAll(".feature-btn")
      .forEach((b) => b.classList.remove("active"));

    if (isActive) {
      await chrome.runtime.sendMessage({
        type: "DEACTIVATE_FEATURE",
        tabId: tab.id,
      });
    } else {
      btn.classList.add("active");
      await chrome.runtime.sendMessage({
        type: "ACTIVATE_FEATURE",
        featureId: feature.id,
        tabId: tab.id,
      });
      // Open side panel from popup to preserve user gesture context
      await chrome.sidePanel.open({ windowId: tab.windowId });
    }
  }
})();
