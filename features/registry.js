/**
 * Feature registry — single source of truth for all available features.
 * Used by the popup to generate UI and by the background to know what to inject.
 */
const FEATURES = [
  {
    id: "highlighter",
    name: "Highlighter",
    description: "Highlight all occurrences of a search term on the page.",
    panelPath: "features/highlighter/panel.html",
    scripts: ["utils/index.js", "utils/dom.js", "utils/storage.js", "features/highlighter/highlighter.js"]
  },
  {
    id: "word-counter",
    name: "Word Counter",
    description: "Count total and unique words on the page.",
    panelPath: "features/word-counter/panel.html",
    scripts: ["utils/index.js", "utils/dom.js", "features/word-counter/word-counter.js"]
  },
  {
    id: "dom-swapper",
    name: "DOM Swapper",
    description: "Find and replace text content on the page.",
    panelPath: "features/dom-swapper/panel.html",
    scripts: ["utils/index.js", "utils/dom.js", "utils/storage.js", "features/dom-swapper/dom-swapper.js"]
  },
  {
    id: "wordle-widle-webble",
    name: "Wordle Widle Webble",
    description: "A fun word game feature.",
    panelPath: "features/wordle-widle-webble/panel.html",
    scripts: ["utils/index.js", "utils/dom.js", "utils/storage.js", "features/wordle-widle-webble/wordle-widle-webble.js"]
  }
];
