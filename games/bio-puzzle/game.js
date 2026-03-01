// =============================================================
//  BIO PUZZLE — game.js
//  State, selection screen, workbench, drag/snap/group logic.
// =============================================================

const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

const W   = 800;
const H   = 700;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

canvas.width  = W * DPR;
canvas.height = H * DPR;
canvas.style.width  = W + 'px';
canvas.style.height = H + 'px';
ctx.scale(DPR, DPR);

const SNAP_THRESHOLD = 28;   // px — how close before pieces lock
const STAGING_H      = 175;  // staging zone height
const DRAG_THRESHOLD = 4;    // px of movement before it's a drag

// =============================================================
//  STATE
// =============================================================

let state = {
  phase: 'select',   // 'select' | 'playing' | 'complete'
  puzzle: null,

  cols: 4, rows: 4,
  cellW: 80, cellH: 80,
  tabSize: 18,
  homeX: 240, homeY: 270,   // puzzle home zone top-left

  pieces: [],        // piece objects
  groups: new Map(), // groupId → { id, pieceIds }
  nextGroupId: 0,

  sourceCanvas: null,
  pieceCanvases: [],

  drag: null,        // { pieceIds, startX, startY, offsets[], moved }
  clickTimer: null,  // for single-click delay (to separate from dblclick)

  timer: 0,
  complete: false,
};

// =============================================================
//  SELECTION SCREEN
// =============================================================

function buildSelectionScreen() {
  for (const puzzle of PUZZLES) {
    const card  = document.createElement('div');
    card.className = 'puzzle-card';

    // Thumbnail canvas
    const thumb  = document.createElement('canvas');
    const tSize  = 200;
    thumb.width  = tSize;
    thumb.height = tSize;
    thumb.className = 'puzzle-thumb';
    const tctx   = thumb.getContext('2d');

    if (puzzle.artFile) {
      const img = new Image();
      img.onload  = () => tctx.drawImage(img, 0, 0, tSize, tSize);
      img.onerror = () => puzzle.drawFn(tctx, tSize, tSize);
      img.src = `images/${puzzle.artFile}`;
    } else {
      puzzle.drawFn(tctx, tSize, tSize);
    }

    const title = document.createElement('p');
    title.className   = 'puzzle-card-title';
    title.textContent = puzzle.title;

    const desc  = document.createElement('p');
    desc.className   = 'puzzle-card-desc';
    desc.textContent = puzzle.description;

    card.appendChild(thumb);
    card.appendChild(title);
    card.appendChild(desc);
    card.addEventListener('click', () => openPuzzle(puzzle));

    document.getElementById(`grid-${puzzle.difficulty}`).appendChild(card);
  }
}

// =============================================================
//  PUZZLE LOAD
// =============================================================

function openPuzzle(def) {
  state.puzzle = def;
  state.cols   = def.cols;
  state.rows   = def.rows;

  if (def.difficulty === 'easy') {
    state.cellW = state.cellH = 80;
    state.tabSize = 18;
    state.homeX = Math.round((W - def.cols * 80) / 2);
    state.homeY = 245;
  } else if (def.difficulty === 'medium') {
    state.cellW = state.cellH = 60;
    state.tabSize = 13;
    state.homeX = Math.round((W - def.cols * 60) / 2);
    state.homeY = 230;
  } else {
    state.cellW = state.cellH = 50;
    state.tabSize = 11;
    state.homeX = Math.round((W - def.cols * 50) / 2);
    state.homeY = 220;
  }

  const pw = state.cellW * def.cols;
  const ph = state.cellH * def.rows;

  state.sourceCanvas        = document.createElement('canvas');
  state.sourceCanvas.width  = pw;
  state.sourceCanvas.height = ph;
  const sctx = state.sourceCanvas.getContext('2d');

  function finish() {
    const edges = generateEdges(def.cols, def.rows);
    state.pieceCanvases = cutPuzzle(
      state.sourceCanvas, def.cols, def.rows,
      state.cellW, state.cellH, state.tabSize,
      edges.hEdges, edges.vEdges
    );
    initPieces();
    scatterPieces();
    state.timer    = 0;
    state.complete = false;
    state.phase    = 'playing';
    state.groups   = new Map();
    state.nextGroupId = 0;

    document.getElementById('select-screen').style.display = 'none';
    document.getElementById('workbench').style.display     = 'flex';
    document.getElementById('back-btn').style.display      = 'block';
  }

  if (def.artFile) {
    const img = new Image();
    img.onload  = () => { sctx.drawImage(img, 0, 0, pw, ph); finish(); };
    img.onerror = () => { def.drawFn(sctx, pw, ph); finish(); };
    img.src = `images/${def.artFile}`;
  } else {
    def.drawFn(sctx, pw, ph);
    finish();
  }
}

function initPieces() {
  state.pieces = [];
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      state.pieces.push({
        id: r * state.cols + c,
        row: r, col: c,
        x: 0, y: 0,
        rotation: 0,
        groupId: null,
        zIndex: r * state.cols + c,
      });
    }
  }
}

function scatterPieces() {
  const { cellW, cellH, homeX, homeY, cols, rows, tabSize } = state;
  const pW = cols * cellW, pH = rows * cellH;
  const margin = tabSize + 4;

  // Shuffle for random scatter order
  const shuffled = [...state.pieces].sort(() => Math.random() - 0.5);

  for (const piece of shuffled) {
    let placed = false;
    for (let attempt = 0; attempt < 120; attempt++) {
      const x = margin + Math.random() * (W - cellW - margin * 2);
      const y = margin + Math.random() * (H - cellH - margin * 2);

      // Keep away from the home zone
      const inHome = x < homeX + pW + margin && x + cellW > homeX - margin &&
                     y < homeY + pH + margin && y + cellH > homeY - margin;
      if (inHome) continue;

      // Prefer staging strip for first half of pieces
      if (attempt < 60 && y > STAGING_H - cellH) continue;

      // Avoid overlapping already-placed pieces
      let clear = true;
      for (const other of state.pieces) {
        if (other.id === piece.id || (other.x === 0 && other.y === 0)) continue;
        if (Math.abs(other.x - x) < cellW * 0.85 && Math.abs(other.y - y) < cellH * 0.85) {
          clear = false; break;
        }
      }
      if (clear) { piece.x = x; piece.y = y; placed = true; break; }
    }
    if (!placed) {
      // Fallback: anywhere
      piece.x = margin + Math.random() * (W - cellW - margin * 2);
      piece.y = margin + Math.random() * (STAGING_H - cellH);
    }
    piece.rotation = Math.floor(Math.random() * 4);
    piece.groupId  = null;
  }
}

// =============================================================
//  GROUPS
// =============================================================

function getOrCreateGroup(pieceId) {
  const piece = state.pieces[pieceId];
  if (piece.groupId !== null) return piece.groupId;
  const gid = state.nextGroupId++;
  state.groups.set(gid, { id: gid, pieceIds: [pieceId] });
  piece.groupId = gid;
  return gid;
}

function mergeIntoGroup(anchorId, moverId) {
  // anchorId stays put; moverId (and its group) shifts to snap position
  const anchor = state.pieces[anchorId];
  const mover  = state.pieces[moverId];

  const targetX = anchor.x + (mover.col - anchor.col) * state.cellW;
  const targetY = anchor.y + (mover.row - anchor.row) * state.cellH;
  const dx = targetX - mover.x;
  const dy = targetY - mover.y;

  // Collect mover's group (or solo)
  const moverIds = mover.groupId !== null
    ? [...state.groups.get(mover.groupId).pieceIds]
    : [mover.id];

  // Shift all mover pieces
  for (const id of moverIds) {
    state.pieces[id].x += dx;
    state.pieces[id].y += dy;
  }

  // Determine target group (anchor's group, creating if needed)
  const anchorGid = getOrCreateGroup(anchorId);
  const anchorGroup = state.groups.get(anchorGid);
  const oldGid = mover.groupId;

  for (const id of moverIds) {
    state.pieces[id].groupId = anchorGid;
    if (!anchorGroup.pieceIds.includes(id)) anchorGroup.pieceIds.push(id);
  }
  if (oldGid !== null && oldGid !== anchorGid) state.groups.delete(oldGid);
}

// =============================================================
//  SNAP
// =============================================================

function trySingleSnap(pid) {
  const piece = state.pieces[pid];
  if (piece.rotation !== 0) return false;

  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    const nr = piece.row + dr, nc = piece.col + dc;
    if (nr < 0 || nr >= state.rows || nc < 0 || nc >= state.cols) continue;

    const neighbor = state.pieces[nr * state.cols + nc];
    if (!neighbor || neighbor.rotation !== 0) continue;
    if (piece.groupId !== null && piece.groupId === neighbor.groupId) continue;

    const expectedNx = piece.x + dc * state.cellW;
    const expectedNy = piece.y + dr * state.cellH;

    if (Math.abs(neighbor.x - expectedNx) < SNAP_THRESHOLD &&
        Math.abs(neighbor.y - expectedNy) < SNAP_THRESHOLD) {
      mergeIntoGroup(piece.id, neighbor.id);
      return true;
    }
  }
  return false;
}

function trySnapAll(droppedIds) {
  // Keep snapping until no new connections form (chains)
  let changed = true;
  while (changed) {
    changed = false;
    // Get current full group (may have grown)
    const gid = state.pieces[droppedIds[0]].groupId;
    const checkIds = gid !== null
      ? [...state.groups.get(gid).pieceIds]
      : [droppedIds[0]];

    for (const pid of checkIds) {
      if (trySingleSnap(pid)) { changed = true; break; }
    }
  }
  checkCompletion();
}

// =============================================================
//  RELEASE PIECE FROM GROUP
// =============================================================

function releasePiece(pieceId) {
  const piece = state.pieces[pieceId];
  if (piece.groupId === null) return;

  const group = state.groups.get(piece.groupId);
  const idx   = group.pieceIds.indexOf(pieceId);
  if (idx >= 0) group.pieceIds.splice(idx, 1);

  if (group.pieceIds.length <= 1) {
    // Dissolve group — last remaining piece goes solo
    if (group.pieceIds.length === 1) state.pieces[group.pieceIds[0]].groupId = null;
    state.groups.delete(piece.groupId);
  }
  piece.groupId = null;

  // Return to staging
  piece.rotation = Math.floor(Math.random() * 4);
  const { cellW, cellH, tabSize } = state;
  const margin = tabSize + 4;
  let placed = false;
  for (let a = 0; a < 80; a++) {
    const x = margin + Math.random() * (W - cellW - margin * 2);
    const y = margin + Math.random() * (STAGING_H - cellH - margin);
    let clear = true;
    for (const other of state.pieces) {
      if (other.id === pieceId) continue;
      if (Math.abs(other.x - x) < cellW * 0.8 && Math.abs(other.y - y) < cellH * 0.8) {
        clear = false; break;
      }
    }
    if (clear) { piece.x = x; piece.y = y; placed = true; break; }
  }
  if (!placed) {
    piece.x = margin + Math.random() * (W - cellW - margin * 2);
    piece.y = margin;
  }
  piece.zIndex = maxZ() + 1;
  showToast('Piece released — find its spot again!');
}

// =============================================================
//  OVERLAP RESOLUTION
// =============================================================

function resolveOverlap(pieceId) {
  const piece = state.pieces[pieceId];
  const { cellW, cellH } = state;

  for (const other of state.pieces) {
    if (other.id === pieceId) continue;
    if (piece.groupId !== null && piece.groupId === other.groupId) continue;
    if (Math.abs(piece.x - other.x) < cellW * 0.88 && Math.abs(piece.y - other.y) < cellH * 0.88) {
      // Find nearest clear spot
      const step = cellW * 0.55;
      for (let dist = step; dist < W; dist += step) {
        const candidates = [
          [dist, 0], [-dist, 0], [0, dist], [0, -dist],
          [dist, dist], [-dist, dist], [dist, -dist], [-dist, -dist],
        ];
        for (const [ox, oy] of candidates) {
          const nx = piece.x + ox, ny = piece.y + oy;
          if (nx < 0 || ny < 0 || nx + cellW > W || ny + cellH > H) continue;
          let clear = true;
          for (const o2 of state.pieces) {
            if (o2.id === pieceId) continue;
            if (piece.groupId !== null && piece.groupId === o2.groupId) continue;
            if (Math.abs(nx - o2.x) < cellW * 0.88 && Math.abs(ny - o2.y) < cellH * 0.88) {
              clear = false; break;
            }
          }
          if (clear) { piece.x = nx; piece.y = ny; return; }
        }
      }
      break;
    }
  }
}

// =============================================================
//  ROTATION
// =============================================================

function rotatePiece(piece) {
  if (piece.groupId !== null) {
    rotateGroup(piece.groupId);
  } else {
    piece.rotation = (piece.rotation + 1) % 4;
    trySnapAll([piece.id]);
  }
}

function rotateGroup(gid) {
  const group = state.groups.get(gid);
  if (!group) return;

  // Centroid of all piece centers
  let sumX = 0, sumY = 0;
  for (const id of group.pieceIds) {
    sumX += state.pieces[id].x + state.cellW / 2;
    sumY += state.pieces[id].y + state.cellH / 2;
  }
  const gcx = sumX / group.pieceIds.length;
  const gcy = sumY / group.pieceIds.length;

  // Rotate each piece center 90° CW around group centroid
  // 90° CW in screen coords: (dx,dy) → (-dy, dx)
  for (const id of group.pieceIds) {
    const p  = state.pieces[id];
    const px = p.x + state.cellW / 2 - gcx;
    const py = p.y + state.cellH / 2 - gcy;
    p.x = gcx + (-py) - state.cellW / 2;
    p.y = gcy + ( px) - state.cellH / 2;
    p.rotation = (p.rotation + 1) % 4;
  }

  trySnapAll(group.pieceIds);
}

// =============================================================
//  COMPLETION
// =============================================================

function checkCompletion() {
  if (state.complete) return;
  // All pieces must be in a single group, all at rotation 0
  const firstGid = state.pieces[0].groupId;
  if (firstGid === null) return;
  const g = state.groups.get(firstGid);
  if (!g || g.pieceIds.length !== state.pieces.length) return;
  if (state.pieces.some(p => p.rotation !== 0)) return;

  state.complete = true;
  state.phase    = 'complete';

  // Save best time
  const key = `bp-best-${state.puzzle.id}`;
  const prev = parseInt(localStorage.getItem(key) || '0');
  if (!prev || state.timer < prev) localStorage.setItem(key, String(Math.round(state.timer)));

  showToast('Puzzle complete! Well done!');
}

// =============================================================
//  HIT TESTING
// =============================================================

function hitTestPiece(piece, mx, my) {
  const { cellW, cellH, tabSize } = state;
  const pcx = piece.x + cellW / 2;
  const pcy = piece.y + cellH / 2;

  // Transform mouse into piece's local (unrotated) space
  const angle = -piece.rotation * Math.PI / 2;
  const cos   = Math.cos(angle), sin = Math.sin(angle);
  const rx    = cos * (mx - pcx) - sin * (my - pcy);
  const ry    = sin * (mx - pcx) + cos * (my - pcy);

  return rx >= -(cellW / 2 + tabSize) && rx <= cellW / 2 + tabSize &&
         ry >= -(cellH / 2 + tabSize) && ry <= cellH / 2 + tabSize;
}

function pieceAtPoint(mx, my) {
  // Search top-to-bottom in z-order (highest zIndex first)
  const sorted = [...state.pieces].sort((a, b) => b.zIndex - a.zIndex);
  for (const piece of sorted) {
    if (hitTestPiece(piece, mx, my)) return piece;
  }
  return null;
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (W / rect.width),
    y: (e.clientY - rect.top)  * (H / rect.height),
  };
}

function maxZ() {
  return Math.max(0, ...state.pieces.map(p => p.zIndex));
}

// =============================================================
//  INPUT
// =============================================================

function setupInput() {
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup',   onMouseUp);
  canvas.addEventListener('dblclick',  onDblClick);

  document.getElementById('back-btn').addEventListener('click', e => {
    e.preventDefault();
    backToSelect();
  });
}

function backToSelect() {
  state.phase = 'select';
  state.drag  = null;
  clearTimeout(state.clickTimer);
  document.getElementById('workbench').style.display     = 'none';
  document.getElementById('back-btn').style.display      = 'none';
  document.getElementById('select-screen').style.display = 'block';
}

function onMouseDown(e) {
  if (state.phase !== 'playing') return;
  const { x, y } = getMousePos(e);
  const piece = pieceAtPoint(x, y);
  if (!piece) return;

  // Bring to top
  const topZ = maxZ() + 1;
  const dragIds = piece.groupId !== null
    ? [...state.groups.get(piece.groupId).pieceIds]
    : [piece.id];
  for (const id of dragIds) state.pieces[id].zIndex = topZ;

  // Per-piece offsets so the group moves as one
  const offsets = dragIds.map(id => ({
    dx: state.pieces[id].x - x,
    dy: state.pieces[id].y - y,
  }));

  state.drag = {
    pieceIds: dragIds,
    startX: x, startY: y,
    offsets,
    moved: false,
    clickedPieceId: piece.id,
  };
  canvas.classList.add('dragging');
}

function onMouseMove(e) {
  if (!state.drag) return;
  const { x, y } = getMousePos(e);
  const { startX, startY, pieceIds, offsets } = state.drag;

  if (!state.drag.moved &&
      Math.hypot(x - startX, y - startY) > DRAG_THRESHOLD) {
    state.drag.moved = true;
  }

  for (let i = 0; i < pieceIds.length; i++) {
    const p = state.pieces[pieceIds[i]];
    p.x = x + offsets[i].dx;
    p.y = y + offsets[i].dy;
  }
}

function onMouseUp(e) {
  if (!state.drag) return;
  canvas.classList.remove('dragging');

  const { pieceIds, moved, clickedPieceId } = state.drag;
  state.drag = null;

  if (!moved) {
    // This is a click — delay to allow dblclick to cancel it
    clearTimeout(state.clickTimer);
    state.clickTimer = setTimeout(() => {
      const piece = state.pieces[clickedPieceId];
      if (piece) rotatePiece(piece);
    }, 230);
  } else {
    // Dragged: snap then resolve overlap
    trySnapAll(pieceIds);
    for (const id of pieceIds) resolveOverlap(id);
  }
}

function onDblClick(e) {
  if (state.phase !== 'playing') return;
  clearTimeout(state.clickTimer);   // cancel pending rotate
  const { x, y } = getMousePos(e);
  const piece = pieceAtPoint(x, y);
  if (piece && piece.groupId !== null) releasePiece(piece.id);
}

// =============================================================
//  DRAWING
// =============================================================

function drawBackground() {
  ctx.fillStyle = '#050d1a';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = 'rgba(56,189,248,0.04)';
  ctx.lineWidth   = 1;
  for (let x = 0; x < W; x += 44) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 44) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

function drawHomeZone() {
  const { homeX, homeY, cols, rows, cellW, cellH, sourceCanvas } = state;
  const pW = cols * cellW, pH = rows * cellH;

  // Ghost image
  ctx.globalAlpha = 0.11;
  ctx.drawImage(sourceCanvas, homeX, homeY, pW, pH);
  ctx.globalAlpha = 1;

  // Dashed border
  ctx.strokeStyle = 'rgba(56,189,248,0.22)';
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([6, 5]);
  ctx.strokeRect(homeX, homeY, pW, pH);
  ctx.setLineDash([]);

  // Label
  ctx.fillStyle   = 'rgba(56,189,248,0.18)';
  ctx.font        = '11px "Segoe UI", system-ui';
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('PUZZLE AREA', homeX + pW / 2, homeY - 4);
}

function drawStagingDivider() {
  ctx.strokeStyle = 'rgba(51,65,85,0.6)';
  ctx.lineWidth   = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(0, STAGING_H); ctx.lineTo(W, STAGING_H); ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle   = 'rgba(71,85,105,0.45)';
  ctx.font        = '10px "Segoe UI", system-ui';
  ctx.textAlign   = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('STAGING', W - 8, STAGING_H - 3);
}

function drawPiece(piece) {
  const { cellW, cellH, tabSize } = state;
  const pCanvas = state.pieceCanvases[piece.id];
  if (!pCanvas) return;

  const cx = piece.x + cellW / 2;
  const cy = piece.y + cellH / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(piece.rotation * Math.PI / 2);
  ctx.translate(-(cellW / 2 + tabSize), -(cellH / 2 + tabSize));

  // Drop shadow
  ctx.shadowColor   = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur    = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;

  ctx.drawImage(pCanvas, 0, 0);
  ctx.restore();
}

function drawPieces() {
  const sorted = [...state.pieces].sort((a, b) => a.zIndex - b.zIndex);
  for (const piece of sorted) drawPiece(piece);
}

function drawHUD() {
  // Timer
  const secs  = Math.floor(state.timer);
  const mm    = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss    = String(secs % 60).padStart(2, '0');
  ctx.fillStyle    = '#475569';
  ctx.font         = '12px "Segoe UI", system-ui';
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(`${mm}:${ss}`, W - 12, 12);

  // Piece connection count
  const total   = state.pieces.length;
  const connected = state.groups.size > 0
    ? Math.max(...[...state.groups.values()].map(g => g.pieceIds.length))
    : 1;
  ctx.fillStyle = '#38bdf8';
  ctx.font      = 'bold 12px "Segoe UI", system-ui';
  ctx.fillText(`${connected} / ${total} linked`, W - 12, 28);

  // Puzzle title (top-left)
  ctx.textAlign    = 'left';
  ctx.fillStyle    = 'rgba(71,85,105,0.8)';
  ctx.font         = '11px "Segoe UI", system-ui';
  ctx.fillText(state.puzzle ? state.puzzle.title : '', 8, 12);

  // Controls hint (bottom bar)
  ctx.fillStyle    = 'rgba(51,65,85,0.6)';
  ctx.font         = '10px "Segoe UI", system-ui';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Click to rotate · Drag to move · Double-click to detach from group', W / 2, H - 6);
}

function drawCompleteOverlay() {
  ctx.fillStyle = 'rgba(5,13,26,0.88)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle    = '#22c55e';
  ctx.font         = 'bold 38px "Segoe UI", system-ui';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PUZZLE COMPLETE!', W / 2, H * 0.36);

  const secs = Math.floor(state.timer);
  const mm   = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss   = String(secs % 60).padStart(2, '0');
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 20px "Segoe UI", system-ui';
  ctx.fillText(`Time: ${mm}:${ss}`, W / 2, H * 0.47);

  const key  = `bp-best-${state.puzzle ? state.puzzle.id : ''}`;
  const best = parseInt(localStorage.getItem(key) || '0');
  if (best) {
    const bm = String(Math.floor(best / 60)).padStart(2, '0');
    const bs = String(best % 60).padStart(2, '0');
    ctx.fillStyle = '#eab308'; ctx.font = '14px "Segoe UI", system-ui';
    ctx.fillText(`Best: ${bm}:${bs}`, W / 2, H * 0.55);
  }

  if (Math.floor(Date.now() / 600) % 2 === 0) {
    ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 15px "Segoe UI", system-ui';
    ctx.fillText('Click anywhere to return', W / 2, H * 0.69);
  }
}

// =============================================================
//  TOAST
// =============================================================

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 2800);
}

// =============================================================
//  MAIN LOOP
// =============================================================

let lastTime = 0;

function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  if (state.phase === 'playing' || state.phase === 'complete') {
    if (state.phase === 'playing') state.timer += dt;

    drawBackground();
    drawHomeZone();
    drawStagingDivider();
    drawPieces();
    drawHUD();

    if (state.phase === 'complete') drawCompleteOverlay();

    // Click-anywhere to return after completion
    if (state.phase === 'complete' && state._completeClickReady === undefined) {
      state._completeClickReady = true;
      canvas.addEventListener('click', function once() {
        canvas.removeEventListener('click', once);
        state._completeClickReady = undefined;
        backToSelect();
      });
    }
  }

  requestAnimationFrame(loop);
}

// =============================================================
//  BOOT
// =============================================================

setupInput();
buildSelectionScreen();
requestAnimationFrame(ts => { lastTime = ts; requestAnimationFrame(loop); });
