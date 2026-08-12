/* ===========================================================
   TRUTH OR DARE PENALTY MANAGER
   =========================================================== */

class TruthDareManager {
  constructor() {
    this.allQuestions = [];
    this.currentQueue = [];
    this.queueIndex = 0;
    this.currentPenaltyItem = null;
    this.onQueueComplete = null;
  }

  // Load questions from GSheet or fallback
  async loadQuestions() {
    try {
      this.allQuestions = await GSheetAPI.getQuestions();
    } catch (e) {
      console.warn("Failed to load questions, using fallback:", e);
      this.allQuestions = FALLBACK_QUESTIONS;
    }
  }

  // Get active questions matching type and level
  getQuestions(type, level) {
    const list = this.allQuestions.filter(q => 
      q.active && 
      q.type.toLowerCase() === type.toLowerCase() && 
      Number(q.level) === Number(level)
    );

    // Fallback search if specific level list is empty
    if (list.length === 0) {
      return FALLBACK_QUESTIONS.filter(q => 
        q.active && 
        q.type.toLowerCase() === type.toLowerCase() && 
        Number(q.level) === Number(level)
      );
    }
    return list;
  }

  // Pick random question from list
  getRandomQuestion(type, level, excludeIds = []) {
    const available = this.getQuestions(type, level).filter(q => !excludeIds.includes(q.id));
    if (available.length === 0) {
      // If all excluded, fallback to any matching type
      const fallbackList = this.getQuestions(type, level);
      return fallbackList[Math.floor(Math.random() * fallbackList.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  // Prepare single penalty (Level 1)
  setupSinglePenalty(type) {
    const item = this.getRandomQuestion(type, 1);
    this.currentQueue = [{
      type: type,
      level: 1,
      question: item,
      stepNumber: 1,
      totalSteps: 1
    }];
    this.queueIndex = 0;
    this.currentPenaltyItem = this.currentQueue[0];
    return this.currentPenaltyItem;
  }

  // Prepare double penalty (Level 2 x2)
  setupDoublePenalty(type) {
    const item1 = this.getRandomQuestion(type, 2);
    const item2 = this.getRandomQuestion(type, 2, [item1.id]);

    this.currentQueue = [
      { type: type, level: 2, question: item1, stepNumber: 1, totalSteps: 2 },
      { type: type, level: 2, question: item2, stepNumber: 2, totalSteps: 2 }
    ];
    this.queueIndex = 0;
    this.currentPenaltyItem = this.currentQueue[0];
    return this.currentPenaltyItem;
  }

  // Advance to next penalty in queue, or finish
  nextPenalty() {
    this.queueIndex += 1;
    if (this.queueIndex < this.currentQueue.length) {
      this.currentPenaltyItem = this.currentQueue[this.queueIndex];
      return { done: false, item: this.currentPenaltyItem };
    } else {
      this.currentPenaltyItem = null;
      return { done: true };
    }
  }
}

const truthDareManager = new TruthDareManager();
