# Spin Studio

## Run locally
1. Open this folder in VS Code (the folder containing `package.json`).
2. Run `npm.cmd install` in Windows PowerShell.
3. Run `npm.cmd run dev`.
4. Open the localhost URL shown by Vite.

## Features
- Responsive animated spin wheel with 5/8/12-second durations
- Bulk-add names, optional duplicate entries
- Weighted selection with editable weights and visible percentage chances
- Sequential multiple-winner rounds (one spin per winner); optional winner removal before the next spin
- Undo, spin history, reset session
- Color themes, wheel size, text size, and center label customization
- Save/load wheel presets in this browser's local storage
- Download a PNG result poster
- Winner celebration animation and multi-note sound effect
- Hidden-menu demo admin login and spin-number scheduling
- Presentation mode and keyboard shortcuts
- Footer credit and developer LinkedIn contact

## Notes
- Saved wheels stay in the current browser/device; they are not exported as files or synced.
- Admin password `spinadmin` and scheduled outcomes are client-side demo features, not secure for high-stakes draws.
