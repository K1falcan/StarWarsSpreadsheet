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

## Level thresholds
| Level | Title         | XP needed |
|-------|---------------|-----------|
| 1     | Youngling     | 0         |
| 2     | Padawan       | 50        |
| 3     | Jedi Knight   | 150       |
| 4     | Jedi Master   | 300       |
| 5     | Jedi Council  | 500       |
| 6     | Chosen One    | 750       |
| 7     | Grand Master  | 1,000     |
