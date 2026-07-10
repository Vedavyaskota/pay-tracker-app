# Pay Tracker

A mobile-first web app to track work hours and pay.

- Enter **clock in / clock out** (and optional break) for each day, Monday–Sunday.
- It calculates **hours and pay per day and per week**, with optional overtime.
- Shows your **payday**: for a Mon–Sun work week, pay arrives the **Friday of the following week** (e.g. work Mon Jul 6 – Sun Jul 12 → paid Fri Jul 17), with a countdown.
- **Monthly summary** tab shows how much you earned each month.
- Data is stored on your phone (localStorage) and can be **synced to a Google Sheet** and **backed up to this GitHub repo**.

## Using it on your phone

The app is a single `index.html` — it needs to be served over HTTPS to install as a home-screen app.

Options:
- **GitHub Pages** (easiest): requires the repo to be public, or a GitHub Pro plan for private-repo Pages. Settings → Pages → deploy from `main` branch.
- **Netlify / Vercel / Cloudflare Pages**: all can deploy from a private GitHub repo on their free plans.

Once it's open on your phone: Share → **Add to Home Screen** to use it like a native app.

## First-time setup in the app (Settings tab)

1. **Hourly rate** and currency symbol.
2. **Overtime** (optional): toggle on, set the weekly threshold (e.g. 40 h) and multiplier (e.g. 1.5).

## Google Sheet sync (one time, ~2 minutes)

1. Create a new Google Sheet in your Drive (e.g. "Pay Tracker").
2. In the sheet: **Extensions → Apps Script**, delete the starter code, paste in [`apps-script/Code.gs`](apps-script/Code.gs), and save.
3. **Deploy → New deployment → Web app**, with *Execute as: Me* and *Who has access: Anyone*. Authorize when prompted.
4. Copy the web app URL (ends in `/exec`) and paste it into **Settings → Apps Script web app URL** in the app.
5. Tap **Sync to Google Sheet** any time — it rewrites two tabs, **Work Log** (every day: times, hours, pay, week, payday) and **Monthly Summary**.

The URL is unguessable but technically public — it only allows writing rows into this one sheet.

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
