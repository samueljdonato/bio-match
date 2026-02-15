/**
 * game.js — Core logic for BioMatch, the molecular biology memory game.
 *
 * Architecture:
 *   1. CONTENT POOLS    — Biology terms grouped by category.
 *   2. CARD GENERATION  — Pick 12 random terms, duplicate for pairs, add 1 special card.
 *   3. GRID RENDERING   — Build the 5×5 card DOM with flip animations.
 *   4. REVEAL TIMING    — 3-second countdown window per card click.
 *   5. MATCH LOGIC      — Compare two revealed cards; animate match or flip back.
 *   6. SPECIAL CARD     — Trigger trivia modal; reward or punish.
 *   7. WIN DETECTION    — All 12 pairs matched → celebration + confetti.
 *   8. LEVEL SYSTEM     — Each level increases difficulty (fewer categories → harder matches).
 */

// ==================== 1. CONTENT POOLS ====================
// Each entry: { term, definition, category }
// One card shows the term, its match shows the definition.
// This turns the game into a vocabulary learning tool — players
// must memorize both positions AND term-definition associations.

const CONTENT_POOLS = {
  dna: [
    { term: "ATCG",  definition: "The four nucleotide bases of DNA: Adenine, Thymine, Cytosine, Guanine", category: "dna" },
    { term: "GCTA",  definition: "Complementary base sequence to ATCG on the opposite DNA strand", category: "dna" },
    { term: "TAAT",  definition: "A palindromic DNA sequence commonly found in TATA box promoter regions", category: "dna" },
    { term: "CCGG",  definition: "A restriction enzyme recognition site cut by MspI and HpaII", category: "dna" }
  ],
  protein: [
    { term: "Actin",    definition: "Cytoskeletal protein that forms microfilaments and enables cell movement", category: "protein" },
    { term: "Myosin",   definition: "Motor protein that walks along actin filaments to drive muscle contraction", category: "protein" },
    { term: "Histone",  definition: "Protein spool that packages and organizes DNA into chromatin", category: "protein" },
    { term: "Tubulin",  definition: "Structural protein that polymerizes into microtubules of the cytoskeleton", category: "protein" },
    { term: "Collagen", definition: "Triple-helix structural protein providing strength to connective tissues", category: "protein" }
  ],
  organelle: [
    { term: "Mitochondrion", definition: "The powerhouse of the cell; generates ATP via oxidative phosphorylation", category: "organelle" },
    { term: "Ribosome",      definition: "Molecular machine that translates mRNA into polypeptide chains", category: "organelle" },
    { term: "Nucleus",       definition: "Membrane-bound organelle housing the cell's DNA and controlling gene expression", category: "organelle" },
    { term: "ER",            definition: "Endoplasmic reticulum; network for protein folding and lipid synthesis", category: "organelle" },
    { term: "Golgi",         definition: "Golgi apparatus; modifies, sorts, and packages proteins for secretion", category: "organelle" }
  ],
  process: [
    { term: "Transcription", definition: "The process of copying DNA into messenger RNA by RNA polymerase", category: "process" },
    { term: "Translation",   definition: "The process of decoding mRNA into a protein at the ribosome", category: "process" },
    { term: "Replication",   definition: "The duplication of DNA to produce two identical copies before cell division", category: "process" },
    { term: "Splicing",      definition: "Removal of introns and joining of exons in pre-mRNA processing", category: "process" }
  ],
  molecule: [
    { term: "ATP",     definition: "Adenosine triphosphate; the primary energy currency of the cell", category: "molecule" },
    { term: "DNA",     definition: "Deoxyribonucleic acid; the double-stranded genetic blueprint of life", category: "molecule" },
    { term: "RNA",     definition: "Ribonucleic acid; single-stranded molecule essential for gene expression", category: "molecule" },
    { term: "tRNA",    definition: "Transfer RNA; carries amino acids to the ribosome during translation", category: "molecule" },
    { term: "mRNA",    definition: "Messenger RNA; carries the genetic code from DNA to the ribosome", category: "molecule" },
    { term: "Glucose", definition: "A six-carbon sugar that is the primary substrate for cellular respiration", category: "molecule" }
  ],
  enzyme: [
    { term: "Polymerase", definition: "Enzyme that synthesizes DNA or RNA strands from a template", category: "enzyme" },
    { term: "Ligase",     definition: "Enzyme that joins broken DNA strands by forming phosphodiester bonds", category: "enzyme" },
    { term: "Helicase",   definition: "Enzyme that unwinds the DNA double helix during replication", category: "enzyme" },
    { term: "Primase",    definition: "Enzyme that synthesizes short RNA primers to initiate DNA replication", category: "enzyme" }
  ]
};

// Flatten all content into a single array for random sampling.
function getAllContent() {
  return Object.values(CONTENT_POOLS).flat();
}

// ==================== 2. UTILITY HELPERS ====================

/** Fisher-Yates shuffle (in-place). */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick `n` unique random items from an array. */
function pickRandom(arr, n) {
  const copy = [...arr];
  shuffle(copy);
  return copy.slice(0, n);
}

/** Format seconds as M:SS. */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ==================== 3. GAME STATE ====================

let state = {
  level: 1,
  score: 0,
  totalPairs: 12,
  cards: [],            // Array of card data objects
  flippedIndices: [],   // Currently revealed card indices (max 2)
  matchedIds: new Set(),// Set of matched card pair IDs
  isLocked: false,      // Prevent clicks during animations
  timerInterval: null,
  elapsedSeconds: 0,
  triviaUsed: new Set(),// Track used trivia question indices
  specialTriggered: false
};

// DOM refs
const gridEl        = document.getElementById("grid");
const scoreEl       = document.getElementById("score");
const totalPairsEl  = document.getElementById("total-pairs");
const timerEl       = document.getElementById("timer");
const levelEl       = document.getElementById("level");
const countdownBar  = document.getElementById("countdown-bar");
const matchOverlay  = document.getElementById("match-overlay");
const triviaModal   = document.getElementById("trivia-modal");
const winOverlay    = document.getElementById("win-overlay");
const winMessage    = document.getElementById("win-message");
const confettiCanvas = document.getElementById("confetti-canvas");

document.getElementById("new-game-btn").addEventListener("click", () => {
  state.level = 1;
  startGame();
});
document.getElementById("next-level-btn").addEventListener("click", () => {
  state.level++;
  startGame();
});

// ==================== 4. CARD GENERATION ====================
/**
 * Generate 25 cards: 12 pairs (24 cards) + 1 special card.
 * Each card object: { id, pairId, label, category, isSpecial, cardType }
 *   - `id`       — unique index (0–24).
 *   - `pairId`   — groups two cards that form a pair.
 *   - `label`    — text displayed on the card face.
 *   - `cardType` — "term" or "definition" (determines visual style).
 *   - `isSpecial` — flags the wild/trivia card.
 *
 * Matching logic: a TERM card matches its DEFINITION card (same pairId).
 * Players must learn both the vocabulary and its meaning to succeed.
 *
 * Level progression: higher levels draw from fewer categories,
 * making visual discrimination harder (e.g., all proteins).
 */
function generateCards() {
  const all = getAllContent();

  // For higher levels, restrict to fewer categories to increase difficulty.
  let pool = all;
  if (state.level >= 4) {
    const cats = shuffle(Object.keys(CONTENT_POOLS)).slice(0, 2);
    pool = cats.flatMap(c => CONTENT_POOLS[c]);
  } else if (state.level >= 2) {
    const cats = shuffle(Object.keys(CONTENT_POOLS)).slice(0, 4);
    pool = cats.flatMap(c => CONTENT_POOLS[c]);
  }

  // Ensure we have at least 12 unique items; fall back to full pool if needed.
  if (pool.length < 12) pool = all;

  const chosen = pickRandom(pool, 12);

  const cards = [];
  chosen.forEach((item, i) => {
    // One card shows the TERM, the other shows the DEFINITION.
    // Both share the same pairId so the match logic can link them.
    cards.push({
      id: i * 2, pairId: i, label: item.term,
      category: item.category, isSpecial: false, cardType: "term"
    });
    cards.push({
      id: i * 2 + 1, pairId: i, label: item.definition,
      category: item.category, isSpecial: false, cardType: "definition"
    });
  });

  // Add the special card (id = 24).
  cards.push({ id: 24, pairId: -1, label: "WILD", category: "special", isSpecial: true, cardType: "special" });

  shuffle(cards);
  return cards;
}

// ==================== 5. GRID RENDERING ====================

function renderGrid() {
  gridEl.innerHTML = "";
  state.cards.forEach((card, idx) => {
    const el = document.createElement("div");
    el.className = "card";
    el.dataset.idx = idx;

    // If already matched, hide it.
    if (state.matchedIds.has(card.pairId)) {
      el.classList.add("matched");
    }

    // Single-word terms get a special class so they never line-break.
    const isSingleWord = card.cardType === "term" && !card.label.includes(" ");
    const labelClass = card.cardType === "definition"
      ? "card-label card-label-def"
      : isSingleWord ? "card-label card-label-single" : "card-label";

    el.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back"></div>
        <div class="card-face card-front cat-${card.category} type-${card.cardType}">
          <span class="${labelClass}">${card.isSpecial ? "&#x2728;" : card.label}</span>
          <span class="card-countdown"></span>
        </div>
      </div>
    `;

    el.addEventListener("click", () => onCardClick(idx));
    gridEl.appendChild(el);
  });
}

// ==================== 6. CARD CLICK & REVEAL TIMING ====================
/**
 * Card reveal timing mechanism:
 *   1. On click, card flips (CSS transform: rotateY(180deg)).
 *   2. A 3-second countdown starts — displayed on the card face
 *      and on the global countdown bar.
 *   3. If a second card is clicked within the window, both cards
 *      remain visible for comparison until the 3-sec timer ends.
 *   4. After 3 seconds: evaluate match or flip back.
 */

function onCardClick(idx) {
  const card = state.cards[idx];

  // Guard: ignore clicks when locked, already flipped, or already matched.
  if (state.isLocked) return;
  if (state.flippedIndices.includes(idx)) return;
  if (state.matchedIds.has(card.pairId) && !card.isSpecial) return;
  if (card.isSpecial && state.specialTriggered) return;

  // Flip the card.
  const cardEl = gridEl.children[idx];
  cardEl.classList.add("flipped");
  state.flippedIndices.push(idx);

  // Start per-card countdown display.
  startCardCountdown(cardEl);

  // Handle special card immediately.
  if (card.isSpecial) {
    state.specialTriggered = true;
    state.isLocked = true;
    // Small delay so player sees the card flip.
    setTimeout(() => triggerTrivia(), 600);
    // Remove the special from flippedIndices so it doesn't interfere with pairing.
    state.flippedIndices = state.flippedIndices.filter(i => i !== idx);
    return;
  }

  // Activate the global countdown bar on first flip.
  if (state.flippedIndices.length === 1) {
    startCountdownBar();
  }

  // Two cards revealed → evaluate after 3 seconds.
  if (state.flippedIndices.length === 2) {
    state.isLocked = true;
    setTimeout(() => evaluateMatch(), 3000);
  }
}

/** Show a 3-second countdown on an individual card (3… 2… 1…). */
function startCardCountdown(cardEl) {
  const cdEl = cardEl.querySelector(".card-countdown");
  let remaining = 3;
  cdEl.textContent = remaining;
  const iv = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      cdEl.textContent = remaining;
    } else {
      cdEl.textContent = "";
      clearInterval(iv);
    }
  }, 1000);
  // Store interval so we can clear if card is matched early.
  cardEl._cdInterval = iv;
}

/** Animate the global countdown bar over 3 seconds. */
function startCountdownBar() {
  countdownBar.style.transition = "none";
  countdownBar.style.width = "0%";
  // Force reflow to reset CSS transition.
  void countdownBar.offsetWidth;
  countdownBar.style.transition = "width 3s linear";
  countdownBar.classList.add("active");
  // Reset after animation.
  setTimeout(() => {
    countdownBar.classList.remove("active");
    countdownBar.style.transition = "none";
    countdownBar.style.width = "0%";
  }, 3100);
}

// ==================== 7. MATCH EVALUATION ====================
/**
 * Term-definition matching logic:
 *   Two cards "match" if they share the same pairId — meaning one is a
 *   vocabulary TERM and the other is its DEFINITION. For example, clicking
 *   "Helicase" and then "Enzyme that unwinds the DNA double helix" is a
 *   match. This tests both spatial memory and biology knowledge.
 */

function evaluateMatch() {
  const [i, j] = state.flippedIndices;
  const cardA = state.cards[i];
  const cardB = state.cards[j];
  const elA = gridEl.children[i];
  const elB = gridEl.children[j];

  if (cardA.pairId === cardB.pairId) {
    // ---- MATCH! ----
    state.matchedIds.add(cardA.pairId);
    state.score++;
    scoreEl.textContent = state.score;

    // Clear countdown intervals.
    clearInterval(elA._cdInterval);
    clearInterval(elB._cdInterval);

    // Show "MATCH!!" overlay.
    showMatchOverlay();

    // Animate cards out.
    elA.classList.add("matched");
    elB.classList.add("matched");

    state.flippedIndices = [];
    state.isLocked = false;

    // Check win condition.
    if (state.score >= state.totalPairs) {
      setTimeout(() => triggerWin(), 800);
    }
  } else {
    // ---- No match — flip both back. ----
    elA.classList.remove("flipped");
    elB.classList.remove("flipped");
    state.flippedIndices = [];
    state.isLocked = false;
  }
}

function showMatchOverlay() {
  matchOverlay.classList.remove("hidden");
  setTimeout(() => matchOverlay.classList.add("hidden"), 900);
}

// ==================== 8. SPECIAL CARD — TRIVIA ====================
/**
 * When the special (wild) card is clicked:
 *   1. A random trivia question is shown in a modal.
 *   2. CORRECT answer → one unmatched pair is automatically removed
 *      from the board (free match!).
 *   3. WRONG answer → all remaining cards are reshuffled on the grid
 *      (positions randomized, making it harder).
 */

function triggerTrivia() {
  // Pick a random unused question.
  let available = TRIVIA_QUESTIONS.map((_, i) => i).filter(i => !state.triviaUsed.has(i));
  if (available.length === 0) {
    // All used — reset pool.
    state.triviaUsed.clear();
    available = TRIVIA_QUESTIONS.map((_, i) => i);
  }

  // On higher levels, prefer harder questions.
  if (state.level >= 3) {
    const hard = available.filter(i => TRIVIA_QUESTIONS[i].difficulty === "hard");
    if (hard.length > 0) available = hard;
  } else if (state.level >= 2) {
    const med = available.filter(i => TRIVIA_QUESTIONS[i].difficulty !== "easy");
    if (med.length > 0) available = med;
  }

  const qIdx = available[Math.floor(Math.random() * available.length)];
  state.triviaUsed.add(qIdx);
  const q = TRIVIA_QUESTIONS[qIdx];

  // Populate modal.
  const diffEl = document.getElementById("trivia-difficulty");
  diffEl.textContent = q.difficulty.toUpperCase();
  diffEl.className = `trivia-difficulty ${q.difficulty}`;

  document.getElementById("trivia-question").textContent = q.question;

  const choicesEl = document.getElementById("trivia-choices");
  choicesEl.innerHTML = "";
  const feedbackEl = document.getElementById("trivia-feedback");
  feedbackEl.classList.add("hidden");

  q.choices.forEach((choice, ci) => {
    const btn = document.createElement("button");
    btn.className = "trivia-choice-btn";
    btn.textContent = choice;
    btn.addEventListener("click", () => handleTriviaAnswer(ci, q.answer, btn, choicesEl));
    choicesEl.appendChild(btn);
  });

  triviaModal.classList.remove("hidden");
}

function handleTriviaAnswer(chosen, correct, btnEl, choicesEl) {
  const feedbackEl = document.getElementById("trivia-feedback");
  feedbackEl.classList.remove("hidden");

  // Disable all buttons.
  choicesEl.querySelectorAll("button").forEach(b => b.style.pointerEvents = "none");

  // Highlight correct answer.
  choicesEl.children[correct].classList.add("correct");

  if (chosen === correct) {
    btnEl.classList.add("correct");
    feedbackEl.textContent = "Correct! A pair has been removed from the board.";
    feedbackEl.style.color = "var(--protein)";

    setTimeout(() => {
      triviaModal.classList.add("hidden");
      removeOnePair();
      // Also hide the special card itself.
      hideSpecialCard();
      state.isLocked = false;
    }, 1500);
  } else {
    btnEl.classList.add("wrong");
    feedbackEl.textContent = "Incorrect! The board will be reshuffled.";
    feedbackEl.style.color = "var(--enzyme)";

    setTimeout(() => {
      triviaModal.classList.add("hidden");
      shuffleBoard();
      hideSpecialCard();
      state.isLocked = false;
    }, 1500);
  }
}

/** Remove one unmatched pair from the board as a reward. */
function removeOnePair() {
  // Find an unmatched pair.
  const unmatchedPairIds = [];
  state.cards.forEach(c => {
    if (!c.isSpecial && !state.matchedIds.has(c.pairId)) {
      if (!unmatchedPairIds.includes(c.pairId)) unmatchedPairIds.push(c.pairId);
    }
  });

  if (unmatchedPairIds.length === 0) return;

  const pairId = unmatchedPairIds[Math.floor(Math.random() * unmatchedPairIds.length)];
  state.matchedIds.add(pairId);
  state.score++;
  scoreEl.textContent = state.score;

  // Animate the pair out.
  state.cards.forEach((c, idx) => {
    if (c.pairId === pairId) {
      const el = gridEl.children[idx];
      el.classList.add("flipped");
      setTimeout(() => el.classList.add("matched"), 400);
    }
  });

  showMatchOverlay();

  // Check win.
  if (state.score >= state.totalPairs) {
    setTimeout(() => triggerWin(), 1000);
  }
}

/** Hide the special card after it's been used. */
function hideSpecialCard() {
  state.cards.forEach((c, idx) => {
    if (c.isSpecial) {
      const el = gridEl.children[idx];
      el.classList.add("matched");
    }
  });
}

/** Reshuffle unmatched card positions on the board (penalty). */
function shuffleBoard() {
  // Collect indices and card data for unmatched, non-special cards.
  const activeIndices = [];
  const activeCards = [];

  state.cards.forEach((card, idx) => {
    if (!state.matchedIds.has(card.pairId) && !card.isSpecial) {
      activeIndices.push(idx);
      activeCards.push(card);
    }
  });

  // Shuffle the active cards among those positions.
  shuffle(activeCards);
  activeIndices.forEach((gridIdx, i) => {
    state.cards[gridIdx] = activeCards[i];
  });

  // Flip all cards back and add shuffle animation.
  activeIndices.forEach(idx => {
    const el = gridEl.children[idx];
    el.classList.remove("flipped");
    el.classList.add("shuffling");
    setTimeout(() => el.classList.remove("shuffling"), 700);
  });

  // Re-render card faces to match new data.
  setTimeout(() => renderGrid(), 750);
}

// ==================== 9. TIMER ====================

function startTimer() {
  stopTimer();
  state.elapsedSeconds = 0;
  timerEl.textContent = "0:00";
  state.timerInterval = setInterval(() => {
    state.elapsedSeconds++;
    timerEl.textContent = formatTime(state.elapsedSeconds);
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

// ==================== 10. WIN & CELEBRATION ====================

function triggerWin() {
  stopTimer();
  winMessage.textContent = `Level ${state.level} completed in ${formatTime(state.elapsedSeconds)}!`;
  winOverlay.classList.remove("hidden");
  launchConfetti();
}

// ---- Confetti effect (pure canvas, no dependencies) ----

function launchConfetti() {
  const canvas = confettiCanvas;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#3B82F6", "#22C55E", "#A855F7", "#F97316", "#14B8A6", "#EF4444", "#EAB308", "#38bdf8"];
  const pieces = [];

  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 10
    });
  }

  let frame = 0;
  const maxFrames = 180; // ~3 seconds at 60fps

  function animate() {
    if (frame > maxFrames) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      p.vy += 0.05; // gravity

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    frame++;
    requestAnimationFrame(animate);
  }
  animate();
}

// ==================== 11. GAME INIT ====================

function startGame() {
  // Reset state.
  state.score = 0;
  state.totalPairs = 12;
  state.flippedIndices = [];
  state.matchedIds = new Set();
  state.isLocked = false;
  state.specialTriggered = false;

  scoreEl.textContent = "0";
  totalPairsEl.textContent = state.totalPairs;
  levelEl.textContent = state.level;
  winOverlay.classList.add("hidden");
  triviaModal.classList.add("hidden");

  // Generate & render.
  state.cards = generateCards();
  renderGrid();
  startTimer();
}

// Start on load.
startGame();
