/**
 * FLOWER TRUEORDARE - GOOGLE APPS SCRIPT BACKEND
 * ==============================================================================
 * Web App Backend handling:
 * 1. Players Sheet: timestamp | playerId | playerName | status | lossCount | currentRound | gameStatus | finalResult
 * 2. Questions Sheet: id | type | level | content | active
 * 3. Answers Sheet: timestamp | playerId | playerName | round | lossCount | type | level | question | answer
 * 4. DareResults Sheet: timestamp | playerId | playerName | round | lossCount | level | dare | accepted
 * 5. GameResults Sheet: timestamp | playerId | playerName | round | flowerCount | playerAnswer | timeRemaining | result | lossCount
 * 6. WinnerPunishments Sheet: timestamp | winnerId | winnerName | round | penaltyType | customContent
 * ==============================================================================
 */

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === "getQuestions") {
    return handleGetQuestions();
  }
  
  return createJsonResponse({ ok: true, message: "Flower TrueOrDare API is running!" });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === "savePlayer") {
      return handleSavePlayer(data);
    } else if (action === "saveGameResult") {
      return handleSaveGameResult(data);
    } else if (action === "saveTruthAnswer") {
      return handleSaveTruthAnswer(data);
    } else if (action === "saveDareResult") {
      return handleSaveDareResult(data);
    } else if (action === "saveWinnerPunishment") {
      return handleSaveWinnerPunishment(data);
    }

    return createJsonResponse({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return createJsonResponse({ ok: false, error: String(err) });
  }
}

// ------------------------------------------------------------------------------
// HANDLERS
// ------------------------------------------------------------------------------

function handleGetQuestions() {
  const sheet = getOrCreateSheet("Questions", [
    "id", "type", "level", "content", "active"
  ]);
  
  // Seed sample data if sheet is empty (only header row)
  if (sheet.getLastRow() <= 1) {
    seedDefaultQuestions(sheet);
  }

  const rows = sheet.getDataRange().getValues();
  const questions = [];

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const [id, type, level, content, active] = rows[i];
    const isActive = (String(active).toUpperCase() === "TRUE" || active === true);
    if (isActive && content) {
      questions.push({
        id: String(id),
        type: String(type).toLowerCase(),
        level: Number(level) || 1,
        content: String(content),
        active: true
      });
    }
  }

  return createJsonResponse({ ok: true, questions: questions });
}

function handleSavePlayer(data) {
  const sheet = getOrCreateSheet("Players", [
    "timestamp", "playerId", "playerName", "status", "lossCount", "currentRound", "gameStatus", "finalResult"
  ]);
  
  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.playerId || "",
    data.playerName || "",
    data.status || "playing",
    data.lossCount ?? 0,
    data.currentRound ?? 1,
    data.gameStatus || "playing",
    data.finalResult || ""
  ]);

  return createJsonResponse({ ok: true });
}

function handleSaveGameResult(data) {
  const sheet = getOrCreateSheet("GameResults", [
    "timestamp", "playerId", "playerName", "round", "flowerCount", "playerAnswer", "timeRemaining", "result", "lossCount"
  ]);

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.playerId || "",
    data.playerName || "",
    data.round || 1,
    data.flowerCount ?? 0,
    data.playerAnswer ?? "",
    data.timeRemaining ?? 0,
    data.result || "",
    data.lossCount ?? 0
  ]);

  return createJsonResponse({ ok: true });
}

function handleSaveTruthAnswer(data) {
  const sheet = getOrCreateSheet("Answers", [
    "timestamp", "playerId", "playerName", "round", "lossCount", "type", "level", "question", "answer"
  ]);

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.playerId || "",
    data.playerName || "",
    data.round || 1,
    data.lossCount ?? 0,
    data.type || "truth",
    data.level || 1,
    data.question || "",
    data.answer || ""
  ]);

  return createJsonResponse({ ok: true });
}

function handleSaveDareResult(data) {
  const sheet = getOrCreateSheet("DareResults", [
    "timestamp", "playerId", "playerName", "round", "lossCount", "level", "dare", "accepted"
  ]);

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.playerId || "",
    data.playerName || "",
    data.round || 1,
    data.lossCount ?? 0,
    data.level || 1,
    data.dare || "",
    data.accepted !== false ? "TRUE" : "FALSE"
  ]);

  return createJsonResponse({ ok: true });
}

function handleSaveWinnerPunishment(data) {
  const sheet = getOrCreateSheet("WinnerPunishments", [
    "timestamp", "winnerId", "winnerName", "round", "penaltyType", "customContent"
  ]);

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.winnerId || "",
    data.winnerName || "",
    data.round || 1,
    data.penaltyType || "truth",
    data.customContent || ""
  ]);

  return createJsonResponse({ ok: true });
}

// ------------------------------------------------------------------------------
// UTILS
// ------------------------------------------------------------------------------

function getOrCreateSheet(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
    }
  }

  return sheet;
}

function seedDefaultQuestions(sheet) {
  const defaults = [
    ["001", "truth", 1, "Bạn từng crush ai trong nhóm/bạn bè?", "TRUE"],
    ["002", "truth", 1, "Điều gì khiến bạn xấu hổ nhất?", "TRUE"],
    ["003", "truth", 1, "Tin nhắn sến nhất bạn từng gửi cho ai?", "TRUE"],
    ["004", "dare", 1, "Tạo dáng chụp hình thật hài hước", "TRUE"],
    ["005", "dare", 1, "Nói một câu thật sến với người bên cạnh", "TRUE"],
    ["006", "truth", 2, "Câu hỏi Truth nâng cao khó hơn 1", "TRUE"],
    ["007", "truth", 2, "Câu hỏi Truth nâng cao khó hơn 2", "TRUE"],
    ["008", "dare", 2, "Dare nâng cao khó hơn 1", "TRUE"],
    ["009", "dare", 2, "Dare nâng cao khó hơn 2", "TRUE"]
  ];
  defaults.forEach(function(row) {
    sheet.appendRow(row);
  });
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
