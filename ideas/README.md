# Game Ideas

Log new game concepts here. Use the template below for each idea.

---

## Template

### Game Title
**Concept:** One sentence describing what the player does.
**Core mechanic:** The main interaction loop (e.g., drag-and-drop, timed quiz, tower defense).
**Biology focus:** What biological system, process, or topic it teaches.
**Accuracy notes:** Any key biological facts the game must get right.
**Complexity:** `simple` / `medium` / `complex`
**Status:** `idea` / `in design` / `in development`

---

## Immune Invaders

**Concept:** Play as a neutrophil defending the body from waves of descending viruses in a Space Invaders-style arcade shooter.
**Core mechanic:** Left/right movement, shoot antibody projectiles upward, survive waves of virus formations that descend and speed up over time.
**Biology focus:** Innate and adaptive immune response — virus morphology, phagocytosis, antibody neutralization, interferons, complement system.
**Complexity:** `medium`
**Status:** `idea`

---

### Pitch

Space Invaders is a timeless arcade loop. Immune Invaders keeps that loop intact — formation enemies, escalating speed, player projectiles — but layers in biological accuracy through art, mechanics, and narrative moments rather than interrupting gameplay to teach.

The player is a neutrophil. The enemies are recognizable viruses with accurate silhouettes: coronavirus (sphere + spike proteins), influenza (sphere + hemagglutinin/neuraminidase), T4 bacteriophage (geometric head + tail fibers). The projectile is a Y-shaped antibody. None of this requires the player to stop and study — the accuracy is ambient, absorbed through repetition. But when a virus breaks through and "infects" the player, a brief endocytosis animation plays (the virus binding, membrane engulfing it) before health is deducted. That moment of loss is also a lesson.

Power-ups are immune molecules: interferons slow all viruses on screen, complement proteins burst a cluster, cytokines call in a helper T-cell for a short fire-rate boost. None of these are arbitrary pickups — they're the actual tools the immune system uses.

The game never pretends a little shooter lives inside cells. It just uses the immune system as the design vocabulary.

---

### Accuracy Notes

- **Virus shapes must be recognizable:** coronavirus = sphere with evenly-spaced club-shaped spikes; influenza = sphere with two spike types (hemagglutinin triangular, neuraminidase mushroom); T4 bacteriophage = icosahedral head, collar, contractile tail, base plate + tail fibers. These are distinct enough to draw simply and still be identifiable.
- **Player cell:** Neutrophils are the first responders of innate immunity — correctly positioned as the front-line defender. They use degranulation and phagocytosis, not literal shooting, but the abstraction is justified.
- **Antibody projectile:** Antibodies (IgG Y-shape) are produced by B-cells, not neutrophils — acknowledged as a gameplay abstraction. Could narratively frame it as "the adaptive response backing up the innate."
- **Viral entry animation:** Should show receptor binding → membrane fusion or endocytosis (not injection), which is accurate for enveloped viruses. T4 infects bacteria, not human cells — could be a wave-specific enemy framed as "opportunistic pathogen."
- **Power-ups:** Interferon-α/β genuinely interfere with viral replication; complement genuinely lyses pathogens; cytokine signaling genuinely recruits immune cells. Mechanics should mirror this (slow vs. burst damage vs. fire rate).
- **Death state:** "The virus won" = not death but infection — could show a cell being lysed or the patient's immune system overwhelmed.

---

### Build Steps

#### 1. Project scaffold
- Create `games/immune-invaders/` with `index.html`, `game.js`, `styles.css`
- `styles.css` imports `../../shared/styles.css`, adds canvas layout
- Add a game card to root `index.html`

#### 2. HTML shell
- `<canvas>` element as the game surface
- HUD overlay: health bar (labeled "Cell Membrane Integrity"), score ("Viruses Neutralized"), wave counter, pause button
- Game-over and wave-clear screens as hidden overlay divs

#### 3. Game loop
- `requestAnimationFrame` loop with delta-time for frame-rate independence
- State machine: `menu` → `playing` → `wave_clear` → `game_over`

#### 4. Player entity
- Neutrophil sprite drawn on canvas (roughly circular cell with lobed nucleus visible)
- Moves left/right with arrow keys or A/D; clamped to canvas bounds
- Shoots on spacebar; short cooldown between shots

#### 5. Projectile system
- Antibody projectiles: Y-shaped, drawn with canvas paths, travel upward
- Projectile pool to avoid GC churn
- Collision detection: axis-aligned bounding box against each enemy

#### 6. Enemy entities — virus types
- **Coronavirus** (wave 1+): Slow, 3 HP, sphere + spike silhouette
- **Influenza** (wave 2+): Medium speed, 2 HP, two spike-type silhouette
- **Bacteriophage** (wave 4+): Fast, 1 HP but erratic movement, geometric shape
- Each type is a config object with: `hp`, `speed`, `points`, `drawFn`, `hitAnimation`

#### 7. Formation system
- Enemies spawn in a grid formation (classic Space Invaders style)
- Formation moves side-to-side, drops a row each time it hits a wall
- Speed increases as enemies are eliminated (fewer = faster)
- New wave = new formation with mix of virus types

#### 8. Viral entry animation
- When a virus reaches the bottom (or collides with player), play a short canvas animation: virus binds to player surface, membrane curves around it (endocytosis), cell flashes red
- Deduct one health unit; then resume

#### 9. Power-up system
- Power-ups drop randomly from destroyed viruses
- **Interferon (blue):** All viruses slow to 40% speed for 5 seconds
- **Complement (orange):** AOE burst around a random virus cluster
- **Cytokine (green):** Fire rate doubles for 8 seconds
- Drawn as small labeled molecules, collected by player movement

#### 10. Wave progression and interstitials
- Wave 1–2: Coronavirus only, slow formation
- Wave 3: Mix of coronavirus + influenza
- Wave 4+: All three types; speed and HP scale up
- Every 5 waves: one-sentence biology fact screen ("Influenza mutates rapidly — that's why the flu shot changes every year")

#### 11. Scoring
- Points per kill weighted by virus HP
- Multiplier for clearing a wave without getting hit
- High score persisted in `localStorage`

#### 12. Visual polish
- Cell-fluid background (blue-tinted, organic)
- Enemy death: particle burst in virus color
- Player hit: red ripple on canvas border

#### 13. Platform integration
- Card added to root `index.html` with description
- Consistent with BioMatch card styling
