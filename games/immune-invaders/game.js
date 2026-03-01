// =============================================================
//  IMMUNE INVADERS — game.js
//  Pure canvas Space Invaders with immune system biology.
// =============================================================

const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

// --- Logical dimensions (HiDPI-aware) ---
const W   = 600;
const H   = 680;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

canvas.width  = W * DPR;
canvas.height = H * DPR;
canvas.style.width  = W + 'px';
canvas.style.height = H + 'px';
ctx.scale(DPR, DPR);

// --- Constants ---
const PLAYER_SPEED    = 290;   // px/sec
const BULLET_SPEED    = 500;   // px/sec upward
const FIRE_COOLDOWN   = 0.32;  // sec between shots
const PLAYER_Y        = H - 58;
const DROP_AMOUNT     = 20;    // px dropped per wall-hit
const POWERUP_SPEED   = 85;    // px/sec downward
const POWERUP_CHANCE  = 0.18;  // per kill

// --- Ammo ---
const AMMO_START              = 20;
const AMMO_PER_PICKUP         = 5;
const AMMO_DROP_CHANCE        = 0.38;  // per kill
const RANDOM_AMMO_INTERVAL    = [9, 16]; // [min, max] seconds between random mRNA drops

// --- Enemy shooting ---
const ENEMY_BULLET_SPEED_BASE    = 195;  // px/sec downward, scales with wave
const ENEMY_SHOOT_INTERVAL_BASE  = 2.8;  // seconds between shots, shrinks per wave

// --- Virus config ---
const VIRUS = {
  coronavirus:   { hp: 3, pts: 30,  radius: 22, color: '#ef4444', glow: 'rgba(239,68,68,0.35)',  label: 'Coronavirus'  },
  influenza:     { hp: 2, pts: 50,  radius: 19, color: '#f97316', glow: 'rgba(249,115,22,0.35)', label: 'Influenza'    },
  bacteriophage: { hp: 1, pts: 100, radius: 16, color: '#a855f7', glow: 'rgba(168,85,247,0.35)', label: 'T4 Phage'    },
};

// --- Biology facts shown between waves ---
const FACTS = [
  'Coronaviruses use spike proteins to bind ACE2 receptors on human cells.',
  'Influenza mutates rapidly — that\'s why the flu shot changes every year.',
  'T4 bacteriophages only infect E. coli, not human cells.',
  'Neutrophils are the most abundant white blood cells in the body.',
  'Antibodies neutralize viruses by blocking their receptor-binding sites.',
  'Interferons warn neighboring cells of viral infection before it spreads.',
  'The complement system punches holes in pathogen membranes through lysis.',
  'Cytokine signals recruit immune cells to the site of infection.',
  'A neutrophil can engulf 5–20 bacteria before it dies.',
  'Viruses cannot reproduce alone — they hijack host cell machinery.',
];

// =============================================================
//  STATE
// =============================================================

let state = {};

function initState() {
  return {
    phase: 'menu',      // menu | playing | paused | wave_clear | game_over
    wave:  1,
    score: 0,
    highScore: parseInt(localStorage.getItem('ii-hs') || '0'),
    health:    3,
    maxHealth: 3,

    player: { x: W / 2, y: PLAYER_Y, w: 48, h: 36 },

    enemies:          [],
    projectiles:      [],
    enemyProjectiles: [],   // viral shots coming downward
    powerups:         [],
    particles:        [],

    formation: { dir: 1, dropPending: false },

    timers: { interferon: 0, cytokine: 0 },
    fireCooldown:    0,
    enemyShootTimer:  1.5,  // delay before first enemy shot
    ammoEmptyTimer:   0,
    randomAmmoTimer:  10,   // seconds until next random mRNA drop
    keys: {},

    ammo:    AMMO_START,

    hitFlash: 0,          // whole-screen red flash on infection
    factIdx:  0,
  };
}

// =============================================================
//  INPUT
// =============================================================

function setupInput() {
  document.addEventListener('keydown', e => {
    state.keys[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      if      (state.phase === 'menu')       startGame();
      else if (state.phase === 'wave_clear') beginNextWave();
      else if (state.phase === 'game_over')  resetToMenu();
    }
    if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
  });
  document.addEventListener('keyup', e => { state.keys[e.code] = false; });
}

// =============================================================
//  DRAWING — VIRUSES
// =============================================================

function drawCoronavirus(cx, cy, radius, flash = 0) {
  const r = radius;
  ctx.save();

  // Ambient glow
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r + 16);
  g.addColorStop(0, 'rgba(239,68,68,0.18)');
  g.addColorStop(1, 'rgba(239,68,68,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, r + 16, 0, Math.PI * 2); ctx.fill();

  // Spike proteins (12 evenly-spaced clubs)
  const spikes = 12;
  for (let i = 0; i < spikes; i++) {
    const a   = (i / spikes) * Math.PI * 2;
    const sx  = cx + Math.cos(a) * (r - 1);
    const sy  = cy + Math.sin(a) * (r - 1);
    const ex  = cx + Math.cos(a) * (r + 11);
    const ey  = cy + Math.sin(a) * (r + 11);

    ctx.strokeStyle = flash > 0 ? '#fff' : '#f87171';
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();

    ctx.fillStyle = flash > 0 ? '#fff' : '#fca5a5';
    ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, Math.PI * 2); ctx.fill();
  }

  // Body
  ctx.fillStyle   = flash > 0 ? '#fff' : '#ef4444';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  // Internal shadow highlight
  ctx.fillStyle = flash > 0 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.arc(cx - r * 0.28, cy - r * 0.22, r * 0.44, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

function drawInfluenza(cx, cy, radius, flash = 0) {
  const r = radius;
  ctx.save();

  // Glow
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r + 14);
  g.addColorStop(0, 'rgba(249,115,22,0.18)');
  g.addColorStop(1, 'rgba(249,115,22,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, r + 14, 0, Math.PI * 2); ctx.fill();

  const base  = flash > 0 ? '#fff' : '#f97316';
  const light = flash > 0 ? '#fff' : '#fdba74';

  // Hemagglutinin — 6 rod + triangle spikes
  for (let i = 0; i < 6; i++) {
    const a  = (i / 6) * Math.PI * 2 + 0.18;
    const sx = cx + Math.cos(a) * (r - 1);
    const sy = cy + Math.sin(a) * (r - 1);
    const ex = cx + Math.cos(a) * (r + 12);
    const ey = cy + Math.sin(a) * (r + 12);

    ctx.strokeStyle = base; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();

    // Triangular head
    const px = -Math.sin(a) * 4.5;
    const py =  Math.cos(a) * 4.5;
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.moveTo(ex + px, ey + py);
    ctx.lineTo(ex - px, ey - py);
    ctx.lineTo(cx + Math.cos(a) * (r + 19), cy + Math.sin(a) * (r + 19));
    ctx.closePath(); ctx.fill();
  }

  // Neuraminidase — 6 mushroom spikes (offset by 30°)
  for (let i = 0; i < 6; i++) {
    const a  = (i / 6) * Math.PI * 2 + (Math.PI / 6) + 0.18;
    const sx = cx + Math.cos(a) * (r - 1);
    const sy = cy + Math.sin(a) * (r - 1);
    const ex = cx + Math.cos(a) * (r + 10);
    const ey = cy + Math.sin(a) * (r + 10);

    ctx.strokeStyle = base; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();

    ctx.fillStyle = light;
    ctx.beginPath(); ctx.arc(ex, ey, 4.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = flash > 0 ? '#fff' : 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, Math.PI * 2); ctx.fill();
  }

  // Body
  ctx.fillStyle = base;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = flash > 0 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.22, r * 0.4, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

function drawBacteriophage(cx, cy, flash = 0) {
  // Fixed geometry (not radius-scaled) to preserve proportions
  const base  = flash > 0 ? '#fff' : '#a855f7';
  const light = flash > 0 ? '#fff' : '#d8b4fe';

  ctx.save();

  // Glow
  const g = ctx.createRadialGradient(cx, cy - 12, 0, cx, cy, 38);
  g.addColorStop(0, 'rgba(168,85,247,0.18)');
  g.addColorStop(1, 'rgba(168,85,247,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, 38, 0, Math.PI * 2); ctx.fill();

  // --- Icosahedral head (elongated hexagon) ---
  const headCY = cy - 18;
  const headRX = 13;
  const headRY = 16;

  ctx.fillStyle   = base;
  ctx.strokeStyle = light;
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a  = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(a) * headRX;
    const py = headCY + Math.sin(a) * headRY;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Capsid detail lines
  ctx.strokeStyle = light; ctx.globalAlpha = 0.35; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - headRX * 0.6, headCY - headRY * 0.4);
  ctx.lineTo(cx + headRX * 0.6, headCY + headRY * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + headRX * 0.6, headCY - headRY * 0.4);
  ctx.lineTo(cx - headRX * 0.6, headCY + headRY * 0.1);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // --- Collar ---
  const collarY = headCY + headRY + 1;
  ctx.fillStyle = light;
  ctx.fillRect(cx - 7, collarY, 14, 5);

  // --- Tail sheath ---
  const tailY = collarY + 5;
  const tailH = 18;
  ctx.fillStyle = base;
  ctx.fillRect(cx - 5, tailY, 10, tailH);

  // Sheath striations
  ctx.strokeStyle = light; ctx.globalAlpha = 0.4; ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - 5, tailY + i * (tailH / 4));
    ctx.lineTo(cx + 5, tailY + i * (tailH / 4));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // --- Base plate ---
  const baseY = tailY + tailH;
  ctx.fillStyle = light;
  ctx.fillRect(cx - 10, baseY, 20, 5);

  // --- Tail fibers (6, angled outward) ---
  const fiberDegrees = [-52, -28, -8, 8, 28, 52];
  ctx.strokeStyle = base; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  for (const deg of fiberDegrees) {
    const rad = (deg * Math.PI) / 180;
    const tipX = cx + Math.sin(rad) * 16;
    const tipY = baseY + 12;
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(rad) * 10, baseY + 5);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    ctx.fillStyle = light;
    ctx.beginPath(); ctx.arc(tipX, tipY, 2, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

// =============================================================
//  DRAWING — PLAYER (Neutrophil)
// =============================================================

function drawNeutrophil(cx, cy) {
  ctx.save();

  // Cell glow
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
  g.addColorStop(0, 'rgba(56,189,248,0.12)');
  g.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();

  // Cell body
  ctx.fillStyle   = '#1e3a5f';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth   = 2;
  ctx.beginPath(); ctx.ellipse(cx, cy, 23, 18, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Multi-lobed nucleus (3 overlapping ellipses)
  ctx.fillStyle = '#1e40af';
  const lobes = [
    { dx: -8, dy: 2,  rx: 7,  ry: 8  },
    { dx:  0, dy: -3, rx: 7.5, ry: 6.5 },
    { dx:  8, dy: 2,  rx: 7,  ry: 8  },
  ];
  for (const l of lobes) {
    ctx.beginPath(); ctx.ellipse(cx + l.dx, cy + l.dy, l.rx, l.ry, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(56,189,248,0.45)'; ctx.lineWidth = 1;
  for (const l of lobes) {
    ctx.beginPath(); ctx.ellipse(cx + l.dx, cy + l.dy, l.rx, l.ry, 0, 0, Math.PI * 2); ctx.stroke();
  }

  // Granules
  ctx.fillStyle = 'rgba(147,197,253,0.55)';
  for (const [gx, gy] of [[-14,-5],[12,-7],[-10,10],[14,8],[0,13],[-3,-12]]) {
    ctx.beginPath(); ctx.arc(cx + gx, cy + gy, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

// =============================================================
//  DRAWING — ANTIBODY PROJECTILE
// =============================================================

function drawAntibody(x, y) {
  ctx.save();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth   = 2.5;
  ctx.lineCap     = 'round';

  // Fc stem (downward)
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 10); ctx.stroke();

  // Hinge
  ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y); ctx.stroke();

  // Left Fab
  ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x - 12, y - 10); ctx.stroke();
  ctx.fillStyle = '#7dd3fc';
  ctx.beginPath(); ctx.arc(x - 12, y - 11, 3.5, 0, Math.PI * 2); ctx.fill();

  // Right Fab
  ctx.beginPath(); ctx.moveTo(x + 7, y); ctx.lineTo(x + 12, y - 10); ctx.stroke();
  ctx.fillStyle = '#7dd3fc';
  ctx.beginPath(); ctx.arc(x + 12, y - 11, 3.5, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// =============================================================
//  DRAWING — VIRAL PROJECTILE (enemy shot)
// =============================================================

function drawViralProjectile(x, y) {
  ctx.save();
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur  = 10;
  // Outer glow orb
  ctx.fillStyle = 'rgba(239,68,68,0.35)';
  ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
  // Core
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  // Hot center
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath(); ctx.arc(x, y - 1, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// =============================================================
//  DRAWING — POWER-UPS
// =============================================================

const POWERUP_STYLE = {
  interferon: { color: '#38bdf8', label: 'IFN-α' },
  complement:  { color: '#f97316', label: 'C3b'  },
  cytokine:    { color: '#22c55e', label: 'IL-2'  },
  ammo:        { color: '#facc15', label: 'mRNA'  },
};

function drawPowerup(pu) {
  const s = POWERUP_STYLE[pu.type];
  ctx.save();
  ctx.shadowColor = s.color; ctx.shadowBlur = 12;
  ctx.strokeStyle = s.color; ctx.lineWidth = 1.5;
  ctx.fillStyle   = 'rgba(15,23,42,0.85)';
  ctx.beginPath(); ctx.arc(pu.x, pu.y, 14, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur  = 0;
  ctx.fillStyle   = s.color;
  ctx.font        = 'bold 7px "Segoe UI", system-ui';
  ctx.textAlign   = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(s.label, pu.x, pu.y);
  ctx.restore();
}

// =============================================================
//  DRAWING — PARTICLES
// =============================================================

function spawnParticles(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 55 + Math.random() * 120;
    state.particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      r:  2 + Math.random() * 3,
      life: 1,
      decay: 0.7 + Math.random() * 0.9,
      color,
    });
  }
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x  += p.vx * dt;
    p.y  += p.vy * dt;
    p.vy += 55 * dt;   // light gravity
    p.life -= p.decay * dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle   = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// =============================================================
//  BACKGROUND
// =============================================================

function drawBackground() {
  ctx.fillStyle = '#050d1a';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid — cell membrane feel
  ctx.strokeStyle = 'rgba(56,189,248,0.04)';
  ctx.lineWidth   = 1;
  for (let x = 0; x < W; x += 44) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 44) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

// =============================================================
//  FORMATION BUILDER
// =============================================================

function buildFormation(wave) {
  let types;
  if      (wave <= 2) types = ['coronavirus'];
  else if (wave <= 4) types = ['coronavirus', 'influenza'];
  else                types = ['coronavirus', 'influenza', 'bacteriophage'];

  const rows     = Math.min(2 + wave, 6);
  const cols     = wave <= 2 ? 5 : 6;
  const spacingX = wave <= 2 ? 76 : 68;
  const spacingY = 56;
  const startX   = (W - (cols - 1) * spacingX) / 2;
  const startY   = 68;

  const enemies = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Top rows = hardest enemy type (bacteriophage), bottom = easiest (coronavirus)
      const typeIdx = Math.min(Math.floor((row / rows) * types.length), types.length - 1);
      const type    = types[typeIdx];

      enemies.push({
        x: startX + col * spacingX,
        y: startY + row * spacingY,
        type,
        hp: VIRUS[type].hp,
        hitFlash: 0,
        dead: false,
      });
    }
  }
  return enemies;
}

function formationBounds() {
  let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const e of state.enemies) {
    if (e.dead) continue;
    const r = VIRUS[e.type].radius || 20;
    minX = Math.min(minX, e.x - r);
    maxX = Math.max(maxX, e.x + r);
    maxY = Math.max(maxY, e.y + (e.type === 'bacteriophage' ? 34 : r));
  }
  return { minX, maxX, maxY };
}

// =============================================================
//  UPDATE
// =============================================================

function updateFormation(dt) {
  const living = state.enemies.filter(e => !e.dead);
  if (living.length === 0) return;

  // Speed scales up as enemies are eliminated
  const pct      = living.length / state.enemies.length;
  const killMult = 0.5 + (1 - pct) * 1.4;
  const waveMult = 1 + (state.wave - 1) * 0.12;
  const basePx   = 52;
  const ifrMult  = state.timers.interferon > 0 ? 0.3 : 1;
  const dx       = state.formation.dir * basePx * killMult * waveMult * ifrMult * dt;

  for (const e of living) {
    e.x += dx;
    if (state.formation.dropPending) e.y += DROP_AMOUNT;
    if (e.hitFlash > 0) e.hitFlash -= dt * 5;
  }
  state.formation.dropPending = false;

  const bounds = formationBounds();
  const margin = 28;
  if (bounds.maxX >= W - margin) {
    state.formation.dir = -1;
    state.formation.dropPending = true;
  } else if (bounds.minX <= margin) {
    state.formation.dir = 1;
    state.formation.dropPending = true;
  }

  // Viral entry — formation reached player
  if (bounds.maxY >= PLAYER_Y - 24) {
    triggerInfection();
  }
}

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const p = state.projectiles[i];
    p.y += p.vy * dt;

    if (p.y < -30) { state.projectiles.splice(i, 1); continue; }

    let hit = false;
    for (const e of state.enemies) {
      if (e.dead) continue;
      const r = VIRUS[e.type].radius || 18;
      if (Math.abs(p.x - e.x) < r + 5 && Math.abs(p.y - e.y) < r + 8) {
        e.hp--;
        e.hitFlash = 1;
        spawnParticles(e.x, e.y, VIRUS[e.type].color, 5);
        hit = true;

        if (e.hp <= 0) {
          e.dead = true;
          const pts = Math.round(VIRUS[e.type].pts * (1 + (state.wave - 1) * 0.15));
          state.score += pts;
          spawnParticles(e.x, e.y, VIRUS[e.type].color, 20);

          if (Math.random() < POWERUP_CHANCE) {
            const types = ['interferon', 'complement', 'cytokine'];
            state.powerups.push({
              x: e.x, y: e.y,
              type: types[Math.floor(Math.random() * types.length)],
            });
          } else if (Math.random() < AMMO_DROP_CHANCE) {
            state.powerups.push({ x: e.x, y: e.y, type: 'ammo' });
          }
        }
        break;
      }
    }
    if (hit) state.projectiles.splice(i, 1);
  }
}

function updatePowerups(dt) {
  for (let i = state.powerups.length - 1; i >= 0; i--) {
    const pu = state.powerups[i];
    pu.y += POWERUP_SPEED * dt;

    if (pu.y > H + 20) { state.powerups.splice(i, 1); continue; }

    const pw = state.player.w * 0.55;
    if (Math.abs(pu.x - state.player.x) < pw && Math.abs(pu.y - state.player.y) < 26) {
      collectPowerup(pu.type, pu.x, pu.y);
      state.powerups.splice(i, 1);
    }
  }

  if (state.timers.interferon > 0) state.timers.interferon -= dt;
  if (state.timers.cytokine   > 0) state.timers.cytokine   -= dt;
}

function collectPowerup(type, x, y) {
  spawnParticles(x, y, POWERUP_STYLE[type].color, 12);
  if (type === 'interferon') {
    state.timers.interferon = 5;
    showToast('Interferon released — viral spread slowed!');
  } else if (type === 'complement') {
    complementBurst();
    showToast('Complement C3b activated — membrane lysis!');
  } else if (type === 'cytokine') {
    state.timers.cytokine = 8;
    showToast('Cytokine signal — helper T-cell recruited!');
  } else if (type === 'ammo') {
    state.ammo = Math.min(state.ammo + AMMO_PER_PICKUP, 40);
    state.ammoEmptyTimer = 0;  // allow immediate retry if was empty
    showToast(`mRNA collected — +${AMMO_PER_PICKUP} antibodies!`);
  }
}

function updateEnemyShooting(dt) {
  // --- Spawn new enemy shots ---
  state.enemyShootTimer -= dt;
  if (state.enemyShootTimer <= 0) {
    const living = state.enemies.filter(e => !e.dead);
    if (living.length > 0) {
      // Prefer enemies lowest on screen (closest to player)
      const sorted = [...living].sort((a, b) => b.y - a.y);
      const poolSize = Math.max(1, Math.floor(sorted.length * 0.35));
      const shooter  = sorted[Math.floor(Math.random() * poolSize)];
      const speed    = ENEMY_BULLET_SPEED_BASE + (state.wave - 1) * 22;
      state.enemyProjectiles.push({ x: shooter.x, y: shooter.y, vy: speed });

      // On higher waves, occasionally fire a second simultaneous shot
      const extraChance = Math.min(0.6, (state.wave - 3) * 0.12);
      if (state.wave >= 3 && Math.random() < extraChance) {
        const shooter2 = sorted[Math.floor(Math.random() * poolSize)];
        state.enemyProjectiles.push({ x: shooter2.x, y: shooter2.y, vy: speed });
      }
    }

    // Interval shrinks each wave: 2.8s → ~0.6s by wave 9
    const interval = Math.max(0.6, ENEMY_SHOOT_INTERVAL_BASE - (state.wave - 1) * 0.24);
    state.enemyShootTimer = interval * (0.55 + Math.random() * 0.9);
  }

  // --- Random periodic mRNA drops ---
  state.randomAmmoTimer -= dt;
  if (state.randomAmmoTimer <= 0) {
    const dropX = 30 + Math.random() * (W - 60);
    state.powerups.push({ x: dropX, y: -14, type: 'ammo' });
    const [lo, hi] = RANDOM_AMMO_INTERVAL;
    state.randomAmmoTimer = lo + Math.random() * (hi - lo);
  }

  // --- Move enemy projectiles & collide with player ---
  for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
    const p = state.enemyProjectiles[i];
    p.y += p.vy * dt;

    if (p.y > H + 20) { state.enemyProjectiles.splice(i, 1); continue; }

    if (Math.abs(p.x - state.player.x) < 22 && Math.abs(p.y - state.player.y) < 20) {
      state.enemyProjectiles.splice(i, 1);
      spawnParticles(state.player.x, state.player.y, '#ef4444', 10);
      state.health--;
      state.hitFlash = 1;
      if (state.health <= 0) endGame();
    }
  }
}

function complementBurst() {
  const living = state.enemies.filter(e => !e.dead);
  if (living.length === 0) return;
  const center = living[Math.floor(Math.random() * living.length)];
  spawnParticles(center.x, center.y, '#f97316', 35);
  for (const e of living) {
    if (Math.hypot(e.x - center.x, e.y - center.y) < 95) {
      e.dead = true;
      state.score += Math.round(VIRUS[e.type].pts * (1 + (state.wave - 1) * 0.15));
      spawnParticles(e.x, e.y, VIRUS[e.type].color, 10);
    }
  }
}

function triggerInfection() {
  // Kill the viruses that crossed the line
  for (const e of state.enemies) {
    if (!e.dead && e.y + (e.type === 'bacteriophage' ? 34 : VIRUS[e.type].radius) >= PLAYER_Y - 24) {
      e.dead = true;
      spawnParticles(e.x, e.y, VIRUS[e.type].color, 8);
    }
  }

  state.health--;
  state.hitFlash = 1;

  if (state.health <= 0) endGame();
}

function fireProjectile() {
  if (state.fireCooldown > 0) return;
  if (state.ammo <= 0) {
    if (state.ammoEmptyTimer <= 0) {
      showToast('No antibodies left — collect mRNA drops!');
      state.ammoEmptyTimer = 2.5;
    }
    return;
  }
  state.ammo--;
  const cooldown = state.timers.cytokine > 0 ? FIRE_COOLDOWN * 0.38 : FIRE_COOLDOWN;
  state.fireCooldown = cooldown;
  state.projectiles.push({ x: state.player.x, y: state.player.y - 22, vy: -BULLET_SPEED });
}

// =============================================================
//  HUD
// =============================================================

function drawHUD() {
  const F = (t, s = 13) => { ctx.font = `${s}px "Segoe UI", system-ui`; ctx.fillStyle = t; };

  // Wave / score
  F('#64748b'); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(`WAVE ${state.wave}`, 16, 14);

  F('#e2e8f0', 22); ctx.font = 'bold 22px "Segoe UI", system-ui';
  ctx.fillText(state.score.toLocaleString(), 16, 30);

  F('#475569', 11); ctx.font = '11px "Segoe UI", system-ui';
  ctx.fillText(`BEST  ${state.highScore.toLocaleString()}`, 16, 56);

  // Ammo counter
  const ammoColor = state.ammo === 0 ? '#ef4444' : state.ammo <= 5 ? '#f97316' : '#facc15';
  F(ammoColor, 11); ctx.font = '11px "Segoe UI", system-ui'; ctx.textAlign = 'left';
  ctx.fillText(`AMMO  ${state.ammo}`, 16, 72);

  // Health circles (cell membrane integrity)
  ctx.textAlign = 'right';
  F('#64748b', 11); ctx.font = '11px "Segoe UI", system-ui';
  ctx.fillText('CELL INTEGRITY', W - 16, 14);

  for (let i = 0; i < state.maxHealth; i++) {
    const alive = i < state.health;
    const hx    = W - 16 - (state.maxHealth - 1 - i) * 28;
    ctx.fillStyle   = alive ? '#38bdf8' : '#1e293b';
    ctx.strokeStyle = alive ? '#38bdf8' : '#334155';
    ctx.lineWidth   = 1.5;
    ctx.beginPath(); ctx.arc(hx, 36, 9, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    if (alive) {
      ctx.fillStyle = '#0f172a'; ctx.font = 'bold 9px "Segoe UI", system-ui';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('N', hx, 36);
      ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    }
  }

  // Active power-up timers
  let timerY = 58;
  if (state.timers.interferon > 0) {
    F('#38bdf8', 11); ctx.font = '11px "Segoe UI", system-ui'; ctx.textAlign = 'right';
    ctx.fillText(`IFN  ${state.timers.interferon.toFixed(1)}s`, W - 16, timerY);
    timerY += 16;
  }
  if (state.timers.cytokine > 0) {
    F('#22c55e', 11); ctx.font = '11px "Segoe UI", system-ui'; ctx.textAlign = 'right';
    ctx.fillText(`CK   ${state.timers.cytokine.toFixed(1)}s`, W - 16, timerY);
  }

  // Infection flash overlay
  if (state.hitFlash > 0) {
    ctx.fillStyle = `rgba(239,68,68,${state.hitFlash * 0.32})`;
    ctx.fillRect(0, 0, W, H);
    state.hitFlash = Math.max(0, state.hitFlash - 0.04);
  }
}

// =============================================================
//  OVERLAY SCREENS
// =============================================================

function drawMenu() {
  drawBackground();

  // Title
  ctx.fillStyle = '#38bdf8';
  ctx.font      = 'bold 40px "Segoe UI", system-ui';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('IMMUNE INVADERS', W / 2, H * 0.18);

  ctx.fillStyle = '#94a3b8';
  ctx.font      = '14px "Segoe UI", system-ui';
  ctx.fillText('Defend the cell. Neutralize the threat.', W / 2, H * 0.255);

  // Enemy showcase
  const showcaseY = H * 0.44;
  drawCoronavirus(W / 2 - 120, showcaseY, 22);
  drawInfluenza(W / 2, showcaseY, 19);
  drawBacteriophage(W / 2 + 120, showcaseY - 10);

  ctx.fillStyle = '#475569'; ctx.font = '11px "Segoe UI", system-ui';
  ctx.fillText('Coronavirus',  W / 2 - 120, showcaseY + 36);
  ctx.fillText('Influenza',    W / 2,       showcaseY + 36);
  ctx.fillText('T4 Phage',    W / 2 + 120, showcaseY + 36);

  // Controls
  ctx.fillStyle = '#334155'; ctx.font = '12px "Segoe UI", system-ui';
  ctx.fillText('← → or A D  ·  SPACE to shoot  ·  P to pause', W / 2, H * 0.65);
  ctx.fillStyle = '#1e3a5f'; ctx.font = '11px "Segoe UI", system-ui';
  ctx.fillText('Kill viruses to collect mRNA ammo drops  ·  Evade viral shots', W / 2, H * 0.70);

  // Blink prompt
  if (Math.floor(Date.now() / 520) % 2 === 0) {
    ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 17px "Segoe UI", system-ui';
    ctx.fillText('PRESS SPACE TO DEPLOY', W / 2, H * 0.8);
  }
}

function drawWaveClear() {
  ctx.fillStyle = 'rgba(5,13,26,0.86)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#22c55e'; ctx.font = 'bold 30px "Segoe UI", system-ui';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`WAVE ${state.wave - 1} CLEARED`, W / 2, H * 0.28);

  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 18px "Segoe UI", system-ui';
  ctx.fillText(state.score.toLocaleString() + ' pts', W / 2, H * 0.38);

  // Biology fact
  ctx.fillStyle = '#64748b'; ctx.font = '12px "Segoe UI", system-ui';
  ctx.fillText('— DID YOU KNOW —', W / 2, H * 0.50);

  ctx.fillStyle = '#94a3b8'; ctx.font = '14px "Segoe UI", system-ui';
  wrapText(FACTS[(state.wave - 2) % FACTS.length], W / 2, H * 0.57, W - 100, 22);

  if (Math.floor(Date.now() / 560) % 2 === 0) {
    ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 15px "Segoe UI", system-ui';
    ctx.fillText('PRESS SPACE TO CONTINUE', W / 2, H * 0.79);
  }
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(5,13,26,0.93)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ef4444'; ctx.font = 'bold 34px "Segoe UI", system-ui';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('INFECTION SUCCESSFUL', W / 2, H * 0.28);

  ctx.fillStyle = '#64748b'; ctx.font = '13px "Segoe UI", system-ui';
  ctx.fillText('The cell membrane was breached.', W / 2, H * 0.37);

  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 22px "Segoe UI", system-ui';
  ctx.fillText(state.score.toLocaleString() + ' pts', W / 2, H * 0.48);

  if (state.score > 0 && state.score >= state.highScore) {
    ctx.fillStyle = '#eab308'; ctx.font = 'bold 15px "Segoe UI", system-ui';
    ctx.fillText('NEW HIGH SCORE', W / 2, H * 0.57);
  } else {
    ctx.fillStyle = '#475569'; ctx.font = '13px "Segoe UI", system-ui';
    ctx.fillText(`BEST  ${state.highScore.toLocaleString()}`, W / 2, H * 0.57);
  }

  if (Math.floor(Date.now() / 560) % 2 === 0) {
    ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 15px "Segoe UI", system-ui';
    ctx.fillText('PRESS SPACE TO RETURN', W / 2, H * 0.74);
  }
}

function drawPaused() {
  ctx.fillStyle = 'rgba(5,13,26,0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 28px "Segoe UI", system-ui';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', W / 2, H / 2);
  ctx.fillStyle = '#475569'; ctx.font = '13px "Segoe UI", system-ui';
  ctx.fillText('P or ESC to resume', W / 2, H / 2 + 36);
}

// =============================================================
//  UTILITY
// =============================================================

function wrapText(text, x, y, maxWidth, lineH) {
  const words = text.split(' ');
  let line = '';
  let curY  = y;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      line = word; curY += lineH;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, curY);
}

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 2600);
}

function drawEnemies() {
  for (const e of state.enemies) {
    if (e.dead) continue;
    const f = Math.max(0, e.hitFlash);
    if      (e.type === 'coronavirus')   drawCoronavirus(e.x, e.y, VIRUS.coronavirus.radius, f);
    else if (e.type === 'influenza')     drawInfluenza(e.x, e.y, VIRUS.influenza.radius, f);
    else                                 drawBacteriophage(e.x, e.y, f);
  }
}

// =============================================================
//  GAME FLOW
// =============================================================

function startGame() {
  state = initState();
  state.phase   = 'playing';
  state.enemies = buildFormation(state.wave);
}

function beginNextWave() {
  if (state.phase !== 'wave_clear') return;
  state.enemies          = buildFormation(state.wave);
  state.projectiles      = [];
  state.enemyProjectiles = [];
  state.powerups         = [];
  state.formation        = { dir: 1, dropPending: false };
  state.enemyShootTimer  = 1.5;  // brief grace period at wave start
  state.randomAmmoTimer  = 10;   // first random drop ~10s into the wave
  // Hard reset ammo each wave; kills and random drops let players build surplus mid-wave
  state.ammo = AMMO_START;
  state.phase = 'playing';
}

function checkWaveDone() {
  if (state.phase !== 'playing') return;
  if (state.enemies.length > 0 && state.enemies.every(e => e.dead)) {
    if (state.score > state.highScore) {
      state.highScore = state.score;
      localStorage.setItem('ii-hs', String(state.highScore));
    }
    state.wave++;
    state.phase = 'wave_clear';
  }
}

function endGame() {
  if (state.score > state.highScore) {
    state.highScore = state.score;
    localStorage.setItem('ii-hs', String(state.highScore));
  }
  state.phase = 'game_over';
}

function resetToMenu() { state.phase = 'menu'; }

function togglePause() {
  if      (state.phase === 'playing') state.phase = 'paused';
  else if (state.phase === 'paused')  state.phase = 'playing';
}

// =============================================================
//  MAIN LOOP
// =============================================================

let lastTime = 0;

function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  if (state.phase === 'menu') {
    drawMenu();

  } else if (state.phase === 'playing') {
    // --- Input ---
    const hw = state.player.w * 0.5;
    if (state.keys['ArrowLeft'] || state.keys['KeyA'])
      state.player.x = Math.max(hw, state.player.x - PLAYER_SPEED * dt);
    if (state.keys['ArrowRight'] || state.keys['KeyD'])
      state.player.x = Math.min(W - hw, state.player.x + PLAYER_SPEED * dt);
    if (state.keys['Space']) fireProjectile();
    if (state.fireCooldown  > 0) state.fireCooldown  -= dt;
    if (state.ammoEmptyTimer > 0) state.ammoEmptyTimer -= dt;

    // --- Update ---
    updateFormation(dt);
    updateProjectiles(dt);
    updatePowerups(dt);
    updateEnemyShooting(dt);
    updateParticles(dt);
    checkWaveDone();

    // --- Draw ---
    drawBackground();
    drawEnemies();
    for (const p  of state.projectiles)      drawAntibody(p.x, p.y);
    for (const ep of state.enemyProjectiles)  drawViralProjectile(ep.x, ep.y);
    for (const pu of state.powerups)          drawPowerup(pu);
    drawParticles();
    drawNeutrophil(state.player.x, state.player.y);
    drawHUD();

  } else if (state.phase === 'wave_clear') {
    drawBackground();
    drawEnemies();
    drawParticles();
    drawNeutrophil(state.player.x, state.player.y);
    drawWaveClear();

  } else if (state.phase === 'paused') {
    drawBackground();
    drawEnemies();
    drawNeutrophil(state.player.x, state.player.y);
    drawPaused();

  } else if (state.phase === 'game_over') {
    drawBackground();
    drawGameOver();
  }

  requestAnimationFrame(loop);
}

// =============================================================
//  BOOT
// =============================================================

setupInput();
state = initState();
requestAnimationFrame(ts => { lastTime = ts; requestAnimationFrame(loop); });
