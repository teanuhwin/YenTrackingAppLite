# Yen Tracking App Lite

A mobile-first Progressive Web App (PWA) for tracking shared spending across a group — built for travel, with offline support, live JPY↔USD conversion, and no account required.

---

## Features

### Two Tracking Tabs
- **Debit** — tracks withdrawals against a shared declining cash balance. Shows remaining funds in real time.
- **Credit** — tracks credit card charges separately. Shows per-member totals and a running group total.

### Live Exchange Rate
- Automatically fetches the current JPY↔USD rate from three independent sources (frankfurter.app, open.er-api.com, exchangerate.host) in sequence.
- Falls back to the last cached rate if all sources are unreachable (e.g. on the subway).
- Rate badge in the header shows live (green), fetching (yellow), or cached (gray) status.
- Refreshes every 15 minutes while the app is open.

### Entry Form
- Enter amounts in either **¥ JPY or $ USD** — the other currency is calculated instantly.
- Assign each entry to a **member**.
- Add an optional **note** (e.g. "Convenience store", "Train pass").
- Press **Enter** from the notes field to submit.

### Recent Activity
- **Swipe left** on any row to reveal a red Delete button — standard iOS gesture.
- **Tap any row** to open the edit sheet.
- Edit the **member, amount, date, or note** after the fact.
- **Filter** by member or **sort** by date or amount using the pill bar above the list.

### Member Summary Cards
- Shows each member's total spend (USD and JPY) at a glance.
- Automatically updates when names are renamed in Settings.

### Settings
- **Starting Balance** — change the initial debit fund amount at any time.
- **Manage Members** — rename, add, or remove members. Renaming a member updates all their existing transactions automatically.
- **Data Backup** — download a CSV of all transactions, or upload a previously saved CSV to restore data.
- **Danger Zone** — reset debit data, credit data, or everything independently.

---

## Installing on iPhone (PWA)

This app is designed to be installed as a home screen app on iPhone — no App Store required.

1. Host all three files (`index.html`, `sw.js`, `manifest.json`) in the **same folder** on a web host (GitHub Pages, Netlify, etc.). The HTML file **must be named `index.html`**.
2. Open the hosted URL in **Safari** on your iPhone.
3. Tap the **Share** button → **Add to Home Screen** → give it a name → **Add**.

The app icon will appear on your home screen and launches full-screen like a native app.

---

## Offline Support

A service worker (`sw.js`) caches the entire app on first load — including fonts and the Tailwind CSS library. Once cached, the app opens and runs fully offline with no network connection needed.

- All transaction data is stored in `localStorage` on the device.
- The exchange rate is cached from the last successful fetch.
- Exchange rate requests are passed through without caching (live data only), and the app handles failures gracefully.

> **Important:** Clearing Safari's website data (Settings → Safari → Advanced → Website Data) will delete both the app cache **and** all saved transactions. Use the CSV backup before doing this.

---

## Receiving App Updates

When a new version of `index.html` is uploaded to the host:

1. Open the app — it detects the update in the background.
2. Close and reopen the app — the new version activates.

To force faster updates, bump the version string in `sw.js` with each release:
```js
const CACHE_NAME = 'yen-tracker-v2'; // increment this
```

---

## Data Backup & Restore

Found in **Settings → Data Backup**.

**To back up:** tap **Download CSV Backup**. The file includes all debit and credit transactions with type, date, member, JPY amount, exchange rate, USD amount, and notes.

**To restore after an app update:**
1. Download your CSV backup before updating.
2. Upload the new `index.html` to your host.
3. Open the app, go to Settings → Data Backup, tap **Upload CSV to Restore**.
4. Select your backup file and confirm.

The CSV format is:
```
Type, Date, Member, Amount JPY, Rate, Amount USD, Notes
Debit, 1/15/2025, Person A, 5000, 0.006623, 33.12, "Convenience store"
Credit, 1/15/2025, Person B, 12000, 0.006623, 79.48, "Restaurant"
```

---

## File Structure

```
index.html      — The full app (HTML, CSS, JavaScript in one file)
sw.js           — Service worker for offline caching
manifest.json   — PWA manifest (app name, icon, theme color)
README.md       — This file
```

All three files must be in the same directory on your host for the service worker and manifest to register correctly.

---

## Technical Notes

- **No build step required** — plain HTML/CSS/JS, deployable by dropping files into any static host.
- **No external dependencies at runtime** — Tailwind CSS and Google Fonts are cached by the service worker on first load.
- **Data storage** — `localStorage` only. No server, no account, no third-party data access.
- **Exchange rate APIs** — three free, no-key-required, CORS-permissive endpoints are tried in sequence. If all fail, the last cached rate is used silently.
- **iOS PWA compatibility** — `confirm()` dialogs are replaced with custom bottom sheet modals (iOS blocks `confirm()` in standalone PWA mode). Font size is forced to 16px on inputs to prevent Safari auto-zoom.
