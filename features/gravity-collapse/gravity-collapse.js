(function () {
  let engine;
  let render;
  let runner;
  let elementsWithPhysics = [];
  let isGravityActive = false;
  let gravityDirection = "down";
  let gravityStrength = 9.8; // Default scale
  let bounciness = 0.75;
  let magnetEnabled = false;

  // Ensure Matter.js is loaded
  const loadMatter = () => {
    return new Promise((resolve, reject) => {
      if (typeof Matter !== "undefined") {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const initPhysics = async () => {
    await loadMatter();

    const {
      Engine,
      Render,
      Runner,
      World,
      Bodies,
      Composite,
      Mouse,
      MouseConstraint,
      Events,
      Body,
      Vector,
    } = Matter;

    // Cleanup existing if any
    if (engine) {
      World.clear(engine.world);
      Engine.clear(engine);
      if (render) {
        Render.stop(render);
        render.canvas.remove();
        render.canvas = null;
        render.context = null;
        render.textures = {};
      }
      if (runner) {
        Runner.stop(runner);
      }
    }

    engine = Engine.create();
    // Set initial gravity
    updateGravity();

    // Create renderer (off-screen or transparent overlay for debugging, but here we drive DOM)
    // We won't use Matter.Render to draw, but we can use it for debugging if needed.
    // Actually, we usually don't need Render for DOM manipulation, just the Engine and Runner.
    // But let's keep it minimal.

    const width = window.innerWidth;
    const height = window.innerHeight;

    // We need boundaries
    const walls = [
      Bodies.rectangle(width / 2, -50, width, 100, { isStatic: true }), // Top
      Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true }), // Bottom
      Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true }), // Right
      Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true }), // Left
    ];
    World.add(engine.world, walls);

    // Add mouse control for magnet
    const mouse = Mouse.create(document.body);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });
    // Disable mouse constraint by default until magnet is active
    mouseConstraint.constraint.stiffness = 0;
    World.add(engine.world, mouseConstraint);

    // Store reference to update magnet
    engine.mouseConstraint = mouseConstraint;

    runner = Runner.create();
    Runner.run(runner, engine);

    // Custom update loop for DOM
    Events.on(engine, "afterUpdate", updateDOM);
  };

  const createPhysicsBodies = () => {
    const { Bodies, World } = Matter;
    const elements = window.WDC.getVisibleElements();

    // Limit element count for performance
    const maxElements = 100;
    const selectedElements = elements.slice(0, maxElements);

    elementsWithPhysics = selectedElements.map((el) => {
      const { rect, originalPosition } = window.WDC.getElementMetrics(el);

      // Create body
      const body = Bodies.rectangle(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        rect.width,
        rect.height,
        {
          restitution: bounciness,
          friction: 0.1,
          frictionAir: 0.01,
        },
      );

      // Apply styles to element to make it movable
      el.style.position = "fixed";
      el.style.left = "0";
      el.style.top = "0";
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      el.style.zIndex = "9999";
      el.style.transformOrigin = "50% 50%";
      el.dataset.originalTransform = originalPosition.transform || "";

      World.add(engine.world, body);

      return {
        element: el,
        body: body,
        originalPosition: originalPosition,
      };
    });
  };

  const updateDOM = () => {
    if (!elementsWithPhysics.length) return;

    elementsWithPhysics.forEach(({ element, body }) => {
      const { x, y } = body.position;
      const angle = body.angle;

      element.style.transform = `translate(${x - body.bounds.max.x + (body.bounds.max.x - body.bounds.min.x) / 2}px, ${y - body.bounds.max.y + (body.bounds.max.y - body.bounds.min.y) / 2}px) rotate(${angle}rad)`;

      // Correct translation:
      // Matter.js body.position is center of mass (usually geometric center for rectangles).
      // CSS translate(x, y) with top/left=0 puts the top-left corner at (x,y).
      // So we need to translate to (body.x - width/2, body.y - height/2).

      const width = body.bounds.max.x - body.bounds.min.x;
      const height = body.bounds.max.y - body.bounds.min.y;

      const xPos = x - width / 2;
      const yPos = y - height / 2;

      element.style.transform = `translate(${xPos}px, ${yPos}px) rotate(${angle}rad)`;
    });
  };

  const updateGravity = () => {
    if (!engine) return;

    const gravityScale = gravityStrength / 9.8; // Normalize around 9.8

    engine.gravity.scale = 0.001 * gravityScale;

    switch (gravityDirection) {
      case "down":
        engine.gravity.x = 0;
        engine.gravity.y = 1;
        break;
      case "up":
        engine.gravity.x = 0;
        engine.gravity.y = -1;
        break;
      case "left":
        engine.gravity.x = -1;
        engine.gravity.y = 0;
        break;
      case "right":
        engine.gravity.x = 1;
        engine.gravity.y = 0;
        break;
    }
  };

  const updateBounciness = () => {
    if (!elementsWithPhysics) return;
    elementsWithPhysics.forEach((item) => {
      item.body.restitution = bounciness;
    });
  };

  const shakePage = () => {
    if (!engine) return;
    const { Body } = Matter;

    elementsWithPhysics.forEach(({ body }) => {
      const forceMagnitude = 0.05 * body.mass;
      Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * forceMagnitude,
        y: (Math.random() - 0.5) * forceMagnitude,
      });
    });
  };

  const toggleMagnet = (enabled) => {
    magnetEnabled = enabled;
    if (engine && engine.mouseConstraint) {
      engine.mouseConstraint.constraint.stiffness = enabled ? 0.2 : 0;
    }
  };

  const reset = () => {
    if (engine) {
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    }

    elementsWithPhysics.forEach(({ element, originalPosition }) => {
      element.style.position = originalPosition.position;
      element.style.left = originalPosition.left;
      element.style.top = originalPosition.top;
      element.style.width = "";
      element.style.height = "";
      element.style.zIndex = originalPosition.zIndex;
      element.style.transform = originalPosition.transform;
      element.style.transformOrigin = "";
    });

    elementsWithPhysics = [];
    isGravityActive = false;

    const script = document.querySelector('script[src*="matter.min.js"]');
    if (script) script.remove();
  };

  const handleMessage = async (type, payload) => {
    switch (type) {
      case "ACTIVATE_GRAVITY":
        if (!isGravityActive) {
          await initPhysics();
          createPhysicsBodies();
          isGravityActive = true;
        }
        break;
      case "SET_GRAVITY_DIRECTION":
        gravityDirection = payload;
        updateGravity();
        break;
      case "SET_GRAVITY_STRENGTH":
        gravityStrength = payload;
        updateGravity();
        break;
      case "SET_BOUNCINESS":
        bounciness = payload;
        updateBounciness();
        break;
      case "SHAKE_PAGE":
        shakePage();
        break;
      case "TOGGLE_MAGNET":
        toggleMagnet(payload);
        break;
      case "RESET_GRAVITY":
        reset();
        break;
    }
  };

  // Listen for messages from the side panel (via background/tabs API)
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.onMessage
  ) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      handleMessage(message.type, message.payload);
      sendResponse({ received: true });
    });
  }

  // Message Listener
  window.addEventListener("message", async (event) => {
    // Basic security check (allow same origin)
    // if (event.origin !== window.location.origin) return;

    const { type, payload } = event.data;
    handleMessage(type, payload);
  });
})();
