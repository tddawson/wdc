(function () {
  // Inline debounce since WDC isn't available in panel context
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Helper to send message to the content script
  const sendMessage = async (type, payload) => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { type, payload });
      }
    }
  };

  // Activate immediately on load
  sendMessage("ACTIVATE_GRAVITY");

  // Gravity Direction
  const directionInputs = document.querySelectorAll('input[name="gravity-dir"]');
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

  const sendStrength = debounce((val) => {
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

  const sendBounciness = debounce((val) => {
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
  });

  // Keyboard Shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      if (e.target === document.body) e.preventDefault();
      sendMessage("SHAKE_PAGE");
    }
  });
})();
