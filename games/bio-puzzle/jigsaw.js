// =============================================================
//  BIO PUZZLE — jigsaw.js
//  Puzzle cutting engine: edge generation, bezier tab shapes,
//  piece rendering.
// =============================================================

// =============================================================
//  EDGE GENERATION
//  hEdges[r][c]: tab direction for the edge BELOW row r at col c
//    +1 = piece (r,c) has a tab pointing DOWN on its bottom edge
//    -1 = piece (r,c) has a blank on its bottom edge
//    (piece (r+1,c) gets the opposite on its top edge)
//  vEdges[r][c]: tab direction for the edge RIGHT of col c at row r
//    +1 = piece (r,c) has a tab pointing RIGHT on its right edge
//    -1 = piece (r,c) has a blank on its right edge
// =============================================================

function generateEdges(cols, rows) {
  // hEdges[r][c] for r = 0..rows-2 (internal horizontal edges only)
  const hEdges = [];
  for (let r = 0; r < rows - 1; r++) {
    hEdges[r] = [];
    for (let c = 0; c < cols; c++) {
      hEdges[r][c] = Math.random() < 0.5 ? 1 : -1;
    }
  }

  // vEdges[r][c] for c = 0..cols-2 (internal vertical edges only)
  const vEdges = [];
  for (let r = 0; r < rows; r++) {
    vEdges[r] = [];
    for (let c = 0; c < cols - 1; c++) {
      vEdges[r][c] = Math.random() < 0.5 ? 1 : -1;
    }
  }

  return { hEdges, vEdges };
}

// =============================================================
//  JIGSAW EDGE BEZIER
//  Draws one edge of a jigsaw piece from (x1,y1) to (x2,y2).
//  dir = 0  → flat border edge
//  dir = +1 → tab protrudes outward (right-hand side of travel)
//  dir = -1 → blank (indented inward)
//
//  For a clockwise path the "outward" normal is the right-hand
//  normal: nx = uy*dir, ny = -ux*dir
// =============================================================

function jigsawEdge(ctx, x1, y1, x2, y2, dir) {
  if (dir === 0) {
    ctx.lineTo(x2, y2);
    return;
  }

  const dx = x2 - x1, dy = y2 - y1;
  const L  = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / L, uy = dy / L;            // unit along edge
  const nx = uy * dir, ny = -ux * dir;       // outward unit normal × dir

  // Shoulder points (30% and 70% along edge)
  const s1x = x1 + ux * L * 0.30,  s1y = y1 + uy * L * 0.30;
  const s2x = x1 + ux * L * 0.70,  s2y = y1 + uy * L * 0.70;

  // Tab tip (50% along edge, protruding 28%)
  const tipx = x1 + ux * L * 0.50 + nx * L * 0.28;
  const tipy = y1 + uy * L * 0.50 + ny * L * 0.28;

  // Control points for smooth bezier transitions
  const c1ax = s1x + nx * L * 0.14,   c1ay = s1y + ny * L * 0.14;
  const c1bx = tipx - ux * L * 0.10,  c1by = tipy - uy * L * 0.10;
  const c2ax = tipx + ux * L * 0.10,  c2ay = tipy + uy * L * 0.10;
  const c2bx = s2x + nx * L * 0.14,   c2by = s2y + ny * L * 0.14;

  ctx.lineTo(s1x, s1y);
  ctx.bezierCurveTo(c1ax, c1ay, c1bx, c1by, tipx, tipy);
  ctx.bezierCurveTo(c2ax, c2ay, c2bx, c2by, s2x, s2y);
  ctx.lineTo(x2, y2);
}

// =============================================================
//  BUILD PIECE PATH
//  Constructs the closed clip path for piece (row, col) on a
//  piece canvas of size (cellW + 2*tab) × (cellH + 2*tab).
//  The grid cell occupies (tab, tab) → (tab+cellW, tab+cellH).
// =============================================================

function buildPiecePath(ctx, row, col, cols, rows, cellW, cellH, tab, hEdges, vEdges) {
  // Edge directions for this piece's 4 sides (clockwise: top/right/bottom/left)
  const topDir    = row === 0        ? 0 : -hEdges[row - 1][col];
  const rightDir  = col === cols - 1 ? 0 :  vEdges[row][col];
  const bottomDir = row === rows - 1 ? 0 :  hEdges[row][col];
  const leftDir   = col === 0        ? 0 : -vEdges[row][col - 1];

  const T  = tab;   // alias
  const x0 = T, y0 = T;
  const x1 = T + cellW, y1 = T + cellH;

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  jigsawEdge(ctx, x0, y0, x1, y0, topDir);     // top   (left → right)
  jigsawEdge(ctx, x1, y0, x1, y1, rightDir);   // right (top  → bottom)
  jigsawEdge(ctx, x1, y1, x0, y1, bottomDir);  // bottom (right → left)
  jigsawEdge(ctx, x0, y1, x0, y0, leftDir);    // left  (bottom → top)
  ctx.closePath();
}

// =============================================================
//  CUT PUZZLE
//  Renders each piece to its own offscreen canvas.
//  Returns an array of canvases, indexed piece = row*cols + col.
// =============================================================

function cutPuzzle(sourceCanvas, cols, rows, cellW, cellH, tabSize, hEdges, vEdges) {
  const pw = cellW + 2 * tabSize;
  const ph = cellH + 2 * tabSize;
  const canvases = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const oc  = document.createElement('canvas');
      oc.width  = pw;
      oc.height = ph;
      const oc_ctx = oc.getContext('2d');

      // 1. Build clip path and clip
      buildPiecePath(oc_ctx, row, col, cols, rows, cellW, cellH, tabSize, hEdges, vEdges);
      oc_ctx.save();
      oc_ctx.clip();

      // 2. Draw the correct portion of the source image
      oc_ctx.drawImage(
        sourceCanvas,
        -(col * cellW - tabSize),
        -(row * cellH - tabSize)
      );
      oc_ctx.restore();

      // 3. Overlay: subtle inner tint so pieces feel tangible
      buildPiecePath(oc_ctx, row, col, cols, rows, cellW, cellH, tabSize, hEdges, vEdges);
      oc_ctx.save();
      oc_ctx.clip();
      const tint = oc_ctx.createLinearGradient(0, 0, pw, ph);
      tint.addColorStop(0,   'rgba(255,255,255,0.07)');
      tint.addColorStop(0.5, 'rgba(0,0,0,0)');
      tint.addColorStop(1,   'rgba(0,0,0,0.09)');
      oc_ctx.fillStyle = tint;
      oc_ctx.fillRect(0, 0, pw, ph);
      oc_ctx.restore();

      // 4. Piece border (white outline)
      buildPiecePath(oc_ctx, row, col, cols, rows, cellW, cellH, tabSize, hEdges, vEdges);
      oc_ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      oc_ctx.lineWidth   = 1.5;
      oc_ctx.stroke();

      canvases.push(oc);
    }
  }

  return canvases;
}
