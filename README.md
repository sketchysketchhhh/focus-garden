# 🌱 Focus Garden

A focus timer that grows a garden. Every focus session grows a plant; quit early and it wilts.
Works on **PC and phone**, and can be installed like a native app (PWA). Works offline.

## Features
- Focus timer (5–120 min) with a plant that grows as the timer runs
- 5 plant species: Daisy and Tulip from the start; Sunflower, Cactus and Fruit tree unlock at 1h, 3h and 5h of total focus
- **Strict mode**: leaving the app for more than 10 seconds wilts your plant
- Garden view (today / this week / all time), stats, day streak and a weekly chart
- Chime, vibration and an optional notification when a session ends; keeps the screen awake while running
- Light and dark themes; data saved on your device (localStorage)

## Run it
```bash
npm install
npm run dev        # http://localhost:5173
```
To try it on your phone while developing (same Wi-Fi): `npm run dev -- --host`, then open the "Network" URL on your phone.

Demo tip: add `?speed=60` to the URL so one minute takes one second.

## Build and deploy (free)
```bash
npm run build      # outputs to dist/
```
Upload `dist/` to Netlify, Vercel, Cloudflare Pages or GitHub Pages. The site needs HTTPS for the install option to appear.

## Android APK
Every push to `main` builds an Android app on GitHub Actions (`.github/workflows/android.yml`) and attaches
**FocusGarden.apk** to a new GitHub Release. Open the latest release on your phone, download the APK and install it
(allow "Install unknown apps" for your browser when asked).

The Android project is in `android/` (made with [Capacitor](https://capacitorjs.com)). The app runs from files inside
the APK, so it works offline. After changing the web code locally, run `npm run build && npx cap sync android`.

**Signing.** Without secrets, builds are signed with the shared test key `android/app/ci-debug.keystore`. That is fine
for installing on your own phone, but not for the Play Store. To sign with your release key, add these repository secrets
(Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | your `.keystore` file, base64-encoded (`base64 -w0 focus-garden-release.keystore`) |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_PASSWORD` | key password (same as the keystore password) |
| `ANDROID_KEY_ALIAS` | `focusgarden` |

With those set, each build also produces **FocusGarden.aab** for uploading to Google Play.
Switching keys means uninstalling the test-signed app once before installing the release-signed one.

## Install as an app
- **Android (Chrome):** menu ⋮ → *Install app*
- **iPhone (Safari):** Share → *Add to Home Screen*
- **PC (Chrome or Edge):** click the install icon in the address bar

## Project layout
```
src/
  App.jsx                 app state, timer, strict mode, wake lock
  lib.js                  species, storage, stats, chime, notifications
  components/
    Plant.jsx             procedurally drawn plants (growth driven by progress 0–1)
    GrowView.jsx          setup form and running timer
    GardenView.jsx        your garden grid
    StatsView.jsx         stats tiles, weekly chart, seed collection
    ResultModal.jsx       bloom / wilt result
    ConfirmDialog.jsx     in-app confirmation
vite.config.js            PWA manifest and offline service worker
```

## Ideas for next steps
- Cloud sync between devices (Supabase or Firebase) with a login
- More species and seasonal plants
- Shared gardens with friends
- Wrap with Capacitor to publish to the Play Store or App Store
