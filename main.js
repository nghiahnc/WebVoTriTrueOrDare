/* ===========================================================
   APP / FLOW CONTROLLER
   Wires DOM <-> game.js / gsheet.js. Handles screen & step
   transitions (all slide-in from the left per spec).
   =========================================================== */

(function () {
  const STORAGE_KEY = "kfcgame_playerName";

  // ---- element refs -----------------------------------------------------
  const screens = {
    name: document.getElementById("screen-name"),
    menu: document.getElementById("screen-menu"),
    game: document.getElementById("screen-game")
  };

  const steps = {
    drop: document.getElementById("step-drop"),
    guess: document.getElementById("step-guess"),
    result: document.getElementById("step-result"),
    choice: document.getElementById("step-choice"),
    prompt: document.getElementById("step-prompt"),
    done: document.getElementById("step-done")
  };

  const nameInput = document.getElementById("name-input");
  const nameError = document.getElementById("name-error");
  const btnContinue = document.getElementById("btn-continue");
  const menuName = document.getElementById("menu-name");
  const btnChangeName = document.getElementById("btn-change-name");
  const game1Tile = document.getElementById("game-1-tile");

  const drumstickLayer = document.getElementById("drumstick-layer");
  const kfcBox = document.getElementById("kfc-box");
  const dropHint = document.getElementById("drop-hint");

  const guessGrid = document.getElementById("guess-grid");
  const btnSubmitGuess = document.getElementById("btn-submit-guess");

  const resultFx = document.getElementById("result-fx");
  const resultTitle = document.getElementById("result-title");
  const resultDetail = document.getElementById("result-detail");
  const btnToChoice = document.getElementById("btn-to-choice");

  const btnTruth = document.getElementById("btn-truth");
  const btnDare = document.getElementById("btn-dare");

  const promptTag = document.getElementById("prompt-tag");
  const promptText = document.getElementById("prompt-text");
  const answerInput = document.getElementById("answer-input");
  const answerError = document.getElementById("answer-error");
  const btnSubmitAnswer = document.getElementById("btn-submit-answer");
  const submitStatus = document.getElementById("submit-status");

  const doneTitle = document.getElementById("done-title");
  const doneDetail = document.getElementById("done-detail");
  const btnBackMenu = document.getElementById("btn-back-menu");

  const toastEl = document.getElementById("toast");

  // ---- round state --------------------------------------------------------
  let round = null;          // { correctNumber }
  let selectedGuess = null;
  let wasCorrect = null;
  let choice = null;         // "truth" | "dare"
  let promptContent = "";
  let hasSubmitted = false;  // duplicate-submission guard for this round

  // =========================================================
  // SCREEN / STEP TRANSITIONS (slide+fade in from left)
  // =========================================================
  function showScreen(name) {
    Object.values(screens).forEach(s => {
      s.hidden = true;
      s.querySelector(".card")?.classList.remove("enter-from-left");
    });
    screens[name].hidden = false;
    const card = screens[name].querySelector(".card");
    // force reflow so the animation restarts every time
    void card.offsetWidth;
    card.classList.add("enter-from-left");
  }

  function showStep(name) {
    Object.values(steps).forEach(s => {
      s.hidden = true;
      s.classList.remove("enter-from-left");
    });
    steps[name].hidden = false;
    void steps[name].offsetWidth;
    steps[name].classList.add("enter-from-left");
  }

  function showToast(message, ms = 2600) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toastEl.hidden = true; }, ms);
  }

  // =========================================================
  // NAME ENTRY
  // =========================================================
  function getSavedName() {
    try { return localStorage.getItem(STORAGE_KEY) || ""; }
    catch (e) { return ""; }
  }

  function saveName(name) {
    try { localStorage.setItem(STORAGE_KEY, name); }
    catch (e) { /* localStorage unavailable — game still works, just won't persist */ }
  }

  function handleContinue() {
    const name = nameInput.value.trim();
    if (!name) {
      nameError.hidden = false;
      nameInput.focus();
      return;
    }
    nameError.hidden = true;
    saveName(name);
    goToMenu(name);
  }

  function goToMenu(name) {
    menuName.textContent = name;
    showScreen("menu");
  }

  btnContinue.addEventListener("click", handleContinue);
  nameInput.addEventListener("keydown", e => { if (e.key === "Enter") handleContinue(); });
  nameInput.addEventListener("input", () => { if (nameInput.value.trim()) nameError.hidden = true; });

  btnChangeName.addEventListener("click", () => {
    nameInput.value = getSavedName();
    nameError.hidden = true;
    showScreen("name");
  });

  // =========================================================
  // MAIN MENU -> GAME 1
  // =========================================================
  game1Tile.addEventListener("click", () => {
    showScreen("game");
    startRound();
  });

  btnBackMenu.addEventListener("click", () => {
    showScreen("menu");
  });

  // =========================================================
  // GAME 1: DROP STEP
  // =========================================================
  function startRound() {
    round = ChickenGame.newRound();
    selectedGuess = null;
    wasCorrect = null;
    choice = null;
    promptContent = "";
    hasSubmitted = false;

    dropHint.textContent = "Nhìn kỹ nhé...";
    showStep("drop");

    // small delay so the enter animation is visible before drumsticks start
    setTimeout(() => {
      ChickenGame.animateDrop(drumstickLayer, kfcBox, round.correctNumber, () => {
        dropHint.textContent = "Rơi xong rồi!";
        setTimeout(() => goToGuessStep(), 400);
      });
    }, 350);
  }

  function goToGuessStep() {
    buildGuessGrid();
    selectedGuess = null;
    btnSubmitGuess.disabled = true;
    showStep("guess");
  }

  function buildGuessGrid() {
    guessGrid.innerHTML = "";
    ChickenGame.guessOptions().forEach(n => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "guess-option";
      btn.textContent = n;
      btn.addEventListener("click", () => {
        selectedGuess = n;
        [...guessGrid.children].forEach(c => c.classList.remove("selected"));
        btn.classList.add("selected");
        btnSubmitGuess.disabled = false;
      });
      guessGrid.appendChild(btn);
    });
  }

  btnSubmitGuess.addEventListener("click", () => {
    if (selectedGuess === null) return;
    wasCorrect = ChickenGame.checkGuess(selectedGuess, round.correctNumber);
    showResultStep();
  });

  // =========================================================
  // GAME 1: RESULT STEP
  // =========================================================
  function showResultStep() {
    if (wasCorrect) {
      resultFx.textContent = "🎉🍗🎉";
      resultTitle.textContent = "Chính xác luôn!";
      resultDetail.textContent = `Có đúng ${round.correctNumber} đùi gà rơi vào hộp. Bạn đoán siêu chuẩn!`;
    } else {
      resultFx.textContent = "😅🍗";
      resultTitle.textContent = "Tiếc quá, chưa đúng!";
      resultDetail.textContent = `Bạn đoán ${selectedGuess}, nhưng thực ra có ${round.correctNumber} đùi gà rơi vào hộp.`;
    }
    showStep("result");
  }

  btnToChoice.addEventListener("click", () => showStep("choice"));

  // =========================================================
  // GAME 1: TRUTH OR DARE CHOICE
  // =========================================================
  btnTruth.addEventListener("click", () => selectChoice("truth"));
  btnDare.addEventListener("click", () => selectChoice("dare"));

  function selectChoice(kind) {
    choice = kind;
    promptContent = kind === "truth" ? ChickenGame.getTruth() : ChickenGame.getDare();
    promptTag.textContent = kind === "truth" ? "Sự thật 💗" : "Thử thách 🔥";
    promptText.textContent = promptContent;
    answerInput.value = "";
    answerError.hidden = true;
    submitStatus.hidden = true;
    btnSubmitAnswer.disabled = false;
    btnSubmitAnswer.classList.remove("btn-loading");
    showStep("prompt");
  }

  // =========================================================
  // GAME 1: ANSWER SUBMISSION -> GOOGLE SHEET
  // =========================================================
  btnSubmitAnswer.addEventListener("click", async () => {
    if (hasSubmitted) return; // guard against duplicate submits

    const answer = answerInput.value.trim();
    if (!answer) {
      answerError.hidden = false;
      answerInput.focus();
      return;
    }
    answerError.hidden = true;

    hasSubmitted = true;
    btnSubmitAnswer.disabled = true;
    btnSubmitAnswer.classList.add("btn-loading");
    submitStatus.hidden = true;

    const payload = {
      timestamp: new Date().toISOString(),
      playerName: menuName.textContent || "",
      game: "Đoán số đùi gà",
      guessedNumber: selectedGuess,
      correctNumber: round.correctNumber,
      result: wasCorrect ? "Đúng" : "Sai",
      trueOrDare: choice === "truth" ? "Sự thật" : "Thử thách",
      questionOrDare: promptContent,
      playerAnswer: answer
    };

    const res = await GSheet.submit(payload);

    btnSubmitAnswer.classList.remove("btn-loading");

    if (res.ok) {
      showToast("Đã lưu câu trả lời! 💌");
    } else if (res.skipped) {
      showToast("Chưa kết nối Google Sheet — câu trả lời chỉ hiển thị tại chỗ.");
    } else {
      showToast("Gửi thất bại, nhưng câu trả lời của bạn vẫn được ghi nhận ở đây!");
      // allow a retry since the network call genuinely failed
      hasSubmitted = false;
      btnSubmitAnswer.disabled = false;
    }

    if (res.ok || res.skipped) {
      goToDoneStep();
    }
  });

  function goToDoneStep() {
    if (wasCorrect) {
      doneTitle.textContent = "Bạn thắng rồi! 🎉";
      doneDetail.textContent = "Hãy chụp màn hình kết quả và gửi cho Chí Nghĩa nhé!";
    } else {
      doneTitle.textContent = "Cảm ơn bạn đã chơi!";
      doneDetail.textContent = "Câu trả lời của bạn đã được ghi nhận. Hẹn gặp lại ở lượt sau nhé!";
    }
    showStep("done");
  }

  // =========================================================
  // BOOTSTRAP
  // =========================================================
  function init() {
    if (!GSheet.isConfigured()) {
      console.warn("[App] Google Sheet chưa được cấu hình. Xem js/gsheet.js để thêm webAppUrl.");
    }
    const saved = getSavedName();
    if (saved) {
      goToMenu(saved);
    } else {
      showScreen("name");
    }
  }

  init();
})();
