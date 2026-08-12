/**
 * Đoán số đùi gà — Google Sheet backend
 * ---------------------------------------------------------
 * Deploy this as a Web App (see README.md in the project root
 * for exact steps). It appends one row per submission to the
 * "Submissions" sheet.
 *
 * Expected sheet header row (must match exactly, in this order):
 * timestamp | playerName | game | guessedNumber | correctNumber |
 * result | trueOrDare | questionOrDare | playerAnswer
 */

const SHEET_NAME = "Submissions";

function doPost(e) {
  try {
    const sheet = getOrCreateSheet_();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.playerName || "",
      data.game || "",
      data.guessedNumber ?? "",
      data.correctNumber ?? "",
      data.result || "",
      data.trueOrDare || "",
      data.questionOrDare || "",
      data.playerAnswer || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "timestamp",
      "playerName",
      "game",
      "guessedNumber",
      "correctNumber",
      "result",
      "trueOrDare",
      "questionOrDare",
      "playerAnswer"
    ]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}
