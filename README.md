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
a# Star Wars Trivia — Cloudflare Worker v4
## D1 SQL Database + Admin Panel + CSV Export

## What's new in v4
- 🗄️  Switched from KV to **D1 (SQLite)** — supports real SQL queries
- 🛡️  Admin panel at `/admin` — password protected
- 🔍  Filter players by username, min XP, min correct answers
- 🔃  Sort by any column (XP, accuracy, logins, streak, etc.)
- 📊  Summary stats dashboard (total players, correct answers, avg accuracy)
- ⬇️  Export all player data to CSV with one click

---

## Setup (do this once)

### Step 1 — Create the D1 database
```bash
npx wrangler d1 create sw-trivia-players
```
Copy the `database_id` it prints.

### Step 2 — Paste the ID into wrangler.toml
Replace `PASTE_YOUR_D1_DATABASE_ID_HERE` with your real ID.

### Step 3 — Change your admin password (optional but recommended)
In `wrangler.toml` change:
```
ADMIN_SECRET = "starwars-admin"
```
to something only you know.

### Step 4 — Deploy
```bash
npm install
npm run deploy
```

---

## URLs
| URL | Description |
|---|---|
| `/` | The trivia game |
| `/admin` | Admin panel (enter your ADMIN_SECRET) |
| `/api/export?secret=YOUR_SECRET` | Download CSV of all players |

## Admin panel features
- Search players by username
- Filter by minimum XP or correct answers
- Sort by any column — click headers to toggle asc/desc
- See accuracy bar for each player
- One-click CSV export

## API routes
| Route | Method | Description |
|---|---|---|
| `/api/register` | POST | Create account |
| `/api/login` | POST | Login + increment logins |
| `/api/save` | POST | Save stats after each answer |
| `/api/trivia` | GET | Get 10 questions |
| `/api/admin` | GET | Query players (requires secret) |
| `/api/export` | GET | Download CSV (requires secret) |