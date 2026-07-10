/**
 * Pay Tracker → Google Sheet two-way sync endpoint.
 *
 * Setup (one time, ~2 minutes):
 * 1. Create a Google Sheet in your Drive (e.g. "Pay Tracker").
 * 2. In the sheet: Extensions → Apps Script. Delete any code there and paste this file.
 * 3. Deploy → New deployment → type: Web app, "Execute as: Me", "Who has access: Anyone".
 *    (If you already have a deployment: Deploy → Manage deployments → ✏️ edit →
 *     Version: New version → Deploy, so the URL stays the same.)
 * 4. Copy the web app URL (ends in /exec) into the Pay Tracker app settings.
 *
 * Privacy: every request must carry a secret token. The first token ever
 * received is remembered and required from then on ("pair on first use"),
 * so only devices set up with your token can read or write your data.
 *
 * Sheets used:
 *   "Work Log" / "Monthly Summary" — human-readable, rebuilt on every save
 *   "_App Data" — raw app data the app reads back on startup (don't edit)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();
    let token = props.getProperty("TOKEN");
    if (!token && data.token) {
      props.setProperty("TOKEN", String(data.token));
      token = String(data.token);
    }
    if (!data.token || String(data.token) !== token) {
      return json_({ ok: false, error: "unauthorized" });
    }

    if (data.action === "load") return handleLoad_();
    if (data.action === "save") return handleSave_(data);
    return json_({ ok: false, error: "unknown action" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function handleLoad_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("_App Data");
  if (!sh || sh.getLastRow() < 2) return json_({ ok: true, entries: null, savedAt: 0 });
  const savedAt = Number(sh.getRange(1, 2).getValue()) || 0;
  const chunks = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(r => r[0]).join("");
  let entries = null;
  try { entries = JSON.parse(chunks); } catch (e) {}
  return json_({ ok: true, entries: entries, savedAt: savedAt });
}

function handleSave_(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  /* raw data the app reads back (chunked: a cell holds max 50k chars) */
  const raw = getSheet_(ss, "_App Data");
  raw.clearContents();
  const jsonStr = JSON.stringify(data.entries || {});
  const rows = [["savedAt", data.savedAt || 0]];
  for (let i = 0; i < jsonStr.length; i += 40000) rows.push([jsonStr.substr(i, 40000)]);
  rows.forEach((r, i) => raw.getRange(i + 1, 1, 1, r.length).setValues([r]));
  raw.hideSheet();

  /* human-readable tabs */
  const log = getSheet_(ss, "Work Log");
  log.clearContents();
  const logRows = [data.headers].concat(data.rows || []);
  log.getRange(1, 1, logRows.length, data.headers.length).setValues(
    logRows.map(r => padRow_(r, data.headers.length))
  );
  log.getRange(1, 1, 1, data.headers.length).setFontWeight("bold");

  const monthly = getSheet_(ss, "Monthly Summary");
  monthly.clearContents();
  const mRows = [["Month", "Total Hours", "Total Pay (" + (data.currency || "") + ")"]].concat(data.monthly || []);
  monthly.getRange(1, 1, mRows.length, 3).setValues(mRows.map(r => padRow_(r, 3)));
  monthly.getRange(1, 1, 1, 3).setFontWeight("bold");

  return json_({ ok: true, rows: (data.rows || []).length, savedAt: data.savedAt || 0 });
}

function getSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function padRow_(row, len) {
  const out = row.slice(0, len);
  while (out.length < len) out.push("");
  return out;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
