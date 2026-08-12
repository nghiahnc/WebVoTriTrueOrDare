/* ===========================================================
   MAIN APPLICATION CONTROLLER & AUDIO SYNTHESIZER
   =========================================================== */

// -----------------------------------------------------------
// Audio Synthesizer (Web Audio API - No external assets needed)
// -----------------------------------------------------------
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playTone(freq, type = "sine", duration = 0.15, gainVal = 0.2) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playClick() {
    this.playTone(440, "sine", 0.08, 0.15);
  }

  playTick() {
    this.playTone(600, "square", 0.05, 0.1);
  }

  playPeel() {
    this.playTone(320, "triangle", 0.2, 0.2);
    setTimeout(() => this.playTone(480, "triangle", 0.25, 0.2), 100);
  }

  playWin() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, "triangle", 0.25, 0.25), idx * 120);
    });
  }

  playFail() {
    this.playTone(280, "sawtooth", 0.2, 0.25);
    setTimeout(() => this.playTone(200, "sawtooth", 0.35, 0.3), 180);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

const soundEngine = new SoundEngine();

// -----------------------------------------------------------
// Screen Navigation Helper
// -----------------------------------------------------------
function showScreen(screenId) {
  document.querySelectorAll("[data-screen]").forEach(s => {
    s.hidden = true;
  });
  const target = document.getElementById(screenId);
  if (target) {
    target.hidden = false;
  }
}

// -----------------------------------------------------------
// App Orchestration & DOM Event Binding
// -----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Starfield Canvas
  const starfield = new Starfield("star-canvas");

  // 2. Pre-fetch questions in background
  truthDareManager.loadQuestions();

  // DOM Elements
  const soundBtn = document.getElementById("btn-sound-toggle");
  
  // Screen Name Elements
  const nameInput = document.getElementById("name-input");
  const nameError = document.getElementById("name-error");
  const btnStartGame = document.getElementById("btn-start-game");

  // Screen Menu Elements
  const menuPlayerName = document.getElementById("menu-player-name");
  const statRound = document.getElementById("stat-round");
  const statLoss = document.getElementById("stat-loss");
  const btnMenuPlay = document.getElementById("btn-menu-play");
  const btnMenuChangeName = document.getElementById("btn-menu-change-name");

  // Screen Game Elements
  const starBoxContainer = document.getElementById("star-box-container");
  const timerBadge = document.getElementById("timer-badge");
  const timerText = document.getElementById("timer-text");
  const targetEmojiPrefix = document.getElementById("target-emoji-prefix");
  const targetEmojiSpan = document.getElementById("target-emoji-span");
  const answerNumberInput = document.getElementById("answer-number-input");
  const gameAnswerError = document.getElementById("game-answer-error");
  const btnSubmitCount = document.getElementById("btn-submit-count");

  // Screen Win Elements
  const winSubtitle = document.getElementById("win-subtitle");
  const winStepChoice = document.getElementById("win-step-choice");
  const winStepInput = document.getElementById("win-step-input");
  const winStepSuccess = document.getElementById("win-step-success");
  const btnWinTruth = document.getElementById("btn-win-truth");
  const btnWinDare = document.getElementById("btn-win-dare");
  const winPenaltyTag = document.getElementById("win-penalty-tag");
  const winPenaltyInput = document.getElementById("win-penalty-input");
  const winPenaltyError = document.getElementById("win-penalty-error");
  const btnWinSubmit = document.getElementById("btn-win-submit");
  const btnWinContinue = document.getElementById("btn-win-continue");

  let selectedWinnerPenaltyType = "truth";

  // Screen Loss 1 Choice Elements
  const loss1Headline = document.getElementById("loss1-headline");
  const loss1GuessedVal = document.getElementById("loss1-guessed-val");
  const loss1CorrectVal = document.getElementById("loss1-correct-val");
  const loss1TargetEmoji = document.getElementById("loss1-target-emoji");
  const btnChoiceTruth1 = document.getElementById("btn-choice-truth1");
  const btnChoiceDare1 = document.getElementById("btn-choice-dare1");
  const btnChoiceGetout = document.getElementById("btn-choice-getout");

  // Screen Penalty Elements
  const penaltyTag = document.getElementById("penalty-tag");
  const penaltyText = document.getElementById("penalty-text");
  const truthForm = document.getElementById("truth-form");
  const truthAnswerInput = document.getElementById("truth-answer-input");
  const truthError = document.getElementById("truth-error");
  const btnSubmitTruth = document.getElementById("btn-submit-truth");
  const dareForm = document.getElementById("dare-form");
  const btnAcceptDare = document.getElementById("btn-accept-dare");

  // Screen Loss 2 Choice Elements
  const loss2Headline = document.getElementById("loss2-headline");
  const loss2GuessedVal = document.getElementById("loss2-guessed-val");
  const loss2CorrectVal = document.getElementById("loss2-correct-val");
  const loss2TargetEmoji = document.getElementById("loss2-target-emoji");
  const btnChoiceTruth2 = document.getElementById("btn-choice-truth2");
  const btnChoiceDare2 = document.getElementById("btn-choice-dare2");

  // Screen Complete Elements
  const completeIcon = document.getElementById("complete-icon");
  const completeTitle = document.getElementById("complete-title");
  const completeSubtitle = document.getElementById("complete-subtitle");
  const completeBanner = document.getElementById("complete-banner");
  const completeGuessedVal = document.getElementById("complete-guessed-val");
  const completeCorrectVal = document.getElementById("complete-correct-val");
  const completeTargetEmoji = document.getElementById("complete-target-emoji");
  const btnNewGame = document.getElementById("btn-new-game");

  // 3. Flower Counting Game Engine Instance
  const flowerEngine = new FlowerGameEngine({
    containerEl: starBoxContainer,
    timerBadgeEl: timerBadge,
    timerTextEl: timerText,
    onTick: (rem) => soundEngine.playTick(),
    onTimeout: () => handleTimeOut()
  });

  // Sound Toggle Handler
  soundBtn.addEventListener("click", () => {
    const muted = soundEngine.toggleMute();
    soundBtn.textContent = muted ? "🔇" : "🔊";
  });

  // Update Menu Screen UI
  function updateMenuUI() {
    const state = gameStateManager.state;
    menuPlayerName.textContent = state.playerName || "Người chơi";
    statRound.textContent = state.currentRound || 1;
    statLoss.textContent = `${state.lossCount}/2`;
  }

  // Initial State Router
  function routeInitialScreen() {
    const state = gameStateManager.state;
    if (state.playerId && state.playerName) {
      updateMenuUI();
      if (state.gameOver) {
        showCompleteScreen(true);
      } else {
        showScreen("screen-menu");
      }
    } else {
      showScreen("screen-name");
    }
  }

  // Event: Name Entry
  btnStartGame.addEventListener("click", () => {
    soundEngine.playClick();
    const val = nameInput.value.trim();
    if (!val) {
      nameError.hidden = false;
      return;
    }
    nameError.hidden = true;
    gameStateManager.initPlayer(val);
    GSheetAPI.savePlayer(gameStateManager.state, "playing");
    updateMenuUI();
    showScreen("screen-menu");
  });

  // Event: Change Name
  btnMenuChangeName.addEventListener("click", () => {
    soundEngine.playClick();
    gameStateManager.resetAll();
    nameInput.value = "";
    nameError.hidden = true;
    showScreen("screen-name");
  });

  // Event: Start Game Round
  btnMenuPlay.addEventListener("click", () => {
    soundEngine.playClick();
    startNewRound();
  });

  function startNewRound() {
    const state = gameStateManager.state;
    if (state.gameOver) {
      showCompleteScreen(true);
      return;
    }

    showScreen("screen-game");
    answerNumberInput.value = "";
    gameAnswerError.hidden = true;
    btnSubmitCount.disabled = false;

    // Render dense overlapping flower cluster & pick target emoji
    const setup = flowerEngine.setupRound();

    // Update question header text with target flower emoji
    if (targetEmojiPrefix) targetEmojiPrefix.textContent = setup.targetEmoji;
    if (targetEmojiSpan) targetEmojiSpan.textContent = setup.targetEmoji;
    
    // Play peel flower animation
    soundEngine.playPeel();
    flowerEngine.startPeelAnimation(setup.peelFlower, () => {
      // Start 7-second countdown
      flowerEngine.startTimer();
    });
  }

  // Event: Submit Flower Count Guess
  btnSubmitCount.addEventListener("click", () => {
    soundEngine.playClick();
    const inputVal = parseInt(answerNumberInput.value.trim(), 10);
    if (isNaN(inputVal) || inputVal < 0) {
      gameAnswerError.hidden = false;
      return;
    }
    gameAnswerError.hidden = true;
    flowerEngine.stopTimer();

    evaluateAnswer(inputVal);
  });

  // Timeout Callback
  function handleTimeOut() {
    soundEngine.playFail();
    btnSubmitCount.disabled = true;
    evaluateAnswer(-1); // -1 indicates timeout
  }

  // Evaluate Answer Result
  function evaluateAnswer(playerAnswer) {
    const correct = flowerEngine.targetCount;
    const targetEmoji = flowerEngine.targetEmoji;
    const isCorrect = (playerAnswer === correct);
    const state = gameStateManager.state;
    const guessedText = playerAnswer < 0 ? "Hết giờ!" : playerAnswer;

    if (isCorrect) {
      // WIN
      soundEngine.playWin();
      if (winSubtitle) {
        winSubtitle.textContent = `⭐ BẠN ĐOÁN ĐÚNG! Có chính xác ${correct} bông ${targetEmoji}!`;
      }

      // Reset Victory steps
      if (winStepChoice) winStepChoice.hidden = false;
      if (winStepInput) winStepInput.hidden = true;
      if (winStepSuccess) winStepSuccess.hidden = true;

      GSheetAPI.saveGameResult({
        round: state.currentRound,
        flowerCount: correct,
        targetEmoji: targetEmoji,
        playerAnswer: playerAnswer,
        timeRemaining: flowerEngine.timeRemaining,
        result: "WIN",
        lossCount: state.lossCount
      });
      showScreen("screen-win");
    } else {
      // LOSE
      soundEngine.playFail();
      const newLossCount = gameStateManager.incrementLoss();
      GSheetAPI.saveGameResult({
        round: state.currentRound,
        flowerCount: correct,
        targetEmoji: targetEmoji,
        playerAnswer: playerAnswer < 0 ? "TIMEOUT" : playerAnswer,
        timeRemaining: flowerEngine.timeRemaining,
        result: "LOSE",
        lossCount: newLossCount
      });

      if (newLossCount === 1) {
        // Loss #1
        loss1Headline.textContent = playerAnswer < 0 ? "⏰ HẾT GIỜ!" : "❌ SAI RỒI!";
        loss1GuessedVal.textContent = guessedText;
        loss1CorrectVal.textContent = correct;
        if (loss1TargetEmoji) loss1TargetEmoji.textContent = targetEmoji;
        showScreen("screen-loss1");
      } else {
        // Loss #2
        if (state.usedGetOut) {
          // Double penalty mode (TRUE x2 or DARE x2)
          loss2Headline.textContent = playerAnswer < 0 ? "⏰ HẾT GIỜ!" : "❌ SAI RỒI!";
          loss2GuessedVal.textContent = guessedText;
          loss2CorrectVal.textContent = correct;
          if (loss2TargetEmoji) loss2TargetEmoji.textContent = targetEmoji;
          showScreen("screen-loss2");
        } else {
          // Direct game over
          gameStateManager.setGameOver(true);
          GSheetAPI.savePlayer(state, "finished", "lose");
          if (completeBanner) {
            completeBanner.hidden = false;
            completeGuessedVal.textContent = guessedText;
            completeCorrectVal.textContent = correct;
            if (completeTargetEmoji) completeTargetEmoji.textContent = targetEmoji;
          }
          showCompleteScreen(false);
        }
      }
    }
  }

  // Winner Choice: True for Chí Nghĩa
  if (btnWinTruth) {
    btnWinTruth.addEventListener("click", () => {
      soundEngine.playClick();
      selectedWinnerPenaltyType = "truth";
      if (winPenaltyTag) winPenaltyTag.textContent = "🔥 TRUE CHO CHÍ NGHĨA";
      if (winPenaltyInput) winPenaltyInput.value = "";
      if (winPenaltyError) winPenaltyError.hidden = true;

      winStepChoice.hidden = true;
      winStepInput.hidden = false;
    });
  }

  // Winner Choice: Dare for Chí Nghĩa
  if (btnWinDare) {
    btnWinDare.addEventListener("click", () => {
      soundEngine.playClick();
      selectedWinnerPenaltyType = "dare";
      if (winPenaltyTag) winPenaltyTag.textContent = "😈 DARE CHO CHÍ NGHĨA";
      if (winPenaltyInput) winPenaltyInput.value = "";
      if (winPenaltyError) winPenaltyError.hidden = true;

      winStepChoice.hidden = true;
      winStepInput.hidden = false;
    });
  }

  // Winner Submit Custom Penalty for Chí Nghĩa
  if (btnWinSubmit) {
    btnWinSubmit.addEventListener("click", () => {
      soundEngine.playClick();
      const val = winPenaltyInput ? winPenaltyInput.value.trim() : "";
      if (!val) {
        if (winPenaltyError) winPenaltyError.hidden = false;
        return;
      }
      if (winPenaltyError) winPenaltyError.hidden = true;

      // Save custom punishment for Chí Nghĩa to Google Sheet
      GSheetAPI.saveWinnerPunishment({
        penaltyType: selectedWinnerPenaltyType,
        customContent: val
      });

      // Cover form and show success notification step
      winStepInput.hidden = true;
      winStepSuccess.hidden = false;
    });
  }

  // Event: Win Continue (Next Round or Finish)
  if (btnWinContinue) {
    btnWinContinue.addEventListener("click", () => {
      soundEngine.playClick();
      gameStateManager.setGameOver(true);
      GSheetAPI.savePlayer(gameStateManager.state, "finished", "win");
      showCompleteScreen(false);
    });
  }

  // Event: Loss 1 - TRUE
  btnChoiceTruth1.addEventListener("click", () => {
    soundEngine.playClick();
    const item = truthDareManager.setupSinglePenalty("truth");
    renderPenaltyScreen(item);
  });

  // Event: Loss 1 - DARE
  btnChoiceDare1.addEventListener("click", () => {
    soundEngine.playClick();
    const item = truthDareManager.setupSinglePenalty("dare");
    renderPenaltyScreen(item);
  });

  // Event: Loss 1 - GỠ
  btnChoiceGetout.addEventListener("click", () => {
    soundEngine.playClick();
    gameStateManager.setUsedGetOut();
    gameStateManager.incrementRound();
    startNewRound();
  });

  // Event: Loss 2 - TRUE x2
  btnChoiceTruth2.addEventListener("click", () => {
    soundEngine.playClick();
    const item = truthDareManager.setupDoublePenalty("truth");
    renderPenaltyScreen(item);
  });

  // Event: Loss 2 - DARE x2
  btnChoiceDare2.addEventListener("click", () => {
    soundEngine.playClick();
    const item = truthDareManager.setupDoublePenalty("dare");
    renderPenaltyScreen(item);
  });

  // Render Penalty Screen
  function renderPenaltyScreen(penaltyItem) {
    showScreen("screen-penalty");
    const q = penaltyItem.question;
    const isTruth = penaltyItem.type === "truth";
    
    // Tag formatting (e.g. 🔥 TRUE (1/2))
    let tagText = isTruth ? "🔥 TRUE" : "😈 DARE";
    if (penaltyItem.totalSteps > 1) {
      tagText += ` (${penaltyItem.stepNumber}/${penaltyItem.totalSteps})`;
    }
    penaltyTag.textContent = tagText;
    penaltyText.textContent = q.content || q;

    if (isTruth) {
      truthForm.hidden = false;
      dareForm.hidden = true;
      truthAnswerInput.value = "";
      truthError.hidden = true;
    } else {
      truthForm.hidden = true;
      dareForm.hidden = false;
    }
  }

  // Event: Submit Truth Answer
  btnSubmitTruth.addEventListener("click", () => {
    soundEngine.playClick();
    const ans = truthAnswerInput.value.trim();
    if (!ans) {
      truthError.hidden = false;
      return;
    }
    truthError.hidden = true;

    const currentItem = truthDareManager.currentPenaltyItem;
    GSheetAPI.saveTruthAnswer({
      level: currentItem.level,
      question: currentItem.question.content || currentItem.question,
      answer: ans
    });

    advancePenaltyFlow();
  });

  // Event: Accept Dare
  btnAcceptDare.addEventListener("click", () => {
    soundEngine.playClick();
    const currentItem = truthDareManager.currentPenaltyItem;
    GSheetAPI.saveDareResult({
      level: currentItem.level,
      dare: currentItem.question.content || currentItem.question,
      accepted: true
    });

    advancePenaltyFlow();
  });

  // Advance Penalty Queue Step
  function advancePenaltyFlow() {
    const result = truthDareManager.nextPenalty();
    if (!result.done) {
      renderPenaltyScreen(result.item);
    } else {
      // Penalty finished! Per flow diagram, completing True/Dare leads to KẾT THÚC
      const state = gameStateManager.state;
      gameStateManager.setGameOver(true);
      GSheetAPI.savePlayer(state, "finished", state.lossCount >= 2 ? "lose_x2" : "completed_penalty");
      showCompleteScreen(false);
    }
  }

  // Show Final Complete Screen
  function showCompleteScreen(wasAlreadyOver = false) {
    showScreen("screen-complete");
    const state = gameStateManager.state;

    if (state.lossCount >= 2) {
      completeIcon.textContent = "💀";
      completeTitle.textContent = "GAME OVER";
      completeSubtitle.textContent = "Bạn đã sử dụng hết 2 cơ hội!";
    } else {
      completeIcon.textContent = "🏆";
      completeTitle.textContent = "CHALLENGE COMPLETE!";
      completeSubtitle.textContent = "Cảm ơn bạn đã tham gia Flower TrueOrDare!";
    }
  }

  // Event: Start New Game Session
  btnNewGame.addEventListener("click", () => {
    soundEngine.playClick();
    const currentName = gameStateManager.state.playerName;
    gameStateManager.initPlayer(currentName);
    GSheetAPI.savePlayer(gameStateManager.state, "playing");
    updateMenuUI();
    showScreen("screen-menu");
  });

  // 4. Start initial screen route
  routeInitialScreen();
});
