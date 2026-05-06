# Intelligent Removals Pro

Video survey inventory software for removals teams. The app combines a live camera detector with customer/job details, manual inventory controls, weight and volume estimates, vehicle recommendations, quote estimates, JSON/CSV/print export, and an installable phone PWA.

## Run locally

```bash
npm install
npm start
```

## Quality check

```bash
npm test
```

## Build installers

```bash
npm run build:win
npm run build:mac
npm run build:linux
```

## Phone app

The mobile survey app lives at:

```text
web/mobile.html
```

When hosted over HTTPS, phones can open the URL and install it to the home screen. The phone app supports customer/job details, camera detection, manual inventory, local draft saving, quote estimate, share, JSON export, CSV export, and print.

The phone app also includes a Training Capture section for collecting labelled photos to train a removals-specific object detector. See `TRAINING.md`.

Training pipeline files live under `training/`. Start with `training/TRAINING_PIPELINE.md`.

Smart Scan backend setup lives in `SMART_SCAN.md`.

The survey calculator now estimates:

- recommended move cube in cubic metres and cubic feet
- lorry size using usable cube and payload allowance
- small, medium, large, and wardrobe box requirements
- whether the estimate used scanned inventory or the property-size baseline

## Release notes

- Windows installer is configured through `electron-builder` and NSIS.
- Auto-update publishes through GitHub Releases.
- Set `GH_TOKEN` before publishing a release.
- Replace `assets/logo.png` and `build/icon.ico` / `build/icon.icns` when final brand assets are ready.
- Host the PWA over HTTPS before sending it to phones.

## Commercial readiness checklist

- Add a privacy policy for camera use and exported survey data.
- Add signed Windows and macOS builds before public sale.
- Replace CDN-hosted TensorFlow scripts with packaged model assets for offline use.
- Validate the item weights, volumes, and quote formula against your real survey/quote data.
- Add login and subscription checks before public PWA launch.
