/* ===========================================================
   GOOGLE SHEET SUBMISSION
   ---------------------------------------------------------
   Talks to a Google Apps Script Web App (see
   /google-apps-script/Code.gs) which appends a row to your
   Google Sheet.

   >>> REQUIRED: paste your deployed Web App URL below. <<<
   Without it, submissions are safely skipped (logged to
   console + shown as a friendly toast) so the game never
   breaks even if the Sheet isn't wired up yet.
   =========================================================== */

const GSHEET_CONFIG = {
  // Paste the URL you get after deploying Code.gs as a Web App.
  // Example: "https://script.google.com/macros/s/AKfycb.../exec"
  webAppUrl: ""
};

const GSheet = (function () {

  function isConfigured() {
    return typeof GSHEET_CONFIG.webAppUrl === "string" && GSHEET_CONFIG.webAppUrl.trim().length > 0;
  }

  /**
   * Submit one row of data to the Google Sheet.
   * Never throws — always resolves with { ok: boolean, skipped?: boolean, error?: string }
   * so the UI can stay responsive no matter what happens.
   */
  async function submit(payload) {
    if (!isConfigured()) {
      console.warn("[GSheet] webAppUrl not set — skipping submission.", payload);
      return { ok: false, skipped: true };
    }

    try {
      // Apps Script Web Apps redirect on POST, and their CORS response
      // doesn't expose body reads reliably from fetch with credentials.
      // "no-cors" + text/plain body is the standard reliable pattern:
      // the request lands, we just can't read the response body.
      await fetch(GSHEET_CONFIG.webAppUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      return { ok: true };
    } catch (err) {
      console.error("[GSheet] submission failed", err);
      return { ok: false, error: (err && err.message) || "network_error" };
    }
  }

  return { submit, isConfigured };
})();
