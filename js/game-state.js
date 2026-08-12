/* ===========================================================
   GAME STATE MANAGER
   =========================================================== */

class GameStateManager {
  constructor() {
    this.state = {
      playerId: "",
      playerName: "",
      lossCount: 0,
      usedGetOut: false,
      currentRound: 0,
      gameOver: false,
      currentPenalty: null
    };
    this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(CONFIG.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.playerId) {
          this.state = { ...this.state, ...parsed };
        }
      }
    } catch (e) {
      console.warn("Failed to load game state from localStorage:", e);
    }
    return this.state;
  }

  save() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Failed to save game state to localStorage:", e);
    }
  }

  initPlayer(playerName) {
    // Generate unique playerId using crypto.randomUUID() or fallback
    let id = "";
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      id = crypto.randomUUID();
    } else {
      id = "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
    }

    this.state = {
      playerId: id,
      playerName: playerName.trim(),
      lossCount: 0,
      usedGetOut: false,
      currentRound: 1,
      gameOver: false,
      currentPenalty: null
    };
    this.save();
    return this.state;
  }

  incrementRound() {
    this.state.currentRound += 1;
    this.save();
    return this.state.currentRound;
  }

  incrementLoss() {
    this.state.lossCount += 1;
    if (this.state.lossCount >= GAME_CONFIG.maxLosses) {
      // Do not set gameOver immediately if usedGetOut is true, because they need to complete double penalties
    }
    this.save();
    return this.state.lossCount;
  }

  setUsedGetOut() {
    this.state.usedGetOut = true;
    this.save();
  }

  setGameOver(isOver = true) {
    this.state.gameOver = isOver;
    this.save();
  }

  setCurrentPenalty(penalty) {
    this.state.currentPenalty = penalty;
    this.save();
  }

  clearPenalty() {
    this.state.currentPenalty = null;
    this.save();
  }

  resetAll() {
    this.state = {
      playerId: "",
      playerName: "",
      lossCount: 0,
      usedGetOut: false,
      currentRound: 0,
      gameOver: false,
      currentPenalty: null
    };
    try {
      localStorage.removeItem(CONFIG.storageKey);
    } catch (e) {}
  }
}

const gameStateManager = new GameStateManager();
