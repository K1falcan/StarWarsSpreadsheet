// src/index.js — Star Wars Trivia Worker v3
// KV-backed auth, player history, infinite rounds, XP leveling

// ── Simple password hash (SHA-256 via Web Crypto) ─────────────────────────
async function hashPassword(password) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

// ── CORS / JSON helpers ───────────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// ── KV Auth handlers ──────────────────────────────────────────────────────

// POST /api/register  { username, password }
async function handleRegister(request, env) {
  const { username, password } = await request.json();

  if (!username || !password)
    return json({ error: "Username and password required." }, 400);

  const key = "user:" + username.toLowerCase().trim();
  const existing = await env.SW_TRIVIA_KV.get(key);
  if (existing) return json({ error: "Username already taken." }, 409);

  const hashed = await hashPassword(password);
  const profile = {
    username: username.trim(),
    passwordHash: hashed,
    totalCorrect: 0,
    totalWrong: 0,
    totalLogins: 0,
    xp: 0,
    bestStreak: 0,
    roundsPlayed: 0,
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };
  await env.SW_TRIVIA_KV.put(key, JSON.stringify(profile));
  return json({ ok: true, username: profile.username });
}

// POST /api/login  { username, password }
async function handleLogin(request, env) {
  const { username, password } = await request.json();
  if (!username || !password)
    return json({ error: "Username and password required." }, 400);

  const key = "user:" + username.toLowerCase().trim();
  const raw = await env.SW_TRIVIA_KV.get(key);
  if (!raw) return json({ error: "Username not found." }, 404);

  const profile = JSON.parse(raw);
  const hashed = await hashPassword(password);
  if (hashed !== profile.passwordHash)
    return json({ error: "Incorrect password." }, 401);

  profile.totalLogins += 1;
  profile.lastLogin = new Date().toISOString();
  await env.SW_TRIVIA_KV.put(key, JSON.stringify(profile));

  const { passwordHash, ...safeProfile } = profile;
  return json({ ok: true, profile: safeProfile });
}

// POST /api/save  { username, correct, wrong, xp, bestStreak, roundsPlayed }
async function handleSave(request, env) {
  const body = await request.json();
  const { username, correct, wrong, xp, bestStreak, roundsPlayed } = body;
  if (!username) return json({ error: "No username." }, 400);

  const key = "user:" + username.toLowerCase().trim();
  const raw = await env.SW_TRIVIA_KV.get(key);
  if (!raw) return json({ error: "User not found." }, 404);

  const profile = JSON.parse(raw);
  profile.totalCorrect   = correct;
  profile.totalWrong     = wrong;
  profile.xp             = xp;
  profile.bestStreak     = bestStreak;
  profile.roundsPlayed   = roundsPlayed;
  await env.SW_TRIVIA_KV.put(key, JSON.stringify(profile));

  return json({ ok: true });
}

// ── Question bank ─────────────────────────────────────────────────────────
const ALL_QUESTIONS = [
  { category:"Movie Order", question:"Which film is #1 in chronological order?", options:["The Phantom Menace","A New Hope","Attack of the Clones","Revenge of the Sith"], answer:0 },
  { category:"Movie Order", question:"Which Star Wars film was released first in theaters?", options:["The Phantom Menace","The Empire Strikes Back","A New Hope","Return of the Jedi"], answer:2 },
  { category:"Movie Order", question:"What is the chronological position of 'Return of the Jedi'?", options:["4th","5th","7th","6th"], answer:3 },
  { category:"Movie Order", question:"Which film comes immediately before 'The Force Awakens' in chronological order?", options:["Return of the Jedi","The Last Jedi","Revenge of the Sith","A New Hope"], answer:0 },
  { category:"Movie Order", question:"In release order, which film was released 4th?", options:["A New Hope","Return of the Jedi","The Phantom Menace","Attack of the Clones"], answer:2 },
  { category:"Movie Order", question:"How many main saga films are in the spreadsheet?", options:["6","7","9","8"], answer:2 },
  { category:"Movie Order", question:"What is the chronological position of 'Revenge of the Sith'?", options:["1st","2nd","3rd","4th"], answer:2 },
  { category:"Movie Order", question:"Which sequel trilogy film was released last?", options:["The Force Awakens","The Last Jedi","The Rise of Skywalker","Rogue One"], answer:2 },
  { category:"Movie Order", question:"What is the release order number of 'The Empire Strikes Back'?", options:["1st","2nd","3rd","4th"], answer:1 },
  { category:"Movie Order", question:"Which film is chronologically last in the main saga?", options:["The Force Awakens","Rogue One","The Rise of Skywalker","Return of the Jedi"], answer:2 },
  { category:"Starships", question:"Which starship has a hyperdrive rating of 0.5 (the fastest)?", options:["X-wing","Millennium Falcon","Jedi Interceptor","A-wing"], answer:1 },
  { category:"Starships", question:"What is the length of the Death Star?", options:["1,600 m","19,000 m","120,000 m","3,170 m"], answer:2 },
  { category:"Starships", question:"Which starship has the highest atmospheric speed (1,500 km/h)?", options:["A-wing","TIE Advanced x1","Jedi Interceptor","Naboo fighter"], answer:2 },
  { category:"Starships", question:"Who manufactures the Millennium Falcon?", options:["Kuat Drive Yards","Sienar Fleet Systems","Incom Corporation","Corellian Engineering Corporation"], answer:3 },
  { category:"Starships", question:"What class of ship is the Slave 1?", options:["Starfighter","Patrol craft","Light freighter","Assault Starfighter"], answer:1 },
  { category:"Starships", question:"The Executor is 19,000 m long. What class is it?", options:["Star Destroyer","Deep Space Battlestation","Star dreadnought","Capital ship"], answer:2 },
  { category:"Starships", question:"What is the crew size of the Death Star?", options:["47,060","279,144","342,953","1,000,000"], answer:2 },
  { category:"Starships", question:"Which starship is a Firespray-31 model?", options:["Imperial Shuttle","Slave 1","Y-wing","TIE Advanced x1"], answer:1 },
  { category:"Starships", question:"What model is the Millennium Falcon?", options:["YT-2400 freighter","YT-1300 light freighter","CR90 corvette","GR-75 transport"], answer:1 },
  { category:"Starships", question:"Which manufacturer made the X-wing?", options:["Incom Corporation","Kuat Drive Yards","Sienar Fleet Systems","Koensayr Manufacturing"], answer:0 },
  { category:"Starships", question:"What is the atmospheric speed of the A-wing (km/h)?", options:["1,050","1,100","1,200","1,300"], answer:3 },
  { category:"Starships", question:"The Imperial Shuttle is classified as what type of vessel?", options:["Starfighter","Star Destroyer","Armed government transport","Patrol craft"], answer:2 },
  { category:"Species", question:"Which species has an average lifespan of 1,000 years?", options:["Wookie","Yoda's species","Human","Hutt"], answer:3 },
  { category:"Species", question:"What language do Wookies speak?", options:["Huttese","Shyriiwook","Galactic Basic","Ewokese"], answer:1 },
  { category:"Species", question:"What is the average height of Yoda's species (in cm)?", options:["100 cm","80 cm","66 cm","120 cm"], answer:2 },
  { category:"Species", question:"Which species is classified as a gastropod?", options:["Rodian","Gungan","Hutt","Trandoshan"], answer:2 },
  { category:"Species", question:"What is the average lifespan of a Wookie?", options:["120 years","400 years","900 years","250 years"], answer:1 },
  { category:"Species", question:"What language do Ewoks speak?", options:["Sullutese","Ewokese","Huttese","Dosh"], answer:1 },
  { category:"Species", question:"What is the classification of the Gungan species?", options:["Reptilian","Mammal","Amphibian","Gastropod"], answer:2 },
  { category:"Species", question:"What language do Mon Calamari speak?", options:["Galactic Basic","Mon Calamarian","Huttese","Binary"], answer:1 },
  { category:"Species", question:"What is the average height of a Wookie (in cm)?", options:["170 cm","190 cm","210 cm","230 cm"], answer:2 },
  { category:"Species", question:"What is the average human lifespan in the Star Wars universe?", options:["80 years","100 years","120 years","150 years"], answer:2 },
  { category:"Characters", question:"What is Luke Skywalker's hair color?", options:["Brown","Blond","Black","Auburn"], answer:1 },
  { category:"Characters", question:"What is Darth Vader's birth year?", options:["41 BBY","42 BBY","57 BBY","32 BBY"], answer:0 },
  { category:"Characters", question:"What is C-3PO's eye color?", options:["Blue","Red","Yellow","Green"], answer:1 },
];

// ── Level system ──────────────────────────────────────────────────────────
const LEVELS = [
  { level:1, title:"Youngling",    xpNeeded:0,    color:"#888",    glow:"#aaa"    },
  { level:2, title:"Padawan",      xpNeeded:50,   color:"#4FC3F7", glow:"#29B6F6" },
  { level:3, title:"Jedi Knight",  xpNeeded:150,  color:"#66BB6A", glow:"#43A047" },
  { level:4, title:"Jedi Master",  xpNeeded:300,  color:"#FFD700", glow:"#FFC107" },
  { level:5, title:"Jedi Council", xpNeeded:500,  color:"#AB47BC", glow:"#8E24AA" },
  { level:6, title:"Chosen One",   xpNeeded:750,  color:"#EF5350", glow:"#E53935" },
  { level:7, title:"Grand Master", xpNeeded:1000, color:"#FF7043", glow:"#F4511E" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function triviaHandler(request) {
  const url = new URL(request.url);
  const usedParam = url.searchParams.get("used") || "";
  const usedIndices = usedParam ? usedParam.split(",").map(Number) : [];
  let available = ALL_QUESTIONS.map((q,i) => ({q,i})).filter(({i}) => !usedIndices.includes(i));
  if (available.length < 10) available = ALL_QUESTIONS.map((q,i) => ({q,i}));
  const picked = shuffle(available).slice(0,10);
  const questions = picked.map(({q,i}) => ({...q, id:i}));
  return new Response(JSON.stringify(questions), {
    headers:{ "Content-Type":"application/json","Cache-Control":"no-store" },
  });
}

// ── HTML (login screen + game screen) ─────────────────────────────────────
function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Star Wars Trivia</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--gold:#FFD700;--dark:#05050F;--navy:#0B0C1E;--card:#10122A;--card2:#181A35;--border:rgba(255,215,0,0.25);--text:#E8E8F0;--muted:#7A7A9A;--green:#4CAF50;--red:#EF5350;--radius:10px;}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--dark);color:var(--text);font-family:'Rajdhani',sans-serif;font-size:16px;min-height:100vh;background-image:radial-gradient(ellipse at 20% 20%,rgba(255,215,0,0.04) 0%,transparent 60%),radial-gradient(ellipse at 80% 80%,rgba(30,40,120,0.15) 0%,transparent 60%);}
body::before{content:'';position:fixed;inset:0;background-image:radial-gradient(1px 1px at 10% 15%,rgba(255,255,255,0.6) 0%,transparent 100%),radial-gradient(1px 1px at 25% 45%,rgba(255,255,255,0.4) 0%,transparent 100%),radial-gradient(1px 1px at 40% 10%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(1px 1px at 55% 70%,rgba(255,255,255,0.3) 0%,transparent 100%),radial-gradient(1px 1px at 70% 30%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(1px 1px at 85% 55%,rgba(255,255,255,0.4) 0%,transparent 100%),radial-gradient(1px 1px at 92% 85%,rgba(255,255,255,0.6) 0%,transparent 100%),radial-gradient(1px 1px at 5% 90%,rgba(255,255,255,0.3) 0%,transparent 100%),radial-gradient(1px 1px at 60% 95%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(1px 1px at 35% 75%,rgba(255,255,255,0.4) 0%,transparent 100%);pointer-events:none;z-index:0;}
.app{position:relative;z-index:1;max-width:720px;margin:0 auto;padding:20px 16px 60px;}
header{text-align:center;padding:28px 0 24px;border-bottom:1px solid var(--border);margin-bottom:24px;}
header h1{font-family:'Cinzel Decorative',cursive;font-size:clamp(18px,5vw,28px);color:var(--gold);text-shadow:0 0 20px rgba(255,215,0,0.4);letter-spacing:2px;line-height:1.3;}
header p{color:var(--muted);font-size:13px;margin-top:6px;letter-spacing:1px;}

/* ── Auth card ── */
.auth-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:28px 24px;max-width:400px;margin:0 auto;animation:fadeIn 0.4s ease;}
.auth-card h2{font-family:'Cinzel Decorative',cursive;font-size:16px;color:var(--gold);text-align:center;margin-bottom:20px;}
.auth-tabs{display:flex;gap:0;margin-bottom:20px;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;}
.auth-tab{flex:1;padding:10px;background:transparent;border:none;color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:600;letter-spacing:1px;cursor:pointer;transition:all 0.2s;}
.auth-tab.active{background:rgba(255,215,0,0.1);color:var(--gold);}
.form-group{margin-bottom:14px;}
.form-group label{display:block;font-size:12px;font-weight:600;letter-spacing:1px;color:var(--muted);margin-bottom:6px;text-transform:uppercase;}
.form-group input{width:100%;background:var(--card2);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius);padding:11px 14px;font-family:'Rajdhani',sans-serif;font-size:15px;color:var(--text);outline:none;transition:border-color 0.2s;}
.form-group input:focus{border-color:rgba(255,215,0,0.5);}
.auth-error{background:rgba(239,83,80,0.1);border:1px solid rgba(239,83,80,0.3);border-radius:8px;padding:10px 14px;font-size:13px;color:#EF9A9A;margin-bottom:14px;display:none;}
.auth-error.show{display:block;}

/* ── Player profile bar ── */
.profile-bar{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:10px 16px;margin-bottom:12px;}
.profile-name{font-size:13px;font-weight:700;color:var(--gold);}
.profile-stats{font-size:11px;color:var(--muted);margin-top:2px;}
.btn-logout{background:transparent;border:1px solid var(--border);border-radius:6px;padding:5px 12px;color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:12px;cursor:pointer;transition:all 0.2s;}
.btn-logout:hover{border-color:var(--red);color:var(--red);}

/* ── Profile history panel ── */
.history-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:22px;margin-bottom:16px;animation:fadeIn 0.35s ease;}
.history-card h3{font-family:'Cinzel Decorative',cursive;font-size:14px;color:var(--gold);margin-bottom:16px;text-align:center;}
.history-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px;}
.history-stat{background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center;}
.history-stat .val{font-size:26px;font-weight:700;color:var(--gold);}
.history-stat .lbl{font-size:11px;color:var(--muted);margin-top:3px;letter-spacing:0.5px;}
.history-accuracy{text-align:center;font-size:14px;color:var(--muted);margin-bottom:18px;}
.history-accuracy span{color:var(--gold);font-weight:700;font-size:18px;}

/* ── HUD ── */
.hud{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px 18px;margin-bottom:20px;}
.hud-left{display:flex;flex-direction:column;gap:8px;}
.level-row{display:flex;align-items:center;gap:10px;}
.level-badge{font-family:'Cinzel Decorative',cursive;font-size:11px;padding:3px 10px;border-radius:99px;border:1px solid;white-space:nowrap;}
.xp-bar-wrap{position:relative;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;}
.xp-bar-fill{height:100%;border-radius:3px;transition:width 0.6s ease;}
.xp-label{font-size:12px;color:var(--muted);}
.hud-right{text-align:right;}
.streak{font-size:22px;font-weight:700;color:var(--gold);line-height:1;}
.streak-label{font-size:11px;color:var(--muted);margin-top:2px;}

/* ── Round info ── */
.round-info{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;font-size:13px;color:var(--muted);letter-spacing:0.5px;}
.round-info strong{color:var(--gold);}
.progress-dots{display:flex;gap:5px;}
.dot{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);transition:all 0.3s;}
.dot.answered-correct{background:var(--green);border-color:var(--green);box-shadow:0 0 6px var(--green);}
.dot.answered-wrong{background:var(--red);border-color:var(--red);box-shadow:0 0 6px var(--red);}
.dot.current{border-color:var(--gold);background:rgba(255,215,0,0.2);}

/* ── Question card ── */
.question-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:22px;margin-bottom:16px;animation:fadeIn 0.35s ease;}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
.cat-badge{display:inline-block;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:3px 10px;border-radius:99px;margin-bottom:12px;}
.cat-Movie\\ Order{background:rgba(255,100,100,0.15);color:#FF8A80;border:1px solid rgba(255,100,100,0.3);}
.cat-Starships{background:rgba(100,180,255,0.12);color:#82B1FF;border:1px solid rgba(100,180,255,0.3);}
.cat-Species{background:rgba(100,230,150,0.12);color:#69F0AE;border:1px solid rgba(100,230,150,0.3);}
.cat-Characters{background:rgba(255,215,0,0.12);color:#FFD740;border:1px solid rgba(255,215,0,0.3);}
.question-text{font-size:17px;font-weight:600;line-height:1.5;color:#FFF;margin-bottom:18px;}
.options{display:grid;gap:9px;}
.opt-btn{position:relative;width:100%;text-align:left;background:var(--card2);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius);padding:12px 16px 12px 44px;font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:500;color:var(--text);cursor:pointer;transition:border-color 0.2s,background 0.2s,transform 0.1s;}
.opt-btn:hover:not(:disabled){border-color:rgba(255,215,0,0.5);background:rgba(255,215,0,0.06);}
.opt-btn:active:not(:disabled){transform:scale(0.985);}
.opt-letter{position:absolute;left:14px;top:50%;transform:translateY(-50%);width:22px;height:22px;line-height:22px;text-align:center;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);font-size:12px;font-weight:700;color:var(--gold);}
.opt-btn.correct{background:rgba(76,175,80,0.15);border-color:var(--green);box-shadow:0 0 12px rgba(76,175,80,0.2);}
.opt-btn.correct .opt-letter{background:var(--green);border-color:var(--green);color:#fff;}
.opt-btn.wrong{background:rgba(239,83,80,0.12);border-color:var(--red);}
.opt-btn.wrong .opt-letter{background:var(--red);border-color:var(--red);color:#fff;}
.opt-btn:disabled{cursor:default;}
.feedback-row{display:flex;align-items:center;gap:8px;margin-top:14px;padding:10px 14px;border-radius:var(--radius);font-size:14px;font-weight:600;animation:fadeIn 0.2s ease;}
.feedback-row.correct-fb{background:rgba(76,175,80,0.12);color:#A5D6A7;border:1px solid rgba(76,175,80,0.25);}
.feedback-row.wrong-fb{background:rgba(239,83,80,0.1);color:#EF9A9A;border:1px solid rgba(239,83,80,0.2);}
.xp-gain{margin-left:auto;color:var(--gold);font-weight:700;white-space:nowrap;}

/* ── Summary ── */
.summary-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:28px 24px;text-align:center;animation:fadeIn 0.4s ease;}
.summary-card h2{font-family:'Cinzel Decorative',cursive;font-size:20px;color:var(--gold);margin-bottom:6px;}
.summary-score{font-size:52px;font-weight:700;color:#fff;line-height:1;margin:16px 0 4px;}
.summary-score span{font-size:22px;color:var(--muted);}
.summary-verdict{font-size:15px;color:var(--muted);margin-bottom:20px;}
.summary-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0 24px;}
.stat-box{background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:12px 8px;}
.stat-val{font-size:22px;font-weight:700;color:var(--gold);}
.stat-lbl{font-size:11px;color:var(--muted);margin-top:3px;letter-spacing:0.5px;}
.level-up-banner{background:linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,150,0,0.1));border:1px solid var(--gold);border-radius:var(--radius);padding:12px 16px;margin-bottom:20px;font-size:14px;font-weight:600;color:var(--gold);animation:pulse 1.2s ease infinite alternate;}
@keyframes pulse{from{box-shadow:0 0 8px rgba(255,215,0,0.3);}to{box-shadow:0 0 20px rgba(255,215,0,0.6);}}

/* ── Buttons ── */
.btn-primary{display:inline-block;width:100%;padding:14px;border:none;border-radius:var(--radius);background:linear-gradient(135deg,#B8860B,#FFD700,#B8860B);color:#000;font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;letter-spacing:1px;cursor:pointer;text-transform:uppercase;transition:opacity 0.2s,transform 0.1s;box-shadow:0 4px 20px rgba(255,215,0,0.25);}
.btn-primary:hover{opacity:0.9;}
.btn-primary:active{transform:scale(0.98);}
.btn-secondary{display:inline-block;width:100%;padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:transparent;color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:600;letter-spacing:1px;cursor:pointer;text-transform:uppercase;transition:all 0.2s;margin-top:10px;}
.btn-secondary:hover{border-color:var(--gold);color:var(--gold);}

/* ── Loading ── */
.loading{text-align:center;padding:60px 20px;color:var(--muted);font-size:14px;letter-spacing:1px;}
.spinner{width:30px;height:30px;margin:0 auto 16px;border:2px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

/* ── Toast ── */
#toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--card);border:1px solid var(--gold);color:var(--gold);padding:10px 20px;border-radius:99px;font-size:13px;font-weight:600;letter-spacing:0.5px;opacity:0;transition:opacity 0.3s;z-index:100;pointer-events:none;white-space:nowrap;}
#toast.show{opacity:1;}
</style>
</head>
<body>
<div class="app">
  <header>
    <h1>⭐ Star Wars Trivia</h1>
    <p>TEST YOUR KNOWLEDGE OF THE GALAXY</p>
  </header>

  <!-- HUD (hidden until logged in) -->
  <div class="hud" id="hud" style="display:none">
    <div class="hud-left">
      <div class="level-row">
        <span class="level-badge" id="levelBadge">Lv.1</span>
        <span id="levelTitle" style="font-weight:600;font-size:14px">Youngling</span>
      </div>
      <div>
        <div class="xp-bar-wrap"><div class="xp-bar-fill" id="xpBar" style="width:0%;background:var(--gold)"></div></div>
        <div class="xp-label" id="xpLabel">0 XP</div>
      </div>
    </div>
    <div class="hud-right">
      <div class="streak" id="streakVal">0</div>
      <div class="streak-label">🔥 STREAK</div>
    </div>
  </div>

  <!-- Profile bar (hidden until logged in) -->
  <div id="profileBar" style="display:none"></div>

  <!-- Main content -->
  <div id="app-content"></div>
</div>
<div id="toast"></div>

<script>
const LEVELS = ${JSON.stringify(LEVELS)};

// ── State ──────────────────────────────────────────────────────────────
let player = null; // loaded from KV on login
let state = {
  xp:0, streak:0, bestStreak:0,
  totalCorrect:0, totalWrong:0,
  roundsPlayed:0, roundNum:0,
  usedIds:[], questions:[], qIndex:0,
  answers:[], roundScore:0,
  leveledUp:false, prevLevel:null,
};

function getLevel(xp){
  let cur=LEVELS[0];
  for(const l of LEVELS){if(xp>=l.xpNeeded)cur=l;else break;}
  const ni=LEVELS.indexOf(cur)+1;
  return{current:cur,next:LEVELS[ni]||null};
}

function xpForAnswer(streak){
  return 10+Math.min(streak,5)*2;
}

function verdict(score){
  if(score===10)return"Perfect — The Force is strong with you!";
  if(score>=8)return"Excellent — Jedi Knight material!";
  if(score>=6)return"Good — Keep training, Padawan.";
  if(score>=4)return"Fair — The path is long...";
  return"The Dark Side clouds your knowledge.";
}

// ── Render helpers ──────────────────────────────────────────────────────
function render(html){document.getElementById("app-content").innerHTML=html;}

function showToast(msg){
  const t=document.getElementById("toast");
  t.textContent=msg;t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2200);
}

// ── Profile bar ─────────────────────────────────────────────────────────
function renderProfileBar(){
  if(!player)return;
  const acc = (state.totalCorrect+state.totalWrong)>0
    ? Math.round(state.totalCorrect/(state.totalCorrect+state.totalWrong)*100) : 0;
  document.getElementById("profileBar").style.display="block";
  document.getElementById("profileBar").innerHTML=\`
    <div class="profile-bar">
      <div>
        <div class="profile-name">👤 \${player.username}</div>
        <div class="profile-stats">✅ \${state.totalCorrect} correct &nbsp;|&nbsp; ❌ \${state.totalWrong} wrong &nbsp;|&nbsp; 🎯 \${acc}% &nbsp;|&nbsp; 🔑 \${player.totalLogins} logins</div>
      </div>
      <button class="btn-logout" onclick="logout()">LOG OUT</button>
    </div>\`;
}

// ── HUD ─────────────────────────────────────────────────────────────────
function updateHUD(){
  if(!player)return;
  document.getElementById("hud").style.display="grid";
  const{current,next}=getLevel(state.xp);
  document.getElementById("levelBadge").textContent="Lv."+current.level;
  document.getElementById("levelBadge").style.color=current.color;
  document.getElementById("levelBadge").style.borderColor=current.color;
  document.getElementById("levelTitle").textContent=current.title;
  document.getElementById("levelTitle").style.color=current.color;
  let pct=0;
  if(next){const span=next.xpNeeded-current.xpNeeded;pct=Math.min(100,(state.xp-current.xpNeeded)/span*100);}
  else pct=100;
  document.getElementById("xpBar").style.width=pct+"%";
  document.getElementById("xpBar").style.background=current.color;
  document.getElementById("xpLabel").textContent=state.xp+" XP"+(next?" · "+(next.xpNeeded-state.xp)+" to "+next.title:" · MAX");
  document.getElementById("streakVal").textContent=state.streak;
}

// ── Save stats to KV ────────────────────────────────────────────────────
async function saveStats(){
  if(!player)return;
  await fetch("/api/save",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      username:player.username,
      correct:state.totalCorrect,
      wrong:state.totalWrong,
      xp:state.xp,
      bestStreak:state.bestStreak,
      roundsPlayed:state.roundsPlayed,
    })
  });
}

// ── AUTH SCREENS ────────────────────────────────────────────────────────
function renderAuth(tab="login"){
  render(\`
    <div class="auth-card">
      <h2>ENTER THE ARCHIVES</h2>
      <div class="auth-tabs">
        <button class="auth-tab \${tab==="login"?"active":""}" onclick="renderAuth('login')">LOG IN</button>
        <button class="auth-tab \${tab==="register"?"active":""}" onclick="renderAuth('register')">REGISTER</button>
      </div>
      <div class="auth-error" id="authErr"></div>
      <div class="form-group"><label>Username</label><input id="authUser" type="text" placeholder="YourUsername" autocomplete="username"/></div>
      <div class="form-group"><label>Password</label><input id="authPass" type="password" placeholder="••••••••" autocomplete="\${tab==="login"?"current-password":"new-password"}"/></div>
      <button class="btn-primary" onclick="\${tab==="login"?"doLogin()":"doRegister()"}">\${tab==="login"?"LOG IN →":"CREATE ACCOUNT →"}</button>
    </div>\`);
}

function showAuthError(msg){
  const el=document.getElementById("authErr");
  if(el){el.textContent=msg;el.classList.add("show");}
}

async function doLogin(){
  const username=document.getElementById("authUser").value.trim();
  const password=document.getElementById("authPass").value;
  if(!username||!password){showAuthError("Please fill in both fields.");return;}
  const res=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})});
  const data=await res.json();
  if(!res.ok){showAuthError(data.error||"Login failed.");return;}
  player=data.profile;
  // Restore saved stats
  state.totalCorrect  = player.totalCorrect  || 0;
  state.totalWrong    = player.totalWrong    || 0;
  state.xp            = player.xp           || 0;
  state.bestStreak    = player.bestStreak    || 0;
  state.roundsPlayed  = player.roundsPlayed  || 0;
  updateHUD();
  renderProfileBar();
  renderPlayerHistory();
}

async function doRegister(){
  const username=document.getElementById("authUser").value.trim();
  const password=document.getElementById("authPass").value;
  if(!username||!password){showAuthError("Please fill in both fields.");return;}
  if(password.length<4){showAuthError("Password must be at least 4 characters.");return;}
  const res=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})});
  const data=await res.json();
  if(!res.ok){showAuthError(data.error||"Registration failed.");return;}
  showToast("Account created! Please log in.");
  renderAuth("login");
}

function logout(){
  saveStats();
  player=null;
  state={xp:0,streak:0,bestStreak:0,totalCorrect:0,totalWrong:0,roundsPlayed:0,roundNum:0,usedIds:[],questions:[],qIndex:0,answers:[],roundScore:0,leveledUp:false,prevLevel:null};
  document.getElementById("hud").style.display="none";
  document.getElementById("profileBar").style.display="none";
  renderAuth("login");
}

// ── Player history screen (shown right after login) ─────────────────────
function renderPlayerHistory(){
  const acc=(state.totalCorrect+state.totalWrong)>0
    ? Math.round(state.totalCorrect/(state.totalCorrect+state.totalWrong)*100):0;
  const{current}=getLevel(state.xp);
  render(\`
    <div class="history-card">
      <h3>WELCOME BACK, \${player.username.toUpperCase()}</h3>
      <div class="history-grid">
        <div class="history-stat"><div class="val" style="color:var(--green)">\${state.totalCorrect}</div><div class="lbl">CORRECT</div></div>
        <div class="history-stat"><div class="val" style="color:var(--red)">\${state.totalWrong}</div><div class="lbl">WRONG</div></div>
        <div class="history-stat"><div class="val">\${state.roundsPlayed}</div><div class="lbl">ROUNDS PLAYED</div></div>
        <div class="history-stat"><div class="val">\${state.bestStreak}🔥</div><div class="lbl">BEST STREAK</div></div>
      </div>
      <div class="history-accuracy">All-time accuracy: <span>\${acc}%</span></div>
      <div class="history-accuracy" style="margin-bottom:0">Current rank: <span style="color:\${current.color}">\${current.title}</span> (Lv.\${current.level})</div>
    </div>
    <div class="history-stat" style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:10px 16px;text-align:center;margin-bottom:16px;font-size:13px;color:var(--muted);">
      🔑 Total logins: <strong style="color:var(--gold)">\${player.totalLogins}</strong>
    </div>
    <button class="btn-primary" onclick="startRound()">START PLAYING →</button>\`);
}

// ── Game ────────────────────────────────────────────────────────────────
async function startRound(){
  render('<div class="loading"><div class="spinner"></div>Loading questions from the Archives…</div>');
  const usedParam=state.usedIds.join(",");
  const res=await fetch("/api/trivia?used="+usedParam);
  const qs=await res.json();
  state.questions=qs;
  state.qIndex=0;
  state.answers=new Array(qs.length).fill(null);
  state.roundScore=0;
  state.roundNum++;
  state.leveledUp=false;
  state.prevLevel=getLevel(state.xp).current;
  state.usedIds.push(...qs.map(q=>q.id));
  if(state.usedIds.length>28)state.usedIds=[];
  renderQuestion();
}

function dotsHTML(){
  return state.questions.map((_,i)=>{
    let cls="dot";
    if(state.answers[i]===true)cls+=" answered-correct";
    if(state.answers[i]===false)cls+=" answered-wrong";
    if(state.answers[i]===null&&i===state.qIndex)cls+=" current";
    return'<div class="'+cls+'"></div>';
  }).join("");
}

function renderQuestion(){
  const q=state.questions[state.qIndex];
  const answered=state.answers[state.qIndex]!==null;
  const letters=["A","B","C","D"];
  const catCls="cat-badge cat-"+q.category.replace(/ /g,"\\ ");
  const optionsHTML=q.options.map((opt,i)=>{
    let cls="opt-btn";
    if(answered){if(i===q.answer)cls+=" correct";else if(i===state._lastChosen&&i!==q.answer)cls+=" wrong";}
    return\`<button class="\${cls}" \${answered?"disabled":""} onclick="chooseAnswer(\${i})"><span class="opt-letter">\${letters[i]}</span>\${opt}</button>\`;
  }).join("");
  let feedbackHTML="";
  if(answered){
    const correct=state.answers[state.qIndex]===true;
    const xpEarned=correct?xpForAnswer(state.streak):0;
    feedbackHTML=\`<div class="feedback-row \${correct?"correct-fb":"wrong-fb"}">\${correct?"✓ Correct!":"✗ Answer: <strong>"+q.options[q.answer]+"</strong>"}\${correct?'<span class="xp-gain">+'+xpEarned+' XP</span>':""}</div>\`;
  }
  render(\`
    <div class="round-info"><span>Round <strong>\${state.roundNum}</strong> · Q\${state.qIndex+1}/10</span><div class="progress-dots">\${dotsHTML()}</div></div>
    <div class="question-card"><span class="\${catCls}">\${q.category}</span><div class="question-text">\${q.question}</div><div class="options">\${optionsHTML}</div>\${feedbackHTML}</div>
    \${answered?'<button class="btn-primary" onclick="nextStep()">'+(state.qIndex<state.questions.length-1?"NEXT QUESTION →":"SEE RESULTS →")+"</button>":""}\`);
}

function chooseAnswer(chosen){
  if(state.answers[state.qIndex]!==null)return;
  const q=state.questions[state.qIndex];
  const correct=chosen===q.answer;
  state._lastChosen=chosen;
  state.answers[state.qIndex]=correct;
  if(correct){
    state.streak++;
    state.bestStreak=Math.max(state.bestStreak,state.streak);
    state.totalCorrect++;
    state.roundScore++;
    const earned=xpForAnswer(state.streak);
    state.xp+=earned;
    if(state.streak>1)showToast("🔥 "+state.streak+"x Streak! +"+earned+" XP");
    const newLevel=getLevel(state.xp).current;
    if(newLevel.level>state.prevLevel.level){state.leveledUp=true;state.prevLevel=newLevel;}
  }else{
    state.streak=0;
    state.totalWrong++;
  }
  updateHUD();
  renderProfileBar();
  saveStats();
  renderQuestion();
}

function nextStep(){
  if(state.qIndex<state.questions.length-1){state.qIndex++;renderQuestion();}
  else renderSummary();
}

function renderSummary(){
  state.roundsPlayed++;
  const acc=(state.totalCorrect+state.totalWrong)>0
    ?Math.round(state.totalCorrect/(state.totalCorrect+state.totalWrong)*100):0;
  const{current}=getLevel(state.xp);
  const levelUpBanner=state.leveledUp
    ?\`<div class="level-up-banner">⚡ LEVEL UP! You are now a <strong>\${current.title}</strong>!</div>\`:"";
  render(\`
    <div class="summary-card">
      <h2>Round \${state.roundNum} Complete</h2>
      <div class="summary-score">\${state.roundScore}<span>/10</span></div>
      <div class="summary-verdict">\${verdict(state.roundScore)}</div>
      \${levelUpBanner}
      <div class="summary-stats">
        <div class="stat-box"><div class="stat-val">\${state.xp}</div><div class="stat-lbl">TOTAL XP</div></div>
        <div class="stat-box"><div class="stat-val">\${state.bestStreak}</div><div class="stat-lbl">BEST STREAK</div></div>
        <div class="stat-box"><div class="stat-val">\${acc}%</div><div class="stat-lbl">ALL-TIME ACC.</div></div>
      </div>
      <div class="summary-stats" style="grid-template-columns:repeat(2,1fr)">
        <div class="stat-box"><div class="stat-val" style="color:var(--green)">\${state.totalCorrect}</div><div class="stat-lbl">TOTAL CORRECT</div></div>
        <div class="stat-box"><div class="stat-val" style="color:var(--red)">\${state.totalWrong}</div><div class="stat-lbl">TOTAL WRONG</div></div>
      </div>
      <button class="btn-primary" onclick="startRound()">NEXT ROUND →</button>
      <button class="btn-secondary" onclick="renderPlayerHistory()">VIEW HISTORY</button>
    </div>\`);
  saveStats();
}

// ── Boot ────────────────────────────────────────────────────────────────
window.chooseAnswer=chooseAnswer;
window.nextStep=nextStep;
window.startRound=startRound;
window.doLogin=doLogin;
window.doRegister=doRegister;
window.renderAuth=renderAuth;
window.logout=logout;
window.renderPlayerHistory=renderPlayerHistory;

renderAuth("login");
</script>
</body>
</html>`;
}

// ── Router ────────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/register" && request.method === "POST") return handleRegister(request, env);
    if (url.pathname === "/api/login"    && request.method === "POST") return handleLogin(request, env);
    if (url.pathname === "/api/save"     && request.method === "POST") return handleSave(request, env);
    if (url.pathname === "/api/trivia")  return triviaHandler(request);

    return new Response(getHTML(), {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  },
};