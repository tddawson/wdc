/**
 * Feature registry — single source of truth for all available features.
 * Used by the popup to generate UI and by the background to know what to inject.
 */
const FEATURES = [
  {
    id: "wordle-widle-webble",
    name: "Wordle Widle Webble",
    description: "A fun word game feature.",
    panelPath: "features/wordle-widle-webble/panel.html",
    scripts: [
      "utils/index.js",
      "utils/dom.js",
      "utils/storage.js",
      "features/wordle-widle-webble/wordle-widle-webble.js",
    ],
  },
  {
    id: "redactle",
    name: "Redactle",
    description: "Redact words on the page to create a guessing game.",
    panelPath: "features/redactle/panel.html",
    scripts: [
      "utils/index.js",
      "utils/dom.js",
      "utils/storage.js",
      "features/redactle/redactle.js",
    ],
  },
  {
    id: "gravity-collapse",
    name: "Gravity Collapse",
    description: "Apply physics and gravity to page elements for chaotic fun.",
    panelPath: "features/gravity-collapse/panel.html",
    scripts: [
      "utils/index.js",
      "utils/dom.js",
      "matter.js",
      "features/gravity-collapse/gravity-collapse.js",
    ],
  },
];
