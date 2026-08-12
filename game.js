/* ===========================================================
   GAME LOGIC — "Đoán số đùi gà"
   Pure logic helpers. No direct DOM manipulation here except
   the drumstick fall animation builder (kept here since it's
   tightly coupled to the round's random count).
   =========================================================== */

const ChickenGame = (function () {

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Start a new round: pick how many drumsticks will fall. */
  function newRound() {
    return {
      correctNumber: randInt(GAME_DATA.minDrumsticks, GAME_DATA.maxDrumsticks)
    };
  }

  /** Build the list of selectable guess numbers around the valid range. */
  function guessOptions() {
    const opts = [];
    for (let n = GAME_DATA.guessMin; n <= GAME_DATA.guessMax; n++) opts.push(n);
    return opts;
  }

  function checkGuess(guess, correctNumber) {
    return Number(guess) === Number(correctNumber);
  }

  function pickRandom(list) {
    return list[randInt(0, list.length - 1)];
  }

  function getTruth() {
    return pickRandom(GAME_DATA.truthQuestions);
  }

  function getDare() {
    return pickRandom(GAME_DATA.dares);
  }

  /**
   * Animate `count` drumsticks falling into the box.
   * layerEl: container to append drumstick nodes into.
   * onDone: called once the last drumstick has landed.
   */
  function animateDrop(layerEl, boxEl, count, onDone) {
    layerEl.innerHTML = "";
    const dropSpacing = 220; // ms between each drumstick starting to fall
    const fallDuration = 900; // ms, matches CSS animation-duration below

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement("span");
        el.className = "drumstick";
        el.textContent = "🍗";
        const left = 20 + Math.random() * 60; // % across the box width
        const rotStart = randInt(-30, 30) + "deg";
        const rotEnd = randInt(60, 300) + "deg";
        el.style.left = left + "%";
        el.style.setProperty("--rot-start", rotStart);
        el.style.setProperty("--rot-end", rotEnd);
        el.style.animationDuration = fallDuration + "ms";
        layerEl.appendChild(el);

        el.addEventListener("animationend", () => {
          el.remove();
          if (boxEl) {
            boxEl.classList.remove("shake");
            void boxEl.offsetWidth; // restart animation
            boxEl.classList.add("shake");
          }
        });
      }, i * dropSpacing);
    }

    const totalTime = (count - 1) * dropSpacing + fallDuration + 150;
    setTimeout(onDone, totalTime);
  }

  return {
    newRound,
    guessOptions,
    checkGuess,
    getTruth,
    getDare,
    animateDrop
  };
})();
