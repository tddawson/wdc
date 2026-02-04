(function () {
  // Helper to send message to the content script
  const sendMessage = (type, payload) => {
    // Try sending to parent (iframe scenario)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type, payload }, "*");
    }

    // Try sending via Chrome Runtime (Extension Side Panel scenario)
    if (
      typeof chrome !== "undefined" &&
      chrome.tabs &&
      chrome.tabs.sendMessage
    ) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { type, payload });
        }
      });
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    // Activate immediately on load
    sendMessage("ACTIVATE_GRAVITY");

    // Gravity Direction
    const directionInputs = document.querySelectorAll(
      'input[name="gravity-dir"]',
    );
    directionInputs.forEach((input) => {
      input.addEventListener("change", (e) => {
        if (e.target.checked) {
          sendMessage("SET_GRAVITY_DIRECTION", e.target.value);
        }
      });
    });

    // Gravity Strength
    const strengthInput = document.getElementById("gravity-strength");
    const strengthVal = document.getElementById("gravity-val");

    const sendStrength = window.WDC.debounce((val) => {
      sendMessage("SET_GRAVITY_STRENGTH", parseFloat(val));
    }, 100);

    strengthInput.addEventListener("input", (e) => {
      const val = e.target.value;
      strengthVal.textContent = `${val} m/s²`;
      sendStrength(val);
    });

    // Bounciness
    const bouncinessInput = document.getElementById("bounciness");
    const bouncinessVal = document.getElementById("bounciness-val");

    const sendBounciness = window.WDC.debounce((val) => {
      sendMessage("SET_BOUNCINESS", parseFloat(val));
    }, 100);

    bouncinessInput.addEventListener("input", (e) => {
      const val = e.target.value;
      const percent = Math.round(val * 100);
      bouncinessVal.textContent = `${percent}%`;
      sendBounciness(val);
    });

    // Shake
    const shakeBtn = document.getElementById("shake-btn");
    shakeBtn.addEventListener("click", () => {
      sendMessage("SHAKE_PAGE");
    });

    // Magnet
    const magnetToggle = document.getElementById("magnet-toggle");
    magnetToggle.addEventListener("change", (e) => {
      sendMessage("TOGGLE_MAGNET", e.target.checked);
    });

    // Exit
    const exitBtn = document.getElementById("exit-btn");
    exitBtn.addEventListener("click", () => {
      sendMessage("RESET_GRAVITY");
      // Close panel logic might depend on how it's opened.
      // For now, we assume sending RESET_GRAVITY handles the cleanup on content side.
      // We might want to message the extension background to close the panel,
      // but that's outside the scope of the provided message protocol.
    });

    // Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        // Prevent scrolling if focused on body
        if (e.target === document.body) e.preventDefault();
        sendMessage("SHAKE_PAGE");

        // Visual feedback on button
        shakeBtn.classList.add("active"); // You might want to add styling for this
        setTimeout(() => shakeBtn.classList.remove("active"), 100);
      }
    });
  });
});
