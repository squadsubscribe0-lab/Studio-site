# Wordle Daily 🟩🟨⬛

A daily Wordle game with Firebase authentication, persistent user scores, streaks, and a one-time name change feature.

---

## File Structure

```
wordle/
├── index.html              ← Main game (all-in-one HTML)
├── firebase.json           ← Firebase hosting + Firestore config
├── firestore.rules         ← Firestore security rules
├── firestore.indexes.json  ← Firestore query indexes
├── package.json
├── README.md
└── src/
    ├── firebase.js         ← Firebase init (if using npm build)
    ├── db.js               ← All Firestore DB operations
    └── words.js            ← Word list + game logic
```

---

## Setup Instructions

### Step 1 — Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add Project** → enter a name → Continue
3. Disable Google Analytics (optional) → **Create project**

### Step 2 — Enable Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Enable **Anonymous** (Sign-in method tab)
3. Enable **Google** (recommended for cross-device persistence)

### Step 3 — Enable Firestore

1. In Firebase Console → **Firestore Database** → **Create database**
2. Choose **Production mode** (we'll set rules next)
3. Pick a region close to your users (e.g. `asia-south1` for Pakistan)

### Step 4 — Get Your Config

1. In Firebase Console → **Project Settings** (gear icon) → **Your apps**
2. Click **Web app** (</> icon) → Register app
3. Copy the `firebaseConfig` object

### Step 5 — Add Config to index.html

Replace the placeholder values near the bottom of `index.html`:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",          // ← replace
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

### Step 6 — Deploy Firestore Rules

Install Firebase CLI and deploy:

```bash
npm install -g firebase-tools
firebase login
firebase init          # select Firestore + Hosting, use existing project
firebase deploy --only firestore:rules,firestore:indexes
```

### Step 7 — Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your game will be live at:
`https://YOUR_PROJECT_ID.web.app`

---

## Firestore Data Structure

```
users/
  {uid}/
    displayName: "Ali1234"
    nameChanged: false         ← becomes true after first name change
    streak: 5
    maxStreak: 12
    totalGames: 38
    totalWins: 30
    createdAt: Timestamp

    dailyResults/
      "2025-03-16"/
        date: "2025-03-16"
        attempts: 4            ← 1-6, or 7 if lost
        won: true
        guesses: ["CRANE", "STONE", "FLUTE", "THYME"]
        timeMs: 94200
        savedAt: Timestamp
```

---

## Features

- **Daily word** — same word for every player each day, determined by date
- **Persistent results** — once you submit a result it cannot be overwritten
- **One-time name change** — `nameChanged` flag enforced in both JS and Firestore rules
- **Streak tracking** — automatically calculated after each game
- **Share results** — copies emoji grid to clipboard (or native share on mobile)
- **Restore game** — if you already played today, your board is restored on reload
- **Anonymous auth** — play without signing in; optionally upgrade to Google

---

## Monetization Tips

- Add **Google AdSense** banner below the keyboard
- Add a **Pro upgrade** (unlimited extra puzzles) via Stripe
- Add **rewarded ads** for hints (watch ad → reveal a letter)

---

## Local Development

```bash
npx serve .
# Open http://localhost:3000
```
