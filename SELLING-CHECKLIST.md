# Selling Checklist

Use this before listing or sending the app to customers.

## Required

- Buy a Windows code-signing certificate and sign installer builds.
- Create a public privacy policy based on `PRIVACY.md`.
- Host the phone PWA on HTTPS.
- Add login and Stripe subscription checks.
- Validate item weights and volumes against real removals data.
- Validate cube, lorry, and box-count estimates against completed jobs.
- Capture labelled removals photos and train the custom model.
- Decide whether auto-update is enabled through GitHub Releases.
- Replace temporary brand assets with final production artwork.

## Strongly Recommended

- Package TensorFlow and COCO-SSD assets locally so surveys work offline.
- Tune quote rules for stairs, access distance, packing, dismantling, and disposal.
- Add a saved survey history screen.
- Add a simple activation/licensing flow before public sale.

## Build

```bash
npm ci
npm test
npm run build:win
```
