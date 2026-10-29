document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Store Inventory Setup ---
  const storeItems = [
    { icon: "✦", name: "Phoenix Ember Wand", description: "Willow and silver-thread core. Warm to the touch.", price: 89 },
    { icon: "☾", name: "Moonlit Quill Set", description: "Ink that glows faintly after midnight.", price: 34 },
    { icon: "✧", name: "Starlight Lantern", description: "Burns bright without flame or fuel.", price: 52 },
    { icon: "⚗", name: "Potion Vial Trio", description: "Hand-blown glass with cork stoppers.", price: 41 },
    { icon: "✶", name: "Enchanted Star Map", description: "The constellations move as you read.", price: 27 },
    { icon: "❖", name: "Raven-wing Cloak Pin", description: "Pewter clasp for travelling cloaks.", price: 19 }
  ];

  const productGrid = document.getElementById("grid");
  const cartCountElement = document.getElementById("count");
  let itemsInCart = 0;

  // Render products to the page
  storeItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="ico">${item.icon}</div>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="price">
        <span>$${item.price}</span>
        <button class="add-to-cart-btn">Add to satchel</button>
      </div>
    `;

    // Handle 'Add to cart' clicks
    const addToCartBtn = card.querySelector(".add-to-cart-btn");
    addToCartBtn.addEventListener("click", () => {
      itemsInCart++;
      cartCountElement.textContent = itemsInCart;
      
      // Trigger a particle burst in the center of the screen
      createBurst(window.innerWidth / 2, window.innerHeight / 2, 30);
    });

    productGrid.appendChild(card);
  });

  // --- 2. Contact Form Logic ---
  const sendButton = document.getElementById("send-button");
  const formStatus = document.getElementById("form-status");
  const nameInput = document.getElementById("guest-name");

  sendButton.addEventListener("click", () => {
    if (nameInput.value.trim() !== "") {
      formStatus.textContent = "Your owl is on its way. ✦";
    } else {
      formStatus.textContent = "Please sign your name first.";
    }
  });

  // --- 3. Magic Cursor & Visual Effects ---
  const rootElement = document.documentElement;
  const cursorOrb = document.getElementById("orb");
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d");
  
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  
  let canvasWidth, canvasHeight;
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight * 0.4;
  let currentX = targetX;
  let currentY = targetY;
  
  let currentRadius = 200;
  let targetRadius = 200;
  let hasUserMoved = false;
  let lastMoveTime = 0;
  let particles = [];

  // Keep canvas sized to the window
  function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Update target coordinates based on pointer/touch
  function updatePointer(x, y) {
    targetX = x;
    targetY = y;
    hasUserMoved = true;
    lastMoveTime = performance.now();
  }

  window.addEventListener("pointermove", (e) => updatePointer(e.clientX, e.clientY));
  window.addEventListener("touchmove", (e) => updatePointer(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  window.addEventListener("touchstart", (e) => updatePointer(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

  // Expand the light radius and create a burst on click
  window.addEventListener("pointerdown", (e) => {
    targetRadius = 360;
    createBurst(e.clientX, e.clientY, 40);
  });
  
  window.addEventListener("pointerup", () => {
    targetRadius = 200;
  });

  // Generate particle sparkles
  function createBurst(x, y, amount) {
    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x: x,
        y: y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: 1,
        color: Math.random() < 0.5 ? "255, 214, 130" : "255, 245, 220"
      });
    }
  }

  // Main animation loop
  function animate(timestamp) {
    // Idle wandering animation if user hasn't moved the mouse recently
    if (!hasUserMoved || timestamp - lastMoveTime > 4000) {
      targetX = window.innerWidth * (0.5 + 0.35 * Math.sin(timestamp / 1700));
      targetY = window.innerHeight * (0.5 + 0.3 * Math.sin(timestamp / 1100 + 1));
    }

    // Smooth easing towards target positions
    const easing = prefersReducedMotion ? 1 : 0.16;
    currentX += (targetX - currentX) * easing;
    currentY += (targetY - currentY) * easing;
    currentRadius += (targetRadius - currentRadius) * 0.1;

    // Update CSS variables for the spotlight masking effect
    rootElement.style.setProperty("--x", `${currentX}px`);
    rootElement.style.setProperty("--y", `${currentY}px`);
    rootElement.style.setProperty("--r", `${currentRadius}px`);
    
    // Move the glowing orb
    cursorOrb.style.transform = `translate(${currentX}px, ${currentY}px)`;

    // Handle canvas particles (skip if reduced motion is enabled)
    if (!prefersReducedMotion) {
      // Add a faint trail particle
      particles.push({
        x: currentX + (Math.random() - 0.5) * 10,
        y: currentY + (Math.random() - 0.5) * 10,
        velocityX: (Math.random() - 0.5) * 0.8,
        velocityY: Math.random() * 0.8 + 0.2, // Drift downwards
        life: 1,
        color: "255, 214, 130"
      });

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Update and draw all active particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.life -= 0.018;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(${p.color}, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1 + p.life * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    requestAnimationFrame(animate);
  }

  // Start the loop
  requestAnimationFrame(animate);
});
