/* ===========================================================
   STARFIELD BACKGROUND ANIMATION
   Smooth, lightweight falling sakura pink stars canvas background
   =========================================================== */

class Starfield {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.stars = [];
    this.numStars = window.innerWidth < 600 ? 45 : 85;
    this.animId = null;

    this.init();
    window.addEventListener("resize", () => this.resize());
  }

  init() {
    this.resize();
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push(this.createStar(true));
    }
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createStar(randomY = false) {
    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : -10,
      size: Math.random() * 2.8 + 0.8,
      speed: Math.random() * 0.7 + 0.2,
      opacity: Math.random() * 0.75 + 0.25,
      twinkle: Math.random() * 0.02,
      twinkleDir: 1
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      
      // Update position
      star.y += star.speed;
      if (star.y > this.canvas.height + 10) {
        this.stars[i] = this.createStar(false);
      }

      // Twinkle effect
      star.opacity += star.twinkle * star.twinkleDir;
      if (star.opacity > 0.95) star.twinkleDir = -1;
      if (star.opacity < 0.2) star.twinkleDir = 1;

      // Draw star with soft dreamy sakura pink glow
      this.ctx.fillStyle = `rgba(255, 182, 193, ${star.opacity})`;
      this.ctx.shadowBlur = star.size * 2.5;
      this.ctx.shadowColor = "rgba(255, 143, 163, 0.75)";
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
