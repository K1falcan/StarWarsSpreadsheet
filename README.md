# Star Wars Trivia — Cloudflare Worker v2

## What's new in v2
- ♾️  **Infinite rounds** — plays forever, never repeats the same question in a session
- ⭐ **XP + Leveling** — earn XP for correct answers, bonus XP for streaks
- 🏆 **7 Ranks**: Youngling → Padawan → Jedi Knight → Jedi Master → Jedi Council → Chosen One → Grand Master
- 🔥 **Streak multiplier** — consecutive correct answers give bonus XP (up to +10/question)
- 35 questions across 4 categories: Movie Order, Starships, Species, Characters

## Setup

### Prerequisites
- Node.js 18+
- A Cloudflare account (free tier is fine)

### 1. Replace your files
Copy the new `src/index.js`, `package.json`, and `wrangler.toml` into your GitHub repo
(`starwarsspreedsheet`), replacing the old ones.

### 2. Install & run locally
```bash
npm install
npm run dev
```
Visit http://localhost:8787 to test.

### 3. Deploy to Cloudflare
```bash
npm run deploy
```
Your worker updates live at: https://starwarstrivia.koyomc12.workers.dev/

### How it works
- `GET /`           → serves the full HTML/CSS/JS game
- `GET /api/trivia?used=0,3,7` → returns 10 fresh questions, avoiding IDs already seen this session

# Star Wars Trivia — Cloudflare Worker v3

## What's new in v3
- 👤 Username + password login (SHA-256 hashed, stored in Cloudflare KV)
- 📊 Per-player history: correct answers, wrong answers, login count, XP, best streak
- ♾️  Infinite rounds with no question repeats per session
- ⭐ XP + 7-tier leveling system
- 🔥 Streak multiplier for bonus XP

## One-time Setup: Create a KV Namespace

Before deploying, you need to create a KV namespace for player data.

### Step 1 — Create the KV namespace
Run this in your terminal:
```bash
npx wrangler kv:namespace create SW_TRIVIA_KV
```
It will print something like:
```
{ binding = "SW_TRIVIA_KV", id = "abc123def456..." }
```

### Step 2 — Paste the ID into wrangler.toml
Open `wrangler.toml` and replace:
```
id = "PASTE_YOUR_KV_NAMESPACE_ID_HERE"
```
with the real ID from Step 1.

### Step 3 — Deploy
```bash
npm install
npm run deploy
```

Your live URL: https://starwarstrivia.koyomc12.workers.dev/

## API routes
| Route | Method | Description |
|---|---|---|
| `/api/register` | POST | Create new account |
| `/api/login` | POST | Login + increment login count |
| `/api/save` | POST | Save player stats after each answer |
| `/api/trivia` | GET | Get 10 fresh questions |
| `/` | GET | Serve the full game UI |

## Level thresholds
| Level | Title | XP |
|---|---|---|
| 1 | Youngling | 0 |
| 2 | Padawan | 50 |
| 3 | Jedi Knight | 150 |
| 4 | Jedi Master | 300 |
| 5 | Jedi Council | 500 |
| 6 | Chosen One | 750 |
| 7 | Grand Master | 1,000 |