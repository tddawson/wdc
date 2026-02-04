# Jules Prompt: Implement "Gravity Collapse" Game Mode

## Overview

Implement a new game mode called "Gravity Collapse" for the Chrome extension. This mode applies physics-based gravity to DOM elements on any webpage, making them fall and pile up chaotically.

## Feature Requirements

### Core Functionality (gravity-collapse.js)

1. **Physics Engine Integration**
   - Use Matter.js (include via CDN: https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js)
   - Create a physics engine instance on activation
   - Target elements: paragraphs, images, headers (h1-h6), divs with text content, list items

2. **Gravity Simulation**
   - Convert selected DOM elements into physics bodies (rectangles matching their dimensions)
   - Apply gravity in configurable direction (default: down)
   - Elements should fall and pile up at the bottom/side of viewport
   - Elements should collide and stack realistically with bounce/friction

3. **Element Transformation**
   - Preserve original element content/styling
   - Apply CSS transforms to match physics body positions
   - Use `position: fixed` or `absolute` with high z-index to overlay elements
   - Store original positions for potential reset

4. **Controllable Parameters**
   - Gravity strength (default: 9.8 m/s²)
   - Gravity direction (up/down/left/right)
   - Bounciness/restitution (default: 0.75)
   - Friction

5. **Interactive Tools**
   - **Shake**: Apply random forces to all physics bodies to remix the pile
   - **Magnet Tool**: Allow dragging elements with mouse (use Matter.js constraints)
   - Reset/cleanup function to restore original page state

### Side Panel UI (panel.html)

**Design Requirements:** Use the "aside" element design from `.gen/stitch-preview.html` as the template. This includes:

- **Dark theme styling**: Background colors, panels, text styles
- **Typography**: Space Grotesk font family
- **Primary color**: `#1ff968` (bright green)
- **Panel structure**:
  - Header with title "Gravity Collapse" and subtitle "Physics Lab v2.4"
  - Global Controls section
  - Experimental Tools section
  - Navigation footer

**Specific Controls to Implement:**

1. **Gravity Direction Selector** (radio buttons with icons)
   - Four options: Up ⬆, Down ⬇, Left ⬅, Right ➡
   - Icon-based selection with Material Symbols
   - Active state highlighting

2. **Gravity Strength Slider**
   - Range: 0-50 m/s²
   - Display current value
   - Update physics in real-time

3. **Bounciness Slider**
   - Range: 0-100%
   - Display current percentage
   - Update restitution in real-time

4. **Shake Page Button**
   - Large button with vibration icon
   - Keyboard shortcut display (SPACE)
   - Apply random impulses to all bodies

5. **Magnet Tool Toggle**
   - Checkbox/toggle switch
   - When enabled: cursor becomes magnet, click+drag elements
   - Visual indicator when active

6. **Exit Lab Mode Button**
   - Prominent button at bottom
   - Restore original page state and close panel

### Panel Behavior (panel.js)

- Send messages to content script for all controls
- Listen for keyboard shortcuts (SPACE for shake)
- Update slider value displays in real-time
- Handle toggle states and communicate tool activation

### Message Protocol

Implement these message types between panel.js and gravity-collapse.js:

- `ACTIVATE_GRAVITY` - Initialize physics engine
- `SET_GRAVITY_DIRECTION` - Change gravity vector
- `SET_GRAVITY_STRENGTH` - Update gravity value
- `SET_BOUNCINESS` - Update restitution
- `SHAKE_PAGE` - Apply shake effect
- `TOGGLE_MAGNET` - Enable/disable magnet tool
- `RESET_GRAVITY` - Cleanup and restore page

## File Structure

Create these files in the features directory:

```
features/
  gravity-collapse/
    gravity-collapse.js    # Main physics logic
    panel.html             # Styled UI panel (based on .gen/stitch-preview.html aside design)
    panel.js              # Panel controls and messaging
```

## Registry Integration

Add this entry to `features/registry.js`:

```javascript
{
  id: "gravity-collapse",
  name: "Gravity Collapse",
  description: "Apply physics and gravity to page elements for chaotic fun.",
  panelPath: "features/gravity-collapse/panel.html",
  scripts: [
    "utils/index.js",
    "utils/dom.js",
    "features/gravity-collapse/gravity-collapse.js"
  ]
}
```

## Implementation Notes

### Matter.js Setup Pattern

```javascript
const { Engine, Render, World, Bodies, Mouse, MouseConstraint } = Matter;
const engine = Engine.create();
engine.gravity.y = 1; // Configure as needed
```

### Element Selection Strategy

- Query for visible elements with offsetHeight > 20
- Exclude fixed/sticky positioned elements
- Exclude elements inside the side panel
- Prioritize content-heavy elements

### Performance Considerations

- Limit to ~50-100 elements max
- Use `requestAnimationFrame` for position updates
- Debounce slider changes
- Disable physics when panel is closed

### Style Consistency with .gen/stitch-preview.html

The panel.html should replicate:

- Color scheme: `bg-panel-dark`, `text-primary`, `text-text-muted`
- Border styles: `border-white/10`, `border-white/5`
- Button styles: rounded-xl, hover effects, icon+text layout
- Slider styling: custom range inputs with `accent-primary`
- Typography: Bold headings, uppercase labels with tracking
- Material Symbols icons for all controls

## Testing Checklist

- [ ] Physics engine loads without errors
- [ ] Elements fall and collide realistically
- [ ] All direction changes work correctly
- [ ] Sliders update physics parameters smoothly
- [ ] Shake creates visible chaos
- [ ] Magnet tool allows dragging
- [ ] Exit button fully restores original page
- [ ] Panel UI matches design specifications
- [ ] No console errors or memory leaks

## Goal

Create a fun, chaotic experience that destroys page layout in an entertaining way while maintaining smooth performance and an attractive, functional control panel based on the provided design system.
