(function () {
  window.WDC = window.WDC || {};

  function getItem(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function removeItem(key) {
    localStorage.removeItem(key);
  }

  window.WDC.getItem = getItem;
  window.WDC.setItem = setItem;
  window.WDC.removeItem = removeItem;
})();
