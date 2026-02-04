(function () {
  function countWords() {
    const words = window.WDC.findWords();
    const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
    return {
      total: words.length,
      unique: uniqueWords.size
    };
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "COUNT_WORDS") {
      sendResponse(countWords());
    }
    return true;
  });

  window.WDC.cleanup = function () {};
})();
