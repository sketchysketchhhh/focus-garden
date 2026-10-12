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
