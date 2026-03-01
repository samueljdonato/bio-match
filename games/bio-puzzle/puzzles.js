// =============================================================
//  BIO PUZZLE — puzzles.js
//  Puzzle definitions + placeholder canvas drawing functions.
//  To swap in artist artwork:
//    1. Drop the file in games/bio-puzzle/images/
//    2. Set artFile: 'your-file.png' in the PUZZLES entry
// =============================================================

const PUZZLES = [
  // ── EASY ────────────────────────────────────────────────────
  {
    id: 'dna-helix',
    title: 'DNA Double Helix',
    difficulty: 'easy',
    description: 'A segment of the iconic double helix — the blueprint of life.',
    cols: 4, rows: 4,
    artFile: null,
    drawFn: drawDnaHelix,
  },
  {
    id: 'bacterial-cell',
    title: 'Bacterial Cell',
    difficulty: 'easy',
    description: 'A prokaryotic cell with cell wall, nucleoid, flagellum, and pili.',
    cols: 4, rows: 4,
    artFile: null,
    drawFn: drawBacterialCell,
  },
  {
    id: 'red-blood-cell',
    title: 'Red Blood Cell',
    difficulty: 'easy',
    description: 'The biconcave disc that ferries oxygen through the bloodstream.',
    cols: 4, rows: 4,
    artFile: null,
    drawFn: drawRedBloodCell,
  },
  // ── MEDIUM ──────────────────────────────────────────────────
  {
    id: 'nucleotide-pair',
    title: 'Nucleotide Base Pair',
    difficulty: 'medium',
    description: 'Adenine–Thymine hydrogen bonding — the language of DNA.',
    cols: 6, rows: 6,
    artFile: null,
    drawFn: drawNucleotidePair,
  },
  {
    id: 'mitochondria',
    title: 'Mitochondrion',
    difficulty: 'medium',
    description: 'Cross-section of the powerhouse of the cell.',
    cols: 6, rows: 6,
    artFile: null,
    drawFn: drawMitochondria,
  },
  {
    id: 'ribosome',
    title: 'Ribosome',
    difficulty: 'medium',
    description: 'The large and small subunits translating mRNA into protein.',
    cols: 6, rows: 6,
    artFile: null,
    drawFn: drawRibosome,
  },
  // ── HARD ────────────────────────────────────────────────────
  {
    id: 'eukaryotic-cell',
    title: 'Eukaryotic Cell',
    difficulty: 'hard',
    description: 'The full complexity of a eukaryotic cell and its organelles.',
    cols: 8, rows: 8,
    artFile: null,
    drawFn: drawEukaryoticCell,
  },
  {
    id: 'neuron',
    title: 'Neuron',
    difficulty: 'hard',
    description: 'A nerve cell with dendrites, axon, myelin sheaths, and synaptic terminal.',
    cols: 8, rows: 8,
    artFile: null,
    drawFn: drawNeuron,
  },
  {
    id: 'viral-cycle',
    title: 'Viral Infection Cycle',
    difficulty: 'hard',
    description: 'Five stages of viral replication — adsorption to lysis.',
    cols: 8, rows: 8,
    artFile: null,
    drawFn: drawViralCycle,
  },
];

// =============================================================
//  DRAWING FUNCTIONS
//  Each receives (ctx, w, h) — all coordinates must be
//  proportional to w/h so they scale from 80px thumbs to
//  400px puzzle source canvases.
// =============================================================

// ── EASY 1: DNA Double Helix ─────────────────────────────────
function drawDnaHelix(ctx, w, h) {
  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#051428');
  bg.addColorStop(1, '#0d1f3d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx     = w * 0.5;
  const ampX   = w * 0.19;
  const lw     = Math.max(1.5, w * 0.022);
  const dotR   = Math.max(2,   w * 0.028);
  const rungs  = 18;
  const steps  = 280;
  const period = Math.PI * 2 * 2.4;   // 2.4 full turns top→bottom

  // Base-pair rungs (behind strands)
  ctx.lineCap = 'round';
  for (let i = 0; i <= rungs; i++) {
    const t  = i / rungs;
    const y  = t * h;
    const x1 = cx + ampX * Math.sin(t * period);
    const x2 = cx + ampX * Math.sin(t * period + Math.PI);

    ctx.strokeStyle = 'rgba(148,163,184,0.38)';
    ctx.lineWidth   = Math.max(1, w * 0.009);
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();

    // Nucleotide dots
    const pairA = i % 4 < 2;
    ctx.fillStyle = pairA ? '#3b82f6' : '#f97316';
    ctx.beginPath(); ctx.arc(x1, y, dotR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pairA ? '#f97316' : '#3b82f6';
    ctx.beginPath(); ctx.arc(x2, y, dotR, 0, Math.PI * 2); ctx.fill();
  }

  // Strand 1
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = cx + ampX * Math.sin(t * period);
    const y = t * h;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = lw; ctx.stroke();

  // Strand 2
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = cx + ampX * Math.sin(t * period + Math.PI);
    const y = t * h;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = lw; ctx.stroke();

  // Labels (only for larger renders)
  if (w >= 160) {
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.font = `bold ${Math.round(w * 0.06)}px "Segoe UI", system-ui`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('DNA Double Helix', w / 2, h - w * 0.03);
  }
}

// ── EASY 2: Bacterial Cell ───────────────────────────────────
function drawBacterialCell(ctx, w, h) {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#071a10');
  bg.addColorStop(1, '#050d1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  const cx = w * 0.46, cy = h * 0.50;
  const rx = w * 0.30, ry = h * 0.20;

  // Cell wall (thick outer)
  ctx.strokeStyle = '#a16207'; ctx.lineWidth = Math.max(2, w * 0.025);
  ctx.beginPath(); ctx.ellipse(cx, cy, rx + w * 0.03, ry + h * 0.04, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Cell membrane
  ctx.strokeStyle = '#15803d'; ctx.lineWidth = Math.max(1.5, w * 0.016);
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Cytoplasm fill
  ctx.fillStyle = 'rgba(21,128,61,0.12)';
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();

  // Nucleoid region (irregular blob)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(56,189,248,0.18)';
  ctx.strokeStyle = 'rgba(56,189,248,0.45)';
  ctx.lineWidth = Math.max(1, w * 0.011);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 0.38, ry * 0.55, 0.3, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.restore();

  // Ribosomes
  ctx.fillStyle = '#f97316';
  const riboPos = [[-0.55,-0.6],[0.4,-0.7],[0.7,0.1],[-0.7,0.3],[0.1,0.8],
                   [-0.3,0.7],[0.6,0.55],[-0.55,0.1],[0.2,-0.3]];
  for (const [ox, oy] of riboPos) {
    ctx.beginPath();
    ctx.arc(cx + ox * rx * 0.85, cy + oy * ry * 0.85, Math.max(1.5, w * 0.012), 0, Math.PI * 2);
    ctx.fill();
  }

  // Pili (short bristles)
  ctx.strokeStyle = 'rgba(161,98,7,0.7)';
  ctx.lineWidth = Math.max(1, w * 0.008);
  const piliAngles = [0.2, 0.7, 1.4, 2.1, 2.8, 3.5, 4.2, 4.9, 5.6];
  for (const a of piliAngles) {
    const cos = Math.cos(a), sin = Math.sin(a);
    const bx = cx + cos * rx, by = cy + sin * ry;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + cos * w * 0.06, by + sin * h * 0.04);
    ctx.stroke();
  }

  // Flagellum
  ctx.strokeStyle = '#a16207'; ctx.lineWidth = Math.max(1.5, w * 0.013);
  ctx.lineCap = 'round';
  const flagStartX = cx - rx + w * 0.01, flagStartY = cy;
  ctx.beginPath();
  ctx.moveTo(flagStartX, flagStartY);
  ctx.bezierCurveTo(
    flagStartX - w * 0.14, flagStartY - h * 0.18,
    flagStartX - w * 0.22, flagStartY + h * 0.10,
    flagStartX - w * 0.30, flagStartY - h * 0.06
  );
  ctx.bezierCurveTo(
    flagStartX - w * 0.38, flagStartY - h * 0.22,
    flagStartX - w * 0.42, flagStartY + h * 0.04,
    flagStartX - w * 0.44, flagStartY - h * 0.02
  );
  ctx.stroke();
}

// ── EASY 3: Red Blood Cell ───────────────────────────────────
function drawRedBloodCell(ctx, w, h) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#1a0505');
  bg.addColorStop(1, '#0d0303');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5, cy = h * 0.5;
  const rx = w * 0.36, ry = h * 0.26;

  // Glow
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx * 1.3);
  glow.addColorStop(0, 'rgba(220,38,38,0.14)');
  glow.addColorStop(1, 'rgba(220,38,38,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx * 1.3, ry * 1.3, 0, 0, Math.PI * 2); ctx.fill();

  // Rim gradient
  const rim = ctx.createRadialGradient(cx - rx * 0.3, cy - ry * 0.4, 0, cx, cy, rx);
  rim.addColorStop(0,   '#ef4444');
  rim.addColorStop(0.55,'#dc2626');
  rim.addColorStop(1,   '#991b1b');
  ctx.fillStyle = rim;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();

  // Central biconcave depression
  const depR = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx * 0.45);
  depR.addColorStop(0,   '#7f1d1d');
  depR.addColorStop(0.6, '#991b1b');
  depR.addColorStop(1,   'rgba(153,27,27,0)');
  ctx.fillStyle = depR;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.45, ry * 0.55, 0, 0, Math.PI * 2); ctx.fill();

  // Edge highlight
  ctx.strokeStyle = 'rgba(252,165,165,0.35)';
  ctx.lineWidth   = Math.max(1.5, w * 0.018);
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();

  // Membrane detail ring
  ctx.strokeStyle = 'rgba(239,68,68,0.5)';
  ctx.lineWidth   = Math.max(1, w * 0.01);
  ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.78, ry * 0.78, 0, 0, Math.PI * 2); ctx.stroke();

  // Hemoglobin clusters
  ctx.fillStyle = 'rgba(127,29,29,0.7)';
  const hbPos = [[-0.3,-0.2],[0.3,-0.2],[-0.15,0.15],[0.2,0.18],[0,0]];
  for (const [ox, oy] of hbPos) {
    ctx.beginPath();
    ctx.arc(cx + ox * rx, cy + oy * ry, Math.max(2, w * 0.03), 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── MEDIUM 4: Nucleotide Base Pair ───────────────────────────
function drawNucleotidePair(ctx, w, h) {
  ctx.fillStyle = '#050d1a'; ctx.fillRect(0, 0, w, h);

  const mid = w * 0.5;
  const s   = w / 360; // scale factor (designed at 360px)

  // Helper: draw a ring (polygon)
  function ring(cx, cy, r, sides, rot, fill, stroke) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = rot + (i / sides) * Math.PI * 2;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1, 2 * s); ctx.stroke();
  }

  // Backbone lines (left + right)
  ctx.strokeStyle = '#334155'; ctx.lineWidth = Math.max(2, 4 * s);
  ctx.lineCap = 'round';
  // Left backbone
  ctx.beginPath();
  ctx.moveTo(mid - 130 * s, 20 * s);
  ctx.bezierCurveTo(mid - 140 * s, h * 0.5, mid - 125 * s, h * 0.5, mid - 130 * s, h - 20 * s);
  ctx.stroke();
  // Right backbone
  ctx.beginPath();
  ctx.moveTo(mid + 130 * s, 20 * s);
  ctx.bezierCurveTo(mid + 140 * s, h * 0.5, mid + 125 * s, h * 0.5, mid + 130 * s, h - 20 * s);
  ctx.stroke();

  // Adenine (left) — purine: hexagon fused with pentagon
  const ax = mid - 68 * s, ay = h * 0.5;
  ring(ax - 20 * s, ay, 38 * s, 6, -Math.PI / 6, 'rgba(59,130,246,0.25)', '#3b82f6');
  ring(ax + 24 * s, ay, 28 * s, 5, -Math.PI / 10, 'rgba(59,130,246,0.18)', '#60a5fa');
  ctx.fillStyle = '#93c5fd';
  ctx.font = `bold ${Math.round(16 * s)}px "Segoe UI", system-ui`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('A', ax, ay);

  // Thymine (right) — pyrimidine: single hexagon
  const tx = mid + 68 * s, ty = h * 0.5;
  ring(tx + 20 * s, ty, 38 * s, 6, -Math.PI / 6, 'rgba(249,115,22,0.25)', '#f97316');
  ctx.fillStyle = '#fdba74';
  ctx.font = `bold ${Math.round(16 * s)}px "Segoe UI", system-ui`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('T', tx + 20 * s, ty);

  // Hydrogen bonds (dashed lines)
  ctx.setLineDash([4 * s, 4 * s]);
  ctx.strokeStyle = 'rgba(148,163,184,0.6)'; ctx.lineWidth = Math.max(1, 1.5 * s);
  const bondY1 = h * 0.5 - 16 * s, bondY2 = h * 0.5 + 16 * s;
  for (const bY of [bondY1, h * 0.5, bondY2]) {
    ctx.beginPath();
    ctx.moveTo(mid - 12 * s, bY);
    ctx.lineTo(mid + 12 * s, bY);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Labels
  if (w >= 120) {
    ctx.font = `${Math.round(11 * s)}px "Segoe UI", system-ui`;
    ctx.fillStyle = 'rgba(148,163,184,0.65)';
    ctx.textAlign = 'center';
    ctx.fillText('Adenine', mid - 68 * s, h * 0.12);
    ctx.fillText('Thymine', mid + 68 * s, h * 0.12);
    ctx.fillText('H-bond', mid, h * 0.12);
    ctx.fillStyle = 'rgba(71,85,105,0.8)';
    ctx.fillText('Sugar–Phosphate', mid - 130 * s, h - 6 * s);
    ctx.fillText('Backbone', mid + 130 * s, h - 6 * s);
  }
}

// ── MEDIUM 5: Mitochondrion ──────────────────────────────────
function drawMitochondria(ctx, w, h) {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#1a0a00');
  bg.addColorStop(1, '#050d1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5, cy = h * 0.5;
  const orx = w * 0.42, ory = h * 0.30;

  // Outer membrane glow
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, orx * 1.1);
  glow.addColorStop(0, 'rgba(249,115,22,0.08)');
  glow.addColorStop(1, 'rgba(249,115,22,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.ellipse(cx, cy, orx * 1.2, ory * 1.2, 0, 0, Math.PI * 2); ctx.fill();

  // Outer membrane fill
  ctx.fillStyle = 'rgba(154,52,18,0.35)';
  ctx.beginPath(); ctx.ellipse(cx, cy, orx, ory, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c2410c'; ctx.lineWidth = Math.max(2, w * 0.018);
  ctx.beginPath(); ctx.ellipse(cx, cy, orx, ory, 0, 0, Math.PI * 2); ctx.stroke();

  // Intermembrane space
  const irx = orx * 0.82, iry = ory * 0.80;
  ctx.fillStyle = 'rgba(249,115,22,0.08)';
  ctx.beginPath(); ctx.ellipse(cx, cy, irx, iry, 0, 0, Math.PI * 2); ctx.fill();

  // Inner membrane
  ctx.strokeStyle = '#ea580c'; ctx.lineWidth = Math.max(1.5, w * 0.013);
  ctx.beginPath(); ctx.ellipse(cx, cy, irx, iry, 0, 0, Math.PI * 2); ctx.stroke();

  // Matrix fill
  ctx.fillStyle = 'rgba(124,45,18,0.35)';
  ctx.beginPath(); ctx.ellipse(cx, cy, irx - w * 0.015, iry - h * 0.015, 0, 0, Math.PI * 2); ctx.fill();

  // Cristae folds (wavy inner membranes)
  ctx.strokeStyle = '#f97316'; ctx.lineWidth = Math.max(1, w * 0.010);
  ctx.lineCap = 'round';
  const cristaCount = 5;
  for (let i = 0; i < cristaCount; i++) {
    const t  = (i + 0.5) / cristaCount;
    const x0 = cx - irx * 0.7 + t * irx * 1.4;
    const topY  = cy - iry * 0.6;
    const botY  = cy + iry * 0.6;
    const amp   = w * 0.05;
    ctx.beginPath();
    ctx.moveTo(x0, topY);
    ctx.bezierCurveTo(x0 + amp, topY + (botY - topY) * 0.33,
                      x0 - amp, topY + (botY - topY) * 0.66, x0, botY);
    ctx.stroke();
  }

  // ATP synthase dots on inner membrane
  ctx.fillStyle = '#fbbf24';
  const atpCount = 10;
  for (let i = 0; i < atpCount; i++) {
    const a = (i / atpCount) * Math.PI * 2;
    const px = cx + irx * Math.cos(a), py = cy + iry * Math.sin(a);
    ctx.beginPath(); ctx.arc(px, py, Math.max(2, w * 0.018), 0, Math.PI * 2); ctx.fill();
  }

  // Label
  if (w >= 120) {
    ctx.fillStyle = 'rgba(251,191,36,0.65)';
    ctx.font = `bold ${Math.round(w * 0.055)}px "Segoe UI", system-ui`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Mitochondrion', cx, cy + ory + h * 0.08);
  }
}

// ── MEDIUM 6: Ribosome ───────────────────────────────────────
function drawRibosome(ctx, w, h) {
  ctx.fillStyle = '#050d1a'; ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5, cy = h * 0.46;
  const s  = w / 360;

  // Large subunit (60S) — top oval
  const lsRx = 100 * s, lsRy = 68 * s, lsCy = cy - 38 * s;
  const lsGrad = ctx.createRadialGradient(cx - lsRx * 0.3, lsCy - lsRy * 0.3, 0, cx, lsCy, lsRx);
  lsGrad.addColorStop(0,   '#0e7490');
  lsGrad.addColorStop(0.6, '#0c4a6e');
  lsGrad.addColorStop(1,   '#082f49');
  ctx.fillStyle = lsGrad;
  ctx.beginPath(); ctx.ellipse(cx, lsCy, lsRx, lsRy, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = Math.max(1.5, 2 * s);
  ctx.beginPath(); ctx.ellipse(cx, lsCy, lsRx, lsRy, 0, 0, Math.PI * 2); ctx.stroke();

  // Small subunit (40S) — bottom-left, slightly rotated
  const ssRx = 70 * s, ssRy = 44 * s, ssCx = cx - 22 * s, ssCy = cy + 52 * s;
  ctx.save();
  ctx.translate(ssCx, ssCy); ctx.rotate(0.2);
  const ssGrad = ctx.createRadialGradient(-ssRx * 0.3, -ssRy * 0.3, 0, 0, 0, ssRx);
  ssGrad.addColorStop(0, '#155e75'); ssGrad.addColorStop(1, '#082f49');
  ctx.fillStyle = ssGrad;
  ctx.beginPath(); ctx.ellipse(0, 0, ssRx, ssRy, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = Math.max(1, 1.5 * s);
  ctx.beginPath(); ctx.ellipse(0, 0, ssRx, ssRy, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  // mRNA thread through the cleft
  ctx.strokeStyle = '#facc15'; ctx.lineWidth = Math.max(1.5, 2.5 * s); ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(20 * s, cy + 14 * s);
  ctx.bezierCurveTo(cx - 30 * s, cy + 8 * s, cx + 30 * s, cy + 10 * s, w - 20 * s, cy + 14 * s);
  ctx.stroke();

  // tRNA in A-site (right arm up)
  function drawTRNA(x, y, color) {
    ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, 2 * s); ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y + 20 * s);  // base
    ctx.lineTo(x, y);            // stem
    ctx.lineTo(x - 12 * s, y - 18 * s); // left arm
    ctx.moveTo(x, y);
    ctx.lineTo(x + 12 * s, y - 18 * s); // right arm
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y + 20 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
  }
  drawTRNA(cx + 38 * s, lsCy + lsRy * 0.35, '#22c55e');  // A-site
  drawTRNA(cx,           lsCy + lsRy * 0.38, '#f97316');  // P-site

  // Growing polypeptide chain
  ctx.strokeStyle = 'rgba(168,85,247,0.7)'; ctx.lineWidth = Math.max(1, 2 * s); ctx.setLineDash([3 * s, 3 * s]);
  ctx.beginPath();
  ctx.moveTo(cx + 80 * s, lsCy);
  ctx.bezierCurveTo(cx + 100 * s, lsCy - 20 * s, cx + 120 * s, lsCy - 10 * s, cx + 140 * s, lsCy - 35 * s);
  ctx.stroke();
  ctx.setLineDash([]);

  // Labels
  if (w >= 120) {
    ctx.fillStyle = 'rgba(56,189,248,0.7)';
    ctx.font = `${Math.round(10 * s)}px "Segoe UI", system-ui`;
    ctx.textAlign = 'left';
    ctx.fillText('60S', cx - lsRx + 5 * s, lsCy);
    ctx.fillText('40S', ssCx - ssRx - 2 * s, ssCy + 5 * s);
    ctx.fillStyle = 'rgba(250,204,21,0.7)';
    ctx.fillText('mRNA', 24 * s, cy + 28 * s);
  }
}

// ── HARD 7: Eukaryotic Cell ──────────────────────────────────
function drawEukaryoticCell(ctx, w, h) {
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#0d1b2a');
  bg.addColorStop(1, '#050d1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  const s = w / 400;

  // Cell membrane (outer irregular oval)
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = Math.max(2, 3 * s);
  ctx.fillStyle   = 'rgba(14,116,144,0.06)';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.5, w * 0.46, h * 0.46, 0.2, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Nucleus (large, near center-left)
  const nCx = w * 0.42, nCy = h * 0.45;
  const nRx  = w * 0.14, nRy = h * 0.14;
  ctx.fillStyle   = 'rgba(59,130,246,0.2)';
  ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = Math.max(1.5, 2.5 * s);
  ctx.beginPath(); ctx.ellipse(nCx, nCy, nRx, nRy, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Nuclear envelope (double membrane)
  ctx.strokeStyle = 'rgba(96,165,250,0.45)'; ctx.lineWidth = Math.max(1, 1.5 * s);
  ctx.beginPath(); ctx.ellipse(nCx, nCy, nRx + 4 * s, nRy + 4 * s, 0, 0, Math.PI * 2); ctx.stroke();
  // Nucleolus
  ctx.fillStyle = 'rgba(96,165,250,0.5)';
  ctx.beginPath(); ctx.arc(nCx - 5 * s, nCy, 10 * s, 0, Math.PI * 2); ctx.fill();
  // Nuclear pores
  ctx.fillStyle = '#1e40af';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath(); ctx.arc(nCx + nRx * Math.cos(a), nCy + nRy * Math.sin(a), 2.5 * s, 0, Math.PI * 2); ctx.fill();
  }

  // Endoplasmic Reticulum (curves from nucleus)
  ctx.strokeStyle = 'rgba(139,92,246,0.55)'; ctx.lineWidth = Math.max(1, 2 * s);
  ctx.beginPath();
  ctx.moveTo(nCx + nRx, nCy);
  ctx.bezierCurveTo(nCx + 60 * s, nCy - 30 * s, nCx + 80 * s, nCy + 20 * s, nCx + 100 * s, nCy - 10 * s);
  ctx.bezierCurveTo(nCx + 120 * s, nCy - 40 * s, nCx + 105 * s, nCy + 50 * s, nCx + 135 * s, nCy + 30 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(nCx, nCy + nRy);
  ctx.bezierCurveTo(nCx + 30 * s, nCy + 55 * s, nCx + 60 * s, nCy + 45 * s, nCx + 55 * s, nCy + 80 * s);
  ctx.stroke();

  // Golgi apparatus (stack of curves, right side)
  const gx = w * 0.72, gy = h * 0.40;
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = Math.max(1.5, 2 * s);
  for (let i = 0; i < 5; i++) {
    const yy = gy + (i - 2) * 14 * s;
    const arc = 28 * s - Math.abs(i - 2) * 4 * s;
    ctx.beginPath();
    ctx.bezierCurveTo(gx - arc, yy - 6 * s, gx - arc, yy + 6 * s, gx - 1, yy);
    ctx.moveTo(gx - 1, yy);
    ctx.bezierCurveTo(gx + arc, yy - 6 * s, gx + arc, yy + 6 * s, gx + 1, yy);
    ctx.stroke();
  }

  // Mitochondria (2 small oval shapes)
  function miniMito(mx, my, rot) {
    ctx.save(); ctx.translate(mx, my); ctx.rotate(rot);
    ctx.strokeStyle = '#f97316'; ctx.lineWidth = Math.max(1, 1.8 * s);
    ctx.fillStyle   = 'rgba(154,52,18,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 0, 22 * s, 12 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Inner membrane
    ctx.strokeStyle = 'rgba(249,115,22,0.5)'; ctx.lineWidth = Math.max(1, s);
    ctx.beginPath(); ctx.moveTo(-14 * s, 0); ctx.bezierCurveTo(-6 * s, -10 * s, 6 * s, 10 * s, 14 * s, 0); ctx.stroke();
    ctx.restore();
  }
  miniMito(w * 0.28, h * 0.72, 0.4);
  miniMito(w * 0.62, h * 0.70, -0.3);

  // Vacuole
  ctx.strokeStyle = 'rgba(20,184,166,0.5)'; ctx.lineWidth = Math.max(1, 1.5 * s);
  ctx.fillStyle   = 'rgba(20,184,166,0.07)';
  ctx.beginPath(); ctx.ellipse(w * 0.35, h * 0.72, 30 * s, 22 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Ribosomes (tiny dots scattered)
  ctx.fillStyle = 'rgba(249,115,22,0.6)';
  const rpos = [[0.60,0.28],[0.68,0.58],[0.55,0.80],[0.25,0.55],[0.38,0.30],[0.75,0.72],[0.48,0.78]];
  for (const [rx, ry] of rpos) {
    ctx.beginPath(); ctx.arc(rx * w, ry * h, 3 * s, 0, Math.PI * 2); ctx.fill();
  }
}

// ── HARD 8: Neuron ───────────────────────────────────────────
function drawNeuron(ctx, w, h) {
  ctx.fillStyle = '#050d1a'; ctx.fillRect(0, 0, w, h);
  const s = w / 400;

  // Soma (cell body)
  const scx = w * 0.30, scy = h * 0.5;
  const sR  = 42 * s;
  const somaG = ctx.createRadialGradient(scx - sR * 0.3, scy - sR * 0.3, 0, scx, scy, sR);
  somaG.addColorStop(0, '#1e40af'); somaG.addColorStop(1, '#1e3a8a');
  ctx.fillStyle   = somaG;
  ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = Math.max(2, 2.5 * s);
  ctx.beginPath(); ctx.arc(scx, scy, sR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Nucleus
  ctx.fillStyle = 'rgba(96,165,250,0.4)';
  ctx.beginPath(); ctx.arc(scx + 4 * s, scy - 5 * s, 18 * s, 0, Math.PI * 2); ctx.fill();

  // Dendrites (5 branches)
  ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = Math.max(1.5, 2 * s); ctx.lineCap = 'round';
  const dendrites = [
    [scx - sR, scy,        scx - 90 * s, scy - 40 * s,  scx - 145 * s, scy - 20 * s],
    [scx - sR * 0.7, scy - sR * 0.7, scx - 80 * s, scy - 90 * s, scx - 120 * s, scy - 130 * s],
    [scx, scy - sR,        scx - 20 * s, scy - 110 * s, scx + 10 * s,  scy - 155 * s],
    [scx - sR * 0.7, scy + sR * 0.7, scx - 80 * s, scy + 95 * s,  scx - 110 * s, scy + 145 * s],
    [scx - sR * 0.3, scy + sR,       scx - 10 * s, scy + 120 * s, scx + 30 * s,  scy + 165 * s],
  ];
  for (const [x0, y0, cx1, cy1, x2, y2] of dendrites) {
    ctx.beginPath(); ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(cx1, cy1, x2, y2); ctx.stroke();
    // Spines
    ctx.lineWidth = Math.max(0.5, s);
    for (let t = 0.4; t <= 1; t += 0.3) {
      const tx = x0 + (cx1 - x0) * t, ty = y0 + (cy1 - y0) * t;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + (Math.random() - 0.5) * 12 * s, ty + (Math.random() - 0.5) * 12 * s);
      ctx.stroke();
    }
    ctx.lineWidth = Math.max(1.5, 2 * s);
  }

  // Axon hillock + axon
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = Math.max(2, 3 * s);
  ctx.beginPath();
  ctx.moveTo(scx + sR, scy);
  ctx.lineTo(w - 35 * s, scy);
  ctx.stroke();

  // Myelin sheaths
  ctx.fillStyle = 'rgba(253,230,138,0.22)';
  ctx.strokeStyle = '#fde68a'; ctx.lineWidth = Math.max(1, 1.5 * s);
  const myeStart = scx + sR + 15 * s;
  const myeEnd   = w - 55 * s;
  const myeCount = 5;
  const gap = (myeEnd - myeStart) / myeCount;
  for (let i = 0; i < myeCount; i++) {
    const mx = myeStart + i * gap;
    ctx.beginPath(); ctx.ellipse(mx + gap * 0.4, scy, gap * 0.38, 11 * s, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }

  // Synaptic terminal (bouton)
  const tx = w - 28 * s;
  ctx.fillStyle   = 'rgba(56,189,248,0.25)';
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = Math.max(1.5, 2 * s);
  ctx.beginPath(); ctx.arc(tx, scy, 18 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Synaptic vesicles
  ctx.fillStyle = '#7dd3fc';
  for (const [vx, vy] of [[-6,-6],[4,-4],[-2,6],[8,2],[-8,2]]) {
    ctx.beginPath(); ctx.arc(tx + vx * s, scy + vy * s, 3.5 * s, 0, Math.PI * 2); ctx.fill();
  }
}

// ── HARD 9: Viral Infection Cycle ────────────────────────────
function drawViralCycle(ctx, w, h) {
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.7);
  bg.addColorStop(0, '#0d0a14');
  bg.addColorStop(1, '#050d1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  const s = w / 400;
  const cx = w * 0.5, cy = h * 0.5;
  const radius = w * 0.30;

  // 5 stage positions (pentagon)
  const stages = [
    { label: '1. Adsorption', color: '#ef4444', angle: -Math.PI / 2 },
    { label: '2. Injection',  color: '#f97316', angle: -Math.PI / 2 + (2 * Math.PI / 5) },
    { label: '3. Replication',color: '#22c55e', angle: -Math.PI / 2 + (4 * Math.PI / 5) },
    { label: '4. Assembly',   color: '#3b82f6', angle: -Math.PI / 2 + (6 * Math.PI / 5) },
    { label: '5. Lysis',      color: '#a855f7', angle: -Math.PI / 2 + (8 * Math.PI / 5) },
  ];

  // Curved arrows between stages
  ctx.strokeStyle = 'rgba(100,116,139,0.4)'; ctx.lineWidth = Math.max(1, 1.5 * s);
  for (let i = 0; i < 5; i++) {
    const a1 = stages[i].angle + 0.35;
    const a2 = stages[(i + 1) % 5].angle - 0.35;
    const x1 = cx + radius * Math.cos(a1), y1 = cy + radius * Math.sin(a1);
    const x2 = cx + radius * Math.cos(a2), y2 = cy + radius * Math.sin(a2);
    const acx = cx + radius * 0.55 * Math.cos((a1 + a2) / 2);
    const acy = cy + radius * 0.55 * Math.sin((a1 + a2) / 2);
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(acx, acy, x2, y2); ctx.stroke();
    // Arrowhead
    const dx = x2 - acx, dy = y2 - acy;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const aSize = 7 * s;
    ctx.fillStyle = 'rgba(100,116,139,0.5)';
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ux * aSize + uy * aSize * 0.5, y2 - uy * aSize - ux * aSize * 0.5);
    ctx.lineTo(x2 - ux * aSize - uy * aSize * 0.5, y2 - uy * aSize + ux * aSize * 0.5);
    ctx.closePath(); ctx.fill();
  }

  // Stage nodes
  for (const st of stages) {
    const px = cx + radius * Math.cos(st.angle);
    const py = cy + radius * Math.sin(st.angle);
    const nr = 36 * s;

    // Node circle
    ctx.fillStyle   = 'rgba(15,23,42,0.9)';
    ctx.strokeStyle = st.color;
    ctx.lineWidth   = Math.max(2, 2.5 * s);
    ctx.beginPath(); ctx.arc(px, py, nr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // Mini icon inside each stage
    drawStageIcon(ctx, px, py, nr, st, s);

    // Label
    if (w >= 160) {
      ctx.fillStyle = st.color;
      ctx.font = `bold ${Math.round(9 * s)}px "Segoe UI", system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const lx = cx + (radius + nr + 6 * s) * Math.cos(st.angle);
      const ly = cy + (radius + nr + 6 * s) * Math.sin(st.angle);
      ctx.fillText(st.label, lx, ly - 5 * s);
    }
  }

  // Center label
  ctx.fillStyle = 'rgba(148,163,184,0.4)';
  ctx.font = `bold ${Math.round(10 * s)}px "Segoe UI", system-ui`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('Viral Infection', cx, cy - 8 * s);
  ctx.fillText('Cycle', cx, cy + 8 * s);
}

function drawStageIcon(ctx, px, py, r, stage, s) {
  ctx.save();
  ctx.translate(px, py);
  ctx.fillStyle = stage.color;
  ctx.strokeStyle = stage.color;
  ctx.lineWidth = Math.max(1, 1.5 * s);

  if (stage.label.startsWith('1')) {
    // Virus (spiky circle) approaching membrane line
    ctx.beginPath(); ctx.arc(-8 * s, -5 * s, 8 * s, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo((-8 + 8 * Math.cos(a)) * s, (-5 + 8 * Math.sin(a)) * s);
      ctx.lineTo((-8 + 13 * Math.cos(a)) * s, (-5 + 13 * Math.sin(a)) * s); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(56,189,248,0.6)';
    ctx.beginPath(); ctx.moveTo(12 * s, -r * 0.6); ctx.lineTo(12 * s, r * 0.6); ctx.stroke();
  } else if (stage.label.startsWith('2')) {
    // Arrow going into cell (injection)
    ctx.beginPath(); ctx.moveTo(-10 * s, -12 * s); ctx.lineTo(-10 * s, 12 * s);
    ctx.lineTo(8 * s, 0); ctx.closePath(); ctx.fill();
  } else if (stage.label.startsWith('3')) {
    // DNA replication (double lines)
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(-12 * s, i * 10 * s);
      ctx.bezierCurveTo(-4 * s, i * 10 * s - 6 * s, 4 * s, i * 10 * s + 6 * s, 12 * s, i * 10 * s);
      ctx.stroke();
    }
  } else if (stage.label.startsWith('4')) {
    // Multiple small virions
    for (const [vx, vy] of [[-10,-6],[4,-10],[10,4],[-4,10]]) {
      ctx.beginPath(); ctx.arc(vx * s, vy * s, 5 * s, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    // Lysis: broken circle
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 11 * s, Math.sin(a) * 11 * s, 4 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
