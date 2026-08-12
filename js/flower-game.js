/* ===========================================================
   STAR BOX & FLOWER COUNTING GAME ENGINE
   =========================================================== */

class FlowerGameEngine {
  constructor(options) {
    this.containerEl = options.containerEl;
    this.timerBadgeEl = options.timerBadgeEl;
    this.timerTextEl = options.timerTextEl;
    this.onPeelComplete = options.onPeelComplete;
    this.onTimeout = options.onTimeout;
    this.onTick = options.onTick;

    this.totalFlowersCount = 0;
    this.targetEmoji = "🌸";
    this.targetCount = 0;
    this.timeRemaining = GAME_CONFIG.timeLimit;
    this.timerInterval = null;
    this.isTimerRunning = false;
  }

  // =========================================================
  // GENERATE FLOWERS
  // =========================================================

  setupRound() {
    this.stopTimer();
    this.containerEl.innerHTML = "";

    // Random total flowers: 100 to 140
    const min = GAME_CONFIG.minFlowers || 100;
    const max = GAME_CONFIG.maxFlowers || 140;

    this.totalFlowersCount =
      Math.floor(Math.random() * (max - min + 1)) + min;

    const flowersList =
      GAME_CONFIG.flowers || ["🌸", "🌼", "🌺", "🌻", "💮"];

    const flowerElements = [];

    // =======================================================
    // STAR BOX GRID
    // =======================================================

    // More slots = flowers spread more evenly
    // while still keeping the Star Box dense.
    const cols = 11;
    const rows = 11;
    const slots = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const basePercentX =
          10 + c * (80 / (cols - 1));

        const basePercentY =
          10 + r * (80 / (rows - 1));

        slots.push({
          x: basePercentX,
          y: basePercentY
        });
      }
    }

    // =======================================================
    // SHUFFLE SLOTS
    // =======================================================

    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [slots[i], slots[j]] =
        [slots[j], slots[i]];
    }

    // =======================================================
    // PLACE FLOWERS
    // =======================================================

    const placedPoints = [];

    // Increased distance:
    // 9.5  = more overlap
    // 11.5 = lighter overlap
    // 13+  = quite separated
    const minDistancePercent = 11.5;

    for (let i = 0; i < this.totalFlowersCount; i++) {

      const emoji =
        flowersList[
          Math.floor(
            Math.random() * flowersList.length
          )
        ];

      const flowerEl =
        document.createElement("div");

      flowerEl.className = "flower-item";
      flowerEl.textContent = emoji;
      flowerEl.dataset.emoji = emoji;

      let bestPos = null;

      // =====================================================
      // FIRST FLOWERS USE PREPARED SLOTS
      // =====================================================

      if (i < slots.length) {

        const slot = slots[i];

        // Smaller jitter prevents excessive collision
        const jitterX =
          (Math.random() - 0.5) * 5;

        const jitterY =
          (Math.random() - 0.5) * 5;

        bestPos = {
          x: Math.max(
            6,
            Math.min(
              94,
              slot.x + jitterX
            )
          ),

          y: Math.max(
            7,
            Math.min(
              93,
              slot.y + jitterY
            )
          )
        };

      } else {

        // ===================================================
        // EXTRA FLOWERS
        // ===================================================

        for (
          let tryCount = 0;
          tryCount < 40;
          tryCount++
        ) {

          const candX =
            6 + Math.random() * 88;

          const candY =
            7 + Math.random() * 86;

          let tooClose = false;

          for (const pt of placedPoints) {

            const dist =
              Math.hypot(
                candX - pt.x,
                candY - pt.y
              );

            if (
              dist < minDistancePercent
            ) {
              tooClose = true;
              break;
            }
          }

          if (
            !tooClose ||
            tryCount === 39
          ) {

            bestPos = {
              x: candX,
              y: candY
            };

            break;
          }
        }
      }

      // Safety fallback
      if (!bestPos) {
        bestPos = {
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80
        };
      }

      placedPoints.push(bestPos);

      // =====================================================
      // RANDOM ROTATION
      // =====================================================

      const rotate =
        -22 + Math.random() * 44;

      // =====================================================
      // SMALLER FLOWERS
      // =====================================================

      // Previous:
      // 0.76 - 1.10
      //
      // New:
      // 0.62 - 0.88
      //
      // This makes flowers smaller and easier to distinguish.
      const scale =
        0.62 + Math.random() * 0.26;

      // =====================================================
      // LAYERING
      // =====================================================

      const zIndex = 5 + i;

      flowerEl.style.left =
        `${bestPos.x}%`;

      flowerEl.style.top =
        `${bestPos.y}%`;

      flowerEl.style.transform =
        `translate(-50%, -50%)
         rotate(${rotate}deg)
         scale(${scale})`;

      flowerEl.style.zIndex =
        zIndex;

      this.containerEl.appendChild(
        flowerEl
      );

      flowerElements.push(
        flowerEl
      );
    }

    // =======================================================
    // PICK ONE FLOWER TO PEEL
    // =======================================================

    const peelFlowerIndex =
      Math.floor(
        Math.random() *
        flowerElements.length
      );

    const peelFlower =
      flowerElements[
        peelFlowerIndex
      ];

    peelFlower.classList.add(
      "peel-target"
    );

    peelFlower.style.zIndex = 999;

    // =======================================================
    // REMOVE PEELED FLOWER FROM COUNT
    // =======================================================

    const remainingFlowers =
      flowerElements.filter(
        (_, idx) =>
          idx !== peelFlowerIndex
      );

    // =======================================================
    // COUNT EVERY FLOWER TYPE
    // =======================================================

    const counts = {};

    remainingFlowers.forEach(
      (el) => {

        const emoji =
          el.dataset.emoji;

        counts[emoji] =
          (counts[emoji] || 0) + 1;
      }
    );

    // =======================================================
    // ALWAYS SELECT THE MOST NUMEROUS FLOWER
    // =======================================================

    const sortedEmojis =
      Object.keys(counts).sort(
        (a, b) =>
          counts[b] - counts[a]
      );

    // ALWAYS choose the flower with
    // the highest quantity.
    this.targetEmoji =
      sortedEmojis[0] || "🌸";

    this.targetCount =
      counts[this.targetEmoji] || 0;

    // =======================================================
    // DEBUG
    // =======================================================

    console.log(
      "🌸 Flower Count:",
      counts
    );

    console.log(
      "🎯 Target Flower:",
      this.targetEmoji
    );

    console.log(
      "🔢 Target Count:",
      this.targetCount
    );

    console.log(
      "🌺 Total Flowers:",
      this.totalFlowersCount
    );

    // =======================================================
    // RETURN ROUND DATA
    // =======================================================

    return {
      totalFlowers:
        this.totalFlowersCount,

      targetEmoji:
        this.targetEmoji,

      targetCount:
        this.targetCount,

      peelFlower:
        peelFlower
    };
  }

  // =========================================================
  // EXECUTE "BÓC 1 BÔNG HOA" ANIMATION
  // =========================================================

  startPeelAnimation(
    peelFlower,
    callback
  ) {

    if (!peelFlower) {

      if (callback) {
        callback();
      }

      return;
    }

    // Add peeling CSS animation class
    setTimeout(() => {

      peelFlower.classList.add(
        "peeling"
      );

      // After animation finishes (~1150ms)
      setTimeout(() => {

        peelFlower.style.display =
          "none";

        if (callback) {
          callback();
        }

      }, 1150);

    }, 400);
  }

  // =========================================================
  // START 7-SECOND COUNTDOWN
  // =========================================================

  startTimer() {

    this.stopTimer();

    this.timeRemaining =
      GAME_CONFIG.timeLimit;

    this.updateTimerUI();

    this.isTimerRunning = true;

    this.timerInterval =
      setInterval(() => {

        this.timeRemaining -= 1;

        this.updateTimerUI();

        if (this.onTick) {
          this.onTick(
            this.timeRemaining
          );
        }

        if (
          this.timeRemaining <= 0
        ) {

          this.stopTimer();

          if (this.onTimeout) {
            this.onTimeout();
          }
        }

      }, 1000);
  }

  // =========================================================
  // STOP TIMER
  // =========================================================

  stopTimer() {

    if (this.timerInterval) {

      clearInterval(
        this.timerInterval
      );

      this.timerInterval = null;
    }

    this.isTimerRunning = false;
  }

  // =========================================================
  // UPDATE TIMER UI
  // =========================================================

  updateTimerUI() {

    if (!this.timerTextEl) {
      return;
    }

    this.timerTextEl.textContent =
      this.timeRemaining;

    // Timer visual states:
    // Normal
    // Warning at <= 5
    // Critical at <= 3

    if (this.timerBadgeEl) {

      this.timerBadgeEl.classList.remove(
        "warning",
        "critical",
        "shake"
      );

      if (
        this.timeRemaining <= 3 &&
        this.timeRemaining > 0
      ) {

        this.timerBadgeEl.classList.add(
          "critical",
          "shake"
        );

      } else if (
        this.timeRemaining <= 5
      ) {

        this.timerBadgeEl.classList.add(
          "warning"
        );
      }
    }
  }
}