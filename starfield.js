/* ===========================================================
   STAR FIELD BACKGROUND
   Lightweight, capped-count falling stars for ambient effect.
   Pure DOM + CSS animation — no canvas needed for this density.
   =========================================================== */

(function () {
  const FIELD_ID = "star-field";
  const MAX_STARS = 18;          // cap so it never taxes low-end phones
  const SPAWN_INTERVAL_MS = 650;
  const COLORS = ["#ff8fab", "#ffc857", "#c9a9e9", "#ff6b95"];

  function starSVG(color, size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
      <path d="M12 0 L14.6 8.4 L23.5 8.4 L16.3 13.6 L18.9 22 L12 16.8 L5.1 22 L7.7 13.6 L0.5 8.4 L9.4 8.4 Z"/>
    </svg>`;
  }

  function spawnStar(field) {
    if (field.childElementCount >= MAX_STARS) return;

    const el = document.createElement("div");
    el.className = "bg-star";

    const size = 8 + Math.random() * 14;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const left = Math.random() * 100;
    const duration = 6 + Math.random() * 5;
    const drift = (Math.random() * 80 - 40).toFixed(0) + "px";
    const spin = (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 200) + "deg";

    el.style.left = left + "vw";
    el.style.setProperty("--drift", drift);
    el.style.setProperty("--spin", spin);
    el.style.animationDuration = duration + "s";
    el.innerHTML = starSVG(color, size);

    el.addEventListener("animationend", () => el.remove());
    field.appendChild(el);
  }

  function init() {
    const field = document.getElementById(FIELD_ID);
    if (!field) return;

    // seed a few immediately so the screen isn't empty on load
    for (let i = 0; i < 6; i++) {
      setTimeout(() => spawnStar(field), i * 180);
    }

    setInterval(() => spawnStar(field), SPAWN_INTERVAL_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
