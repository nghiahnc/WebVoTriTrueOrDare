/* ===========================================================
   GOOGLE SHEET INTEGRATION (FRONTEND API WRAPPER)
   =========================================================== */

const GSheetAPI = {
  // Check if web app URL is configured
  isConfigured() {
    return CONFIG.googleWebAppUrl && 
           CONFIG.googleWebAppUrl !== "PASTE_YOUR_WEB_APP_URL_HERE" &&
           CONFIG.googleWebAppUrl.startsWith("http");
  },

  // Helper method for POST requests
  async postData(payload) {
    if (!this.isConfigured()) {
      console.log("ℹ️ Google Sheet Web App URL not configured. Payload logged locally:", payload);
      return { ok: true, offline: true };
    }

    try {
      // Use no-cors or standard JSON post depending on endpoint support
      const response = await fetch(CONFIG.googleWebAppUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn("⚠️ GSheet API request failed (running in offline mode):", error);
      return { ok: false, error: error.message };
    }
  },

  // Fetch Questions from Questions Sheet
  async getQuestions() {
    if (!this.isConfigured()) {
      console.log("ℹ️ Using local fallback questions.");
      return FALLBACK_QUESTIONS;
    }

    try {
      const url = `${CONFIG.googleWebAppUrl}?action=getQuestions`;
      const response = await fetch(url);
      const result = await response.json();
      if (result && result.ok && Array.isArray(result.questions)) {
        return result.questions;
      }
      return FALLBACK_QUESTIONS;
    } catch (err) {
      console.warn("⚠️ Failed to fetch questions from Google Sheet, using fallback:", err);
      return FALLBACK_QUESTIONS;
    }
  },

  // Save/Update Player in 'Players' sheet
  async savePlayer(state, status = "playing", finalResult = "") {
    const payload = {
      action: "savePlayer",
      timestamp: new Date().toLocaleString("vi-VN"),
      playerId: state.playerId,
      playerName: state.playerName,
      status: status,
      lossCount: state.lossCount,
      currentRound: state.currentRound,
      gameStatus: state.gameOver ? "finished" : "playing",
      finalResult: finalResult
    };
    return this.postData(payload);
  },

  // Save Round Result in 'GameResults' sheet
  async saveGameResult(roundData) {
    const state = gameStateManager.state;
    const payload = {
      action: "saveGameResult",
      timestamp: new Date().toLocaleString("vi-VN"),
      playerId: state.playerId,
      playerName: state.playerName,
      round: roundData.round || state.currentRound,
      flowerCount: roundData.flowerCount,
      targetEmoji: roundData.targetEmoji || "🌸",
      playerAnswer: roundData.playerAnswer,
      timeRemaining: roundData.timeRemaining,
      result: roundData.result,
      lossCount: roundData.lossCount || state.lossCount
    };
    return this.postData(payload);
  },

  // Save Truth Answer in 'Answers' sheet
  async saveTruthAnswer(answerData) {
    const state = gameStateManager.state;
    const payload = {
      action: "saveTruthAnswer",
      timestamp: new Date().toLocaleString("vi-VN"),
      playerId: state.playerId,
      playerName: state.playerName,
      round: state.currentRound,
      lossCount: state.lossCount,
      type: "truth",
      level: answerData.level || 1,
      question: answerData.question,
      answer: answerData.answer
    };
    return this.postData(payload);
  },

  // Save Dare Result in 'DareResults' sheet
  async saveDareResult(dareData) {
    const state = gameStateManager.state;
    const payload = {
      action: "saveDareResult",
      timestamp: new Date().toLocaleString("vi-VN"),
      playerId: state.playerId,
      playerName: state.playerName,
      round: state.currentRound,
      lossCount: state.lossCount,
      level: dareData.level || 1,
      dare: dareData.dare,
      accepted: dareData.accepted !== false
    };
    return this.postData(payload);
  },

  // Save Winner Punishment created by Winner for Chí Nghĩa in 'WinnerPunishments' sheet
  async saveWinnerPunishment(punishmentData) {
    const state = gameStateManager.state;
    const payload = {
      action: "saveWinnerPunishment",
      timestamp: new Date().toLocaleString("vi-VN"),
      winnerId: state.playerId,
      winnerName: state.playerName,
      round: state.currentRound,
      penaltyType: punishmentData.penaltyType, // "truth" or "dare"
      customContent: punishmentData.customContent
    };
    return this.postData(payload);
  }
};
