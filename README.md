# Pay Tracker

A mobile-first web app to track work hours and pay.

- Enter **clock in / clock out** (and optional break) for each day, Monday–Sunday.
- It calculates **hours and pay per day and per week**, with optional overtime.
- Shows your **payday**: for a Mon–Sun work week, pay arrives the **Friday of the following week** (e.g. work Mon Jul 6 – Sun Jul 12 → paid Fri Jul 17), with a countdown.
- **Monthly summary** tab shows how much you earned each month.
- Data is stored on your phone (localStorage) and can be **synced to a Google Sheet** and **backed up to this GitHub repo**.

## Using it on your phone

**App link: https://vedavyaskota.github.io/pay-tracker-app/**

Open it on your phone, then Share → **Add to Home Screen** to use it like a native app.

The app lives in two repos:
- [`pay-tracker-app`](https://github.com/Vedavyaskota/pay-tracker-app) (public) — code only, serves the app via GitHub Pages. Never contains personal data.
- [`pay-tracker`](https://github.com/Vedavyaskota/pay-tracker) (private) — the same code **plus your data backups** (`data/` folder, written by the in-app "Back up to GitHub" button).

Your hours and pay data live only on your device, in your Google Sheet, and in the private repo.

## First-time setup in the app (Settings tab)

1. **Hourly rate** and currency symbol.
2. **Overtime** (optional): toggle on, set the weekly threshold (e.g. 40 h) and multiplier (e.g. 1.5).

## Google Sheet sync (one time, ~2 minutes)

1. Create a new Google Sheet in your Drive (e.g. "Pay Tracker").
2. In the sheet: **Extensions → Apps Script**, delete the starter code, paste in [`apps-script/Code.gs`](apps-script/Code.gs), and save.
3. **Deploy → New deployment → Web app**, with *Execute as: Me* and *Who has access: Anyone*. Authorize when prompted. (Updating later? **Manage deployments → ✏️ → Version: New version → Deploy** so the URL stays the same.)
4. Copy the web app URL (ends in `/exec`) and paste it into **Settings → Apps Script web app URL** in the app.

Sync is **two-way and automatic**: when the app opens it loads your data from the sheet, and every edit is pushed back a couple of seconds later. The sheet keeps three tabs: **Work Log** (per day: times, hours, pay, week, payday), **Monthly Summary**, and a hidden **_App Data** tab (raw data the app reads — don't edit it). A new phone with an empty app loads from the sheet instead of overwriting it.

Privacy: every request must carry a secret token. The first token the script ever sees is locked in ("pair on first use"), so only devices set up with your token — via the setup link — can read or write your data.

## GitHub backup (one time, ~2 minutes)

1. On GitHub: Settings → Developer settings → **Fine-grained personal access tokens** → generate a token scoped to only this repository with **Contents: Read and write** permission.
2. In the app: **Settings → GitHub backup**, enter `owner/repo` (e.g. `Vedavyaskota/pay-tracker`) and the token.
3. Tap **Back up data to GitHub** — it commits `data/backup.json` and `data/pay-log.csv` to this repo.

The token is stored only on your device. To restore on a new phone, download `data/backup.json` from the repo and use **Import data (JSON)** in Settings.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (HTML + CSS + JS, no build step) |
| `manifest.json`, `sw.js` | Home-screen install + offline support |
| `apps-script/Code.gs` | Paste into your Google Sheet's Apps Script for sync |
| `data/` | Created by the in-app GitHub backup button |
