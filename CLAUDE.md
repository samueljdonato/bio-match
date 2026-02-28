# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Vision: BioGames

This repository is the development hub for **BioGames** — a biology-focused game hosting platform where educational accuracy drives game design. BioMatch is the first game. Future work includes building additional games, logging game ideas in `ideas/`, and evolving the platform infrastructure.

**Core principle:** Biological accuracy is non-negotiable. Games should be genuinely fun and engaging, not just study tools dressed up as games.

---

## Running the Project

This is a **zero-dependency, pure vanilla HTML/CSS/JS** project. No build tools, no package managers, no compilation step.

To run locally, open `index.html` directly in a browser or use any static file server:
```
python3 -m http.server 8000
# or
npx serve .
```

There are no tests, no linting config, and no CI pipeline yet.

---

## Directory Structure

```
bio_match/                    ← repo root = BioGames platform
├── index.html               ← Platform homepage (game selector card grid)
├── shared/
│   └── styles.css           ← Shared dark theme, CSS variables, reset
├── games/
│   └── bio-match/           ← BioMatch game (self-contained)
│       ├── index.html
│       ├── game.js
│       ├── questions.js
│       ├── drawings.js
│       ├── styles.css       ← Game-specific styles only (imports shared)
│       └── images/          ← Custom artwork files
└── ideas/
    └── README.md            ← Template for logging new game concepts
```

**Adding a new game:** Create `games/[game-name]/` with its own `index.html`, JS, and `styles.css`. Import `../../shared/styles.css` at the top of each game's stylesheet. Add a game card to the root `index.html`.

---

## Shared Styles

`shared/styles.css` provides:
- CSS reset (`*, *::before, *::after`)
- `:root` design tokens: `--bg`, `--surface`, `--text`, `--text-dim`, `--accent`, and the six biology category colors (`--dna`, `--protein`, `--organelle`, `--process`, `--molecule`, `--enzyme`, `--special`)
- Base `body` styles (font, background, color)

Each game's `styles.css` adds `body { display: flex; ... }` layout overrides and all game-specific rules.

---

## BioMatch Architecture (`games/bio-match/`)

| File | Role |
|---|---|
| `index.html` | Shell, tab nav, HUD, modal markup |
| `game.js` | All game logic — state, card generation, match evaluation, trivia, timer, win |
| `questions.js` | 30 trivia questions (easy/medium/hard difficulty tiers) |
| `drawings.js` | Inline SVG biology illustrations + custom image fallback system |

**Game flow:**
- 5×5 grid = 12 matched pairs + 1 special WILD card
- Cards are term/definition pairs (or term/image pairs in image mode)
- Click reveals a card for 3 seconds; two cards with matching `pairId` = match
- WILD card triggers a trivia modal: correct → free pair removed; wrong → board reshuffled
- Level system narrows the category pool to make matches harder at higher levels

**Two game modes** (switchable mid-session):
- `definitions` — term card matches its definition card
- `images` — term card matches its SVG illustration

**Data model:**
- `CONTENT_POOLS` in `game.js`: term/definition pairs grouped by category (dna, protein, organelle, process, molecule, enzyme)
- `IMAGE_CONTENT_POOL` in `drawings.js`: term/drawingKey pairs for image mode
- `TRIVIA_QUESTIONS` in `questions.js`: `{ difficulty, question, choices[], answer }` (answer is an index)
- `BIO_DRAWINGS` in `drawings.js`: inline SVGs keyed by string name
- `CUSTOM_IMAGE_FILES` in `drawings.js`: maps drawing keys → filenames in `images/` folder (null = use inline SVG)

**Game state** is a single `state` object in `game.js` — no framework, no reactivity layer.

---

## Adding Content to BioMatch

**New term-definition pairs:** Add to the appropriate category array in `CONTENT_POOLS` (`game.js`).

**New trivia questions:** Append to `TRIVIA_QUESTIONS` (`questions.js`) with `difficulty: "easy"|"medium"|"hard"`.

**New illustrations:**
1. Add the drawing key to `BIO_DRAWINGS` in `drawings.js` with an inline SVG
2. Add an entry to `IMAGE_CONTENT_POOL` with `{ term, drawingKey, category }`
3. Optionally add custom artwork to `images/` and register in `CUSTOM_IMAGE_FILES`
