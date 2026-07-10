/**
 * Pay Tracker → Google Sheet sync endpoint.
 *
 * Setup (one time, ~2 minutes):
 * 1. Create a new Google Sheet in your Drive (e.g. "Pay Tracker").
 * 2. In the sheet: Extensions → Apps Script. Delete any code there and paste this file.
 * 3. Click Deploy → New deployment → type: Web app.
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4. Authorize when prompted, then copy the Web app URL (ends in /exec).
 * 5. Paste that URL into Pay Tracker → Settings → "Apps Script web app URL".
 *
 * Every sync fully rewrites two tabs: "Work Log" and "Monthly Summary".
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const log = getSheet_(ss, "Work Log");
    log.clearContents();
    const rows = [data.headers].concat(data.rows);
    log.getRange(1, 1, rows.length, data.headers.length).setValues(
      rows.map(r => padRow_(r, data.headers.length))
    );
    log.getRange(1, 1, 1, data.headers.length).setFontWeight("bold");

    const monthly = getSheet_(ss, "Monthly Summary");
    monthly.clearContents();
    const mRows = [["Month", "Total Hours", "Total Pay (" + (data.currency || "") + ")"]].concat(data.monthly);
    monthly.getRange(1, 1, mRows.length, 3).setValues(mRows.map(r => padRow_(r, 3)));
    monthly.getRange(1, 1, 1, 3).setFontWeight("bold");

    return json_({ ok: true, rows: data.rows.length, months: data.monthly.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
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
