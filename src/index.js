// src/index.js — Star Wars Trivia Worker
// Infinite rounds, XP leveling system, full question bank from trivia_1.py

// ── Question bank (all 18 from trivia_1.py + extras for variety) ──────────
const ALL_QUESTIONS = [
  // ── Movie Order ──
  {
    category: "Movie Order",
    question: "Which film is #1 in chronological order?",
    options: ["The Phantom Menace", "A New Hope", "Attack of the Clones", "Revenge of the Sith"],
    answer: 0,
  },
  {
    category: "Movie Order",
    question: "Which Star Wars film was released first in theaters?",
    options: ["The Phantom Menace", "The Empire Strikes Back", "A New Hope", "Return of the Jedi"],
    answer: 2,
  },
  {
    category: "Movie Order",
    question: "What is the chronological position of 'Return of the Jedi'?",
    options: ["4th", "5th", "7th", "6th"],
    answer: 3,
  },
  {
    category: "Movie Order",
    question: "Which film comes immediately before 'The Force Awakens' in chronological order?",
    options: ["Return of the Jedi", "The Last Jedi", "Revenge of the Sith", "A New Hope"],
    answer: 0,
  },
  {
    category: "Movie Order",
    question: "In release order, which film was released 4th?",
    options: ["A New Hope", "Return of the Jedi", "The Phantom Menace", "Attack of the Clones"],
    answer: 2,
  },
  {
    category: "Movie Order",
    question: "How many main saga films are in the spreadsheet?",
    options: ["6", "7", "9", "8"],
    answer: 2,
  },
  {
    category: "Movie Order",
    question: "What is the chronological position of 'Revenge of the Sith'?",
    options: ["1st", "2nd", "3rd", "4th"],
    answer: 2,
  },
  {
    category: "Movie Order",
    question: "Which sequel trilogy film was released last?",
    options: ["The Force Awakens", "The Last Jedi", "The Rise of Skywalker", "Rogue One"],
    answer: 2,
  },
  {
    category: "Movie Order",
    question: "What is the release order number of 'The Empire Strikes Back'?",
    options: ["1st", "2nd", "3rd", "4th"],
    answer: 1,
  },
  {
    category: "Movie Order",
    question: "Which film is chronologically positioned between 'The Last Jedi' and nothing — i.e. last?",
    options: ["The Force Awakens", "Rogue One", "The Rise of Skywalker", "Return of the Jedi"],
    answer: 2,
  },

  // ── Starships ──
  {
    category: "Starships",
    question: "Which starship has a hyperdrive rating of 0.5 (the fastest)?",
    options: ["X-wing", "Millennium Falcon", "Jedi Interceptor", "A-wing"],
    answer: 1,
  },
  {
    category: "Starships",
    question: "What is the length of the Death Star?",
    options: ["1,600 m", "19,000 m", "120,000 m", "3,170 m"],
    answer: 2,
  },
  {
    category: "Starships",
    question: "Which starship has the highest atmospheric speed (1,500 km/h)?",
    options: ["A-wing", "TIE Advanced x1", "Jedi Interceptor", "Naboo fighter"],
    answer: 2,
  },
  {
    category: "Starships",
    question: "Who manufactures the Millennium Falcon?",
    options: ["Kuat Drive Yards", "Sienar Fleet Systems", "Incom Corporation", "Corellian Engineering Corporation"],
    answer: 3,
  },
  {
    category: "Starships",
    question: "What class of ship is the Slave 1?",
    options: ["Starfighter", "Patrol craft", "Light freighter", "Assault Starfighter"],
    answer: 1,
  },
  {
    category: "Starships",
    question: "The Executor is 19,000 m long. What class is it?",
    options: ["Star Destroyer", "Deep Space Battlestation", "Star dreadnought", "Capital ship"],
    answer: 2,
  },
  {
    category: "Starships",
    question: "What is the crew size of the Death Star?",
    options: ["47,060", "279,144", "342,953", "1,000,000"],
    answer: 2,
  },
  {
    category: "Starships",
    question: "Which starship is manufactured by Kuat Systems Engineering and has a hyperdrive of 3.0?",
    options: ["Imperial Shuttle", "Slave 1", "Y-wing", "TIE Advanced x1"],
    answer: 1,
  },
  {
    category: "Starships",
    question: "What model is the Millennium Falcon?",
    options: ["YT-2400 freighter", "YT-1300 light freighter", "CR90 corvette", "GR-75 transport"],
    answer: 1,
  },
  {
    category: "Starships",
    question: "Which manufacturer made the X-wing?",
    options: ["Incom Corporation", "Kuat Drive Yards", "Sienar Fleet Systems", "Koensayr Manufacturing"],
    answer: 0,
  },
  {
    category: "Starships",
    question: "What is the atmospheric speed of the A-wing (km/h)?",
    options: ["1,050", "1,100", "1,200", "1,300"],
    answer: 3,
  },
  {
    category: "Starships",
    question: "The Imperial Shuttle is classified as what type of vessel?",
    options: ["Starfighter", "Star Destroyer", "Armed government transport", "Patrol craft"],
    answer: 2,
  },

  // ── Species ──
  {
    category: "Species",
    question: "Which species has an average lifespan of 1,000 years?",
    options: ["Wookie", "Yoda's species", "Human", "Hutt"],
    answer: 3,
  },
  {
    category: "Species",
    question: "What language do Wookies speak?",
    options: ["Huttese", "Shyriiwook", "Galactic Basic", "Ewokese"],
    answer: 1,
  },
  {
    category: "Species",
    question: "What is the average height of Yoda's species (in cm)?",
    options: ["100 cm", "80 cm", "66 cm", "120 cm"],
    answer: 2,
  },
  {
    category: "Species",
    question: "Which species is classified as a gastropod?",
    options: ["Rodian", "Gungan", "Hutt", "Trandoshan"],
    answer: 2,
  },
  {
    category: "Species",
    question: "What is the average lifespan of a Wookie?",
    options: ["120 years", "400 years", "900 years", "250 years"],
    answer: 1,
  },
  {
    category: "Species",
    question: "What language do Ewoks speak?",
    options: ["Sullutese", "Ewokese", "Huttese", "Dosh"],
    answer: 1,
  },
  {
    category: "Species",
    question: "What is the classification of the Gungan species?",
    options: ["Reptilian", "Mammal", "Amphibian", "Gastropod"],
    answer: 2,
  },
  {
    category: "Species",
    question: "What language do Mon Calamari speak?",
    options: ["Galactic Basic", "Mon Calamarian", "Huttese", "Binary"],
    answer: 1,
  },
  {
    category: "Species",
    question: "What is the average height of a Wookie (in cm)?",
    options: ["170 cm", "190 cm", "210 cm", "230 cm"],
    answer: 2,
  },
  {
    category: "Species",
    question: "What is the average human lifespan in the Star Wars universe?",
    options: ["80 years", "100 years", "120 years", "150 years"],
    answer: 2,
  },

  // ── Characters (from CharacterCode / swapi) ──
  {
    category: "Characters",
    question: "What is Luke Skywalker's hair color?",
    options: ["Brown", "Blond", "Black", "Auburn"],
    answer: 1,
  },
  {
    category: "Characters",
    question: "What is Darth Vader's birth year?",
    options: ["41 BBY", "42 BBY", "57 BBY", "32 BBY"],
    answer: 0,
  },
  {
    category: "Characters",
    question: "What is Yoda's eye color?",
    options: ["Blue", "Red", "Brown", "Yellow"],
    answer: 2,
  },
  {
    category: "Characters",
    question: "What is C-3PO's eye color?",
    options: ["Blue", "Red", "Yellow", "Green"],
    answer: 1,
  },
  {
    category: "Characters",
    question: "What is Leia Organa's birth year?",
    options: ["10 BBY", "19 BBY", "0 BBY", "32 BBY"],
    answer: 1,
  },
];

// ── Level system ──────────────────────────────────────────────────────────
// XP thresholds, titles, and color themes per level
const LEVELS = [
  { level: 1, title: "Youngling",         xpNeeded: 0,   color: "#888",   glow: "#aaa"    },
  { level: 2, title: "Padawan",           xpNeeded: 50,  color: "#4FC3F7",glow: "#29B6F6" },
  { level: 3, title: "Jedi Knight",       xpNeeded: 150, color: "#66BB6A",glow: "#43A047" },
  { level: 4, title: "Jedi Master",       xpNeeded: 300, color: "#FFD700",glow: "#FFC107" },
  { level: 5, title: "Jedi Council",      xpNeeded: 500, color: "#AB47BC",glow: "#8E24AA" },
  { level: 6, title: "Chosen One",        xpNeeded: 750, color: "#EF5350",glow: "#E53935" },
  { level: 7, title: "Grand Master",      xpNeeded: 1000,color: "#FF7043",glow: "#F4511E" },
];

function getLevel(xp) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpNeeded) current = l;
    else break;
  }
  const nextIdx = LEVELS.indexOf(current) + 1;
  const next = LEVELS[nextIdx] || null;
  return { current, next };
}

// ── Shuffle helper ────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Trivia API: GET /api/trivia?used=0,3,7 ───────────────────────────────
function triviaHandler(request) {
  const url = new URL(request.url);
  const usedParam = url.searchParams.get("used") || "";
  const usedIndices = usedParam ? usedParam.split(",").map(Number) : [];

  // Filter out already-used questions, reshuffle when pool exhausted
  let available = ALL_QUESTIONS.map((q, i) => ({ q, i })).filter(({ i }) => !usedIndices.includes(i));
  if (available.length < 10) available = ALL_QUESTIONS.map((q, i) => ({ q, i })); // reset pool

  const picked = shuffle(available).slice(0, 10);
  const questions = picked.map(({ q, i }) => ({ ...q, id: i }));

  return new Response(JSON.stringify(questions), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// ── HTML ──────────────────────────────────────────────────────────────────
function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Star Wars Trivia</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --gold: #FFD700;
    --gold-dim: #A0820D;
    --dark: #05050F;
    --navy: #0B0C1E;
    --card: #10122A;
    --card2: #181A35;
    --border: rgba(255,215,0,0.25);
    --text: #E8E8F0;
    --muted: #7A7A9A;
    --green: #4CAF50;
    --red: #EF5350;
    --radius: 10px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--dark);
    color: var(--text);
    font-family: 'Rajdhani', sans-serif;
    font-size: 16px;
    min-height: 100vh;
    background-image:
      radial-gradient(ellipse at 20% 20%, rgba(255,215,0,0.04) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 80%, rgba(30,40,120,0.15) 0%, transparent 60%);
  }

  /* Stars background */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
      radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 40% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 55% 70%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 70% 30%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 85% 55%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 92% 85%, rgba(255,255,255,0.6) 0%, transparent 100%),
      radial-gradient(1px 1px at 5%  90%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 60% 95%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 35% 75%, rgba(255,255,255,0.4) 0%, transparent 100%);
    pointer-events: none;
    z-index: 0;
  }

  .app { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; padding: 20px 16px 60px; }

  /* Header */
  header { text-align: center; padding: 28px 0 24px; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
  header h1 {
    font-family: 'Cinzel Decorative', cursive;
    font-size: clamp(18px, 5vw, 28px);
    color: var(--gold);
    text-shadow: 0 0 20px rgba(255,215,0,0.4);
    letter-spacing: 2px;
    line-height: 1.3;
  }
  header p { color: var(--muted); font-size: 13px; margin-top: 6px; letter-spacing: 1px; }

  /* XP / Level bar */
  .hud {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: center;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 18px;
    margin-bottom: 20px;
  }
  .hud-left { display: flex; flex-direction: column; gap: 8px; }
  .level-row { display: flex; align-items: center; gap: 10px; }
  .level-badge {
    font-family: 'Cinzel Decorative', cursive;
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 99px;
    border: 1px solid;
    white-space: nowrap;
  }
  .xp-bar-wrap { position: relative; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
  .xp-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
  .xp-label { font-size: 12px; color: var(--muted); }
  .hud-right { text-align: right; }
  .streak { font-size: 22px; font-weight: 700; color: var(--gold); line-height: 1; }
  .streak-label { font-size: 11px; color: var(--muted); margin-top: 2px; }

  /* Round info */
  .round-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--muted);
    letter-spacing: 0.5px;
  }
  .round-info strong { color: var(--gold); }

  /* Progress dots */
  .progress-dots { display: flex; gap: 5px; }
  .dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    transition: all 0.3s;
  }
  .dot.answered-correct { background: var(--green); border-color: var(--green); box-shadow: 0 0 6px var(--green); }
  .dot.answered-wrong   { background: var(--red);   border-color: var(--red);   box-shadow: 0 0 6px var(--red); }
  .dot.current          { border-color: var(--gold); background: rgba(255,215,0,0.2); }

  /* Question card */
  .question-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 22px;
    margin-bottom: 16px;
    animation: fadeIn 0.35s ease;
  }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

  .cat-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 99px;
    margin-bottom: 12px;
  }
  .cat-Movie\\ Order { background: rgba(255,100,100,0.15); color: #FF8A80; border: 1px solid rgba(255,100,100,0.3); }
  .cat-Starships     { background: rgba(100,180,255,0.12); color: #82B1FF; border: 1px solid rgba(100,180,255,0.3); }
  .cat-Species       { background: rgba(100,230,150,0.12); color: #69F0AE; border: 1px solid rgba(100,230,150,0.3); }
  .cat-Characters    { background: rgba(255,215,0,0.12);   color: #FFD740; border: 1px solid rgba(255,215,0,0.3); }

  .question-text {
    font-size: 17px;
    font-weight: 600;
    line-height: 1.5;
    color: #FFF;
    margin-bottom: 18px;
  }

  /* Options */
  .options { display: grid; gap: 9px; }
  .opt-btn {
    position: relative;
    width: 100%;
    text-align: left;
    background: var(--card2);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius);
    padding: 12px 16px 12px 44px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: var(--text);
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, transform 0.1s;
  }
  .opt-btn:hover:not(:disabled) {
    border-color: rgba(255,215,0,0.5);
    background: rgba(255,215,0,0.06);
  }
  .opt-btn:active:not(:disabled) { transform: scale(0.985); }
  .opt-letter {
    position: absolute;
    left: 14px; top: 50%; transform: translateY(-50%);
    width: 22px; height: 22px; line-height: 22px;
    text-align: center; border-radius: 50%;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15);
    font-size: 12px; font-weight: 700;
    color: var(--gold);
  }
  .opt-btn.correct {
    background: rgba(76,175,80,0.15);
    border-color: var(--green);
    box-shadow: 0 0 12px rgba(76,175,80,0.2);
  }
  .opt-btn.correct .opt-letter { background: var(--green); border-color: var(--green); color: #fff; }
  .opt-btn.wrong {
    background: rgba(239,83,80,0.12);
    border-color: var(--red);
  }
  .opt-btn.wrong .opt-letter { background: var(--red); border-color: var(--red); color: #fff; }
  .opt-btn:disabled { cursor: default; }

  /* Feedback */
  .feedback-row {
    display: flex; align-items: center; gap: 8px;
    margin-top: 14px; padding: 10px 14px;
    border-radius: var(--radius);
    font-size: 14px; font-weight: 600;
    animation: fadeIn 0.2s ease;
  }
  .feedback-row.correct-fb { background: rgba(76,175,80,0.12); color: #A5D6A7; border: 1px solid rgba(76,175,80,0.25); }
  .feedback-row.wrong-fb   { background: rgba(239,83,80,0.1);  color: #EF9A9A; border: 1px solid rgba(239,83,80,0.2); }
  .xp-gain { margin-left: auto; color: var(--gold); font-weight: 700; white-space: nowrap; }

  /* Round summary card */
  .summary-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px 24px;
    text-align: center;
    animation: fadeIn 0.4s ease;
  }
  .summary-card h2 {
    font-family: 'Cinzel Decorative', cursive;
    font-size: 20px;
    color: var(--gold);
    margin-bottom: 6px;
  }
  .summary-score { font-size: 52px; font-weight: 700; color: #fff; line-height: 1; margin: 16px 0 4px; }
  .summary-score span { font-size: 22px; color: var(--muted); }
  .summary-verdict { font-size: 15px; color: var(--muted); margin-bottom: 20px; }
  .summary-stats {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 12px; margin: 20px 0 24px;
  }
  .stat-box {
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 8px;
  }
  .stat-val { font-size: 22px; font-weight: 700; color: var(--gold); }
  .stat-lbl { font-size: 11px; color: var(--muted); margin-top: 3px; letter-spacing: 0.5px; }
  .level-up-banner {
    background: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,150,0,0.1));
    border: 1px solid var(--gold);
    border-radius: var(--radius);
    padding: 12px 16px;
    margin-bottom: 20px;
    font-size: 14px; font-weight: 600; color: var(--gold);
    animation: pulse 1.2s ease infinite alternate;
  }
  @keyframes pulse { from { box-shadow: 0 0 8px rgba(255,215,0,0.3); } to { box-shadow: 0 0 20px rgba(255,215,0,0.6); } }

  /* Buttons */
  .btn-primary {
    display: inline-block; width: 100%;
    padding: 14px; border: none; border-radius: var(--radius);
    background: linear-gradient(135deg, #B8860B, #FFD700, #B8860B);
    color: #000; font-family: 'Rajdhani', sans-serif;
    font-size: 16px; font-weight: 700; letter-spacing: 1px;
    cursor: pointer; text-transform: uppercase;
    transition: opacity 0.2s, transform 0.1s;
    box-shadow: 0 4px 20px rgba(255,215,0,0.25);
  }
  .btn-primary:hover { opacity: 0.9; }
  .btn-primary:active { transform: scale(0.98); }

  /* Loading */
  .loading {
    text-align: center; padding: 60px 20px;
    color: var(--muted); font-size: 14px; letter-spacing: 1px;
  }
  .spinner {
    width: 30px; height: 30px; margin: 0 auto 16px;
    border: 2px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Toast */
  #toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: var(--card); border: 1px solid var(--gold);
    color: var(--gold); padding: 10px 20px; border-radius: 99px;
    font-size: 13px; font-weight: 600; letter-spacing: 0.5px;
    opacity: 0; transition: opacity 0.3s; z-index: 100; pointer-events: none;
    white-space: nowrap;
  }
  #toast.show { opacity: 1; }
</style>
</head>
<body>
<div class="app">
  <header>
    <h1>⭐ Star Wars Trivia</h1>
    <p>TEST YOUR KNOWLEDGE OF THE GALAXY</p>
  </header>

  <!-- HUD -->
  <div class="hud" id="hud">
    <div class="hud-left">
      <div class="level-row">
        <span class="level-badge" id="levelBadge">Lv.1</span>
        <span id="levelTitle" style="font-weight:600;font-size:14px">Youngling</span>
      </div>
      <div>
        <div class="xp-bar-wrap">
          <div class="xp-bar-fill" id="xpBar" style="width:0%;background:var(--gold)"></div>
        </div>
        <div class="xp-label" id="xpLabel">0 XP</div>
      </div>
    </div>
    <div class="hud-right">
      <div class="streak" id="streakVal">0</div>
      <div class="streak-label">🔥 STREAK</div>
    </div>
  </div>

  <!-- Main content -->
  <div id="app-content"></div>
</div>

<div id="toast"></div>

<script>
// ── State ──────────────────────────────────────────────────────────────
let state = {
  xp: 0,
  streak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  roundNum: 0,
  usedIds: [],    // question IDs already seen (reset when pool runs low)
  questions: [],  // current round's 10 questions
  qIndex: 0,
  answers: [],    // null | true | false per question
  roundScore: 0,
  leveledUp: false,
  prevLevel: null,
};

const LEVELS = ${JSON.stringify(LEVELS)};

function getLevel(xp) {
  let cur = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.xpNeeded) cur = l; else break; }
  const ni = LEVELS.indexOf(cur) + 1;
  return { current: cur, next: LEVELS[ni] || null };
}

// ── XP per answer: base + streak bonus ──
function xpForAnswer(correct, streak) {
  if (!correct) return 0;
  const base = 10;
  const bonus = Math.min(streak, 5) * 2; // up to +10
  return base + bonus;
}

// ── Verdict text based on score ──
function verdict(score) {
  if (score === 10) return "Perfect — The Force is strong with you!";
  if (score >= 8)  return "Excellent — Jedi Knight material!";
  if (score >= 6)  return "Good — Keep training, Padawan.";
  if (score >= 4)  return "Fair — The path is long...";
  return "The Dark Side clouds your knowledge.";
}

// ── Update HUD ──────────────────────────────────────────────────────────
function updateHUD() {
  const { current, next } = getLevel(state.xp);
  document.getElementById("levelBadge").textContent = "Lv." + current.level;
  document.getElementById("levelBadge").style.color = current.color;
  document.getElementById("levelBadge").style.borderColor = current.color;
  document.getElementById("levelTitle").textContent = current.title;
  document.getElementById("levelTitle").style.color = current.color;

  let pct = 0;
  if (next) {
    const span = next.xpNeeded - current.xpNeeded;
    const prog = state.xp - current.xpNeeded;
    pct = Math.min(100, (prog / span) * 100);
  } else { pct = 100; }

  document.getElementById("xpBar").style.width = pct + "%";
  document.getElementById("xpBar").style.background = current.color;
  document.getElementById("xpLabel").textContent =
    state.xp + " XP" + (next ? " · " + (next.xpNeeded - state.xp) + " to " + next.title : " · MAX");
  document.getElementById("streakVal").textContent = state.streak;
}

// ── Toast ───────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}

// ── Fetch questions ─────────────────────────────────────────────────────
async function fetchQuestions() {
  const usedParam = state.usedIds.join(",");
  const res = await fetch("/api/trivia?used=" + usedParam);
  return res.json();
}

// ── Start a new round ───────────────────────────────────────────────────
async function startRound() {
  render('<div class="loading"><div class="spinner"></div>Loading questions from the Archives…</div>');
  const qs = await fetchQuestions();
  state.questions = qs;
  state.qIndex = 0;
  state.answers = new Array(qs.length).fill(null);
  state.roundScore = 0;
  state.roundNum++;
  state.leveledUp = false;
  state.prevLevel = getLevel(state.xp).current;
  state.usedIds.push(...qs.map(q => q.id));
  // Keep usedIds manageable; reset when we've used most questions
  if (state.usedIds.length > 28) state.usedIds = [];
  renderQuestion();
}

// ── Render helpers ──────────────────────────────────────────────────────
function render(html) {
  document.getElementById("app-content").innerHTML = html;
}

function dotsHTML() {
  return state.questions.map((_, i) => {
    let cls = "dot";
    if (state.answers[i] === true)  cls += " answered-correct";
    if (state.answers[i] === false) cls += " answered-wrong";
    if (state.answers[i] === null && i === state.qIndex) cls += " current";
    return '<div class="' + cls + '"></div>';
  }).join("");
}

// ── Render current question ─────────────────────────────────────────────
function renderQuestion() {
  const q = state.questions[state.qIndex];
  const answered = state.answers[state.qIndex] !== null;
  const letters = ["A","B","C","D"];
  const catCls = "cat-badge cat-" + q.category.replace(/ /g,"\\ ");

  const optionsHTML = q.options.map((opt, i) => {
    let cls = "opt-btn";
    if (answered) {
      if (i === q.answer) cls += " correct";
      else if (i === state._lastChosen && i !== q.answer) cls += " wrong";
    }
    return \`<button class="\${cls}" \${answered?"disabled":""} onclick="chooseAnswer(\${i})">
      <span class="opt-letter">\${letters[i]}</span>
      \${opt}
    </button>\`;
  }).join("");

  let feedbackHTML = "";
  if (answered) {
    const correct = state.answers[state.qIndex] === true;
    const xpEarned = correct ? xpForAnswer(true, state.streak) : 0;
    feedbackHTML = \`<div class="feedback-row \${correct?"correct-fb":"wrong-fb"}">
      \${correct
        ? "✓ Correct!"
        : "✗ The answer was <strong>" + q.options[q.answer] + "</strong>"
      }
      \${correct ? '<span class="xp-gain">+' + xpEarned + ' XP</span>' : ""}
    </div>\`;
  }

  render(\`
    <div class="round-info">
      <span>Round <strong>\${state.roundNum}</strong> · Q\${state.qIndex+1}/10</span>
      <div class="progress-dots">\${dotsHTML()}</div>
    </div>
    <div class="question-card">
      <span class="\${catCls}">\${q.category}</span>
      <div class="question-text">\${q.question}</div>
      <div class="options">\${optionsHTML}</div>
      \${feedbackHTML}
    </div>
    \${answered ? '<button class="btn-primary" onclick="nextStep()">'
      + (state.qIndex < state.questions.length - 1 ? "NEXT QUESTION →" : "SEE RESULTS →")
      + "</button>" : ""}
  \`);
}

// ── Handle answer selection ─────────────────────────────────────────────
function chooseAnswer(chosen) {
  if (state.answers[state.qIndex] !== null) return;
  const q = state.questions[state.qIndex];
  const correct = chosen === q.answer;

  state._lastChosen = chosen;
  state.answers[state.qIndex] = correct;
  state.totalAnswered++;

  if (correct) {
    state.streak++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.totalCorrect++;
    state.roundScore++;
    const earned = xpForAnswer(true, state.streak);
    state.xp += earned;
    if (state.streak > 1) showToast("🔥 " + state.streak + "x Streak! +" + earned + " XP");
    // Check level-up
    const newLevel = getLevel(state.xp).current;
    if (newLevel.level > state.prevLevel.level) {
      state.leveledUp = true;
      state.prevLevel = newLevel;
    }
  } else {
    state.streak = 0;
  }

  updateHUD();
  renderQuestion();
}

// ── Next step ───────────────────────────────────────────────────────────
function nextStep() {
  if (state.qIndex < state.questions.length - 1) {
    state.qIndex++;
    renderQuestion();
  } else {
    renderSummary();
  }
}

// ── Render round summary ────────────────────────────────────────────────
function renderSummary() {
  const accuracy = state.totalAnswered > 0
    ? Math.round((state.totalCorrect / state.totalAnswered) * 100) : 0;
  const { current } = getLevel(state.xp);

  const levelUpBanner = state.leveledUp
    ? \`<div class="level-up-banner">⚡ LEVEL UP! You are now a <strong>\${current.title}</strong>!</div>\`
    : "";

  render(\`
    <div class="summary-card">
      <h2>Round \${state.roundNum} Complete</h2>
      <div class="summary-score">\${state.roundScore}<span>/10</span></div>
      <div class="summary-verdict">\${verdict(state.roundScore)}</div>
      \${levelUpBanner}
      <div class="summary-stats">
        <div class="stat-box">
          <div class="stat-val">\${state.xp}</div>
          <div class="stat-lbl">TOTAL XP</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">\${state.bestStreak}</div>
          <div class="stat-lbl">BEST STREAK</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">\${accuracy}%</div>
          <div class="stat-lbl">ACCURACY</div>
        </div>
      </div>
      <button class="btn-primary" onclick="startRound()">NEXT ROUND →</button>
    </div>
  \`);
}

// ── Boot ────────────────────────────────────────────────────────────────
window.chooseAnswer = chooseAnswer;
window.nextStep = nextStep;
window.startRound = startRound;

updateHUD();
startRound();
</script>
</body>
</html>`;
}

// ── Router ────────────────────────────────────────────────────────────────
export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/trivia") {
      return triviaHandler(request);
    }

    return new Response(getHTML(), {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  },
};