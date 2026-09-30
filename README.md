# Pie Chart Lap Timer

A pie chart timer that keeps track of time. It shows remaining time on a filled pie-chart analog clock as well as digitally. Requires uploading an Excel file with columns **Tid** and **Aktivitet**.

- **Tid** – the time span in minutes, e.g. `0-5`, `5-15`
- **Aktivitet** – what each period is about; shown on screen. A row with an empty Tid is appended to the lap above it.

**Live app:** https://perberg70.github.io/pie-chart-laps-timer/

## Run locally

Prerequisite: Node.js

1. `npm install`
2. `npm run dev`
3. Open http://localhost:3000

## Deploy

Every push to `main` builds the app and publishes it to GitHub Pages (see `.github/workflows/deploy.yml`).
