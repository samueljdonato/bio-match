/**
 * drawings.js — Inline SVG biology illustrations for the image matching mode.
 *
 * Each drawing is a function returning an SVG string sized to fit a card.
 * Drawings are intentionally simple/schematic so they're clear at small sizes.
 */

const BIO_DRAWINGS = {
  "Double Helix": `
    <svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 10 C45 25, 55 25, 55 40 C55 55, 45 55, 25 70 C5 85, 55 95, 55 95"
            fill="none" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/>
      <path d="M55 10 C35 25, 25 25, 25 40 C25 55, 35 55, 55 70 C75 85, 25 95, 25 95"
            fill="none" stroke="#60A5FA" stroke-width="3" stroke-linecap="round"/>
      <line x1="30" y1="18" x2="50" y2="18" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="28" y1="30" x2="52" y2="30" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="30" y1="42" x2="50" y2="42" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="28" y1="54" x2="52" y2="54" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="30" y1="66" x2="50" y2="66" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="28" y1="78" x2="52" y2="78" stroke="#94a3b8" stroke-width="1.5"/>
    </svg>`,

  "Mitochondria": `
    <svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="35" rx="45" ry="28" fill="none" stroke="#A855F7" stroke-width="2.5"/>
      <ellipse cx="50" cy="35" rx="40" ry="23" fill="none" stroke="#C084FC" stroke-width="1.5"/>
      <path d="M20 25 C30 45, 25 50, 20 35" fill="none" stroke="#C084FC" stroke-width="1.5"/>
      <path d="M35 20 C42 48, 38 52, 33 30" fill="none" stroke="#C084FC" stroke-width="1.5"/>
      <path d="M50 18 C55 50, 52 55, 48 28" fill="none" stroke="#C084FC" stroke-width="1.5"/>
      <path d="M65 20 C70 46, 67 50, 63 30" fill="none" stroke="#C084FC" stroke-width="1.5"/>
      <path d="M78 28 C82 42, 79 48, 76 34" fill="none" stroke="#C084FC" stroke-width="1.5"/>
    </svg>`,

  "Ribosome": `
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="50" rx="28" ry="20" fill="#22C55E" opacity="0.3" stroke="#22C55E" stroke-width="2"/>
      <ellipse cx="40" cy="32" rx="22" ry="15" fill="#4ADE80" opacity="0.3" stroke="#4ADE80" stroke-width="2"/>
      <text x="40" y="35" text-anchor="middle" font-size="8" fill="#4ADE80" font-weight="bold">40S</text>
      <text x="40" y="54" text-anchor="middle" font-size="8" fill="#22C55E" font-weight="bold">60S</text>
      <path d="M15 38 Q5 38, 5 28 L5 15" fill="none" stroke="#F97316" stroke-width="1.5" stroke-dasharray="3,2"/>
    </svg>`,

  "Cell Membrane": `
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(5,10)">
        ${Array.from({length: 9}, (_, i) => {
          const x = 5 + i * 10;
          return `<circle cx="${x}" cy="20" r="4" fill="#3B82F6" opacity="0.7"/>
                  <line x1="${x}" y1="24" x2="${x-2}" y2="38" stroke="#60A5FA" stroke-width="1.2"/>
                  <line x1="${x}" y1="24" x2="${x+2}" y2="38" stroke="#60A5FA" stroke-width="1.2"/>`;
        }).join('')}
      </g>
      <g transform="translate(5,10)">
        ${Array.from({length: 9}, (_, i) => {
          const x = 5 + i * 10;
          return `<circle cx="${x}" cy="55" r="4" fill="#3B82F6" opacity="0.7"/>
                  <line x1="${x}" y1="51" x2="${x-2}" y2="38" stroke="#60A5FA" stroke-width="1.2"/>
                  <line x1="${x}" y1="51" x2="${x+2}" y2="38" stroke="#60A5FA" stroke-width="1.2"/>`;
        }).join('')}
      </g>
    </svg>`,

  "Nucleus": `
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="32" fill="none" stroke="#A855F7" stroke-width="2.5" stroke-dasharray="4,3"/>
      <circle cx="40" cy="40" r="30" fill="none" stroke="#C084FC" stroke-width="1"/>
      <circle cx="40" cy="40" r="12" fill="#7C3AED" opacity="0.4" stroke="#A855F7" stroke-width="1.5"/>
      <text x="40" y="44" text-anchor="middle" font-size="6" fill="#C084FC">nucleolus</text>
      <circle cx="18" cy="28" r="2" fill="#C084FC" opacity="0.5"/>
      <circle cx="58" cy="52" r="2" fill="#C084FC" opacity="0.5"/>
      <circle cx="55" cy="25" r="2" fill="#C084FC" opacity="0.5"/>
    </svg>`,

  "Golgi Apparatus": `
    <svg viewBox="0 0 90 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 20 Q45 15, 70 20" fill="none" stroke="#A855F7" stroke-width="3" stroke-linecap="round"/>
      <path d="M18 32 Q45 27, 72 32" fill="none" stroke="#C084FC" stroke-width="3" stroke-linecap="round"/>
      <path d="M16 44 Q45 39, 74 44" fill="none" stroke="#D8B4FE" stroke-width="3" stroke-linecap="round"/>
      <path d="M18 56 Q45 51, 72 56" fill="none" stroke="#C084FC" stroke-width="3" stroke-linecap="round"/>
      <circle cx="75" cy="24" r="4" fill="#A855F7" opacity="0.5" stroke="#A855F7" stroke-width="1"/>
      <circle cx="78" cy="38" r="3" fill="#C084FC" opacity="0.5" stroke="#C084FC" stroke-width="1"/>
      <circle cx="12" cy="50" r="3.5" fill="#D8B4FE" opacity="0.5" stroke="#D8B4FE" stroke-width="1"/>
    </svg>`,

  "Chromosome": `
    <svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 15 C28 15, 22 18, 22 30 L22 42 C22 46, 26 50, 30 50"
            fill="none" stroke="#3B82F6" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 50 C26 50, 22 54, 22 58 L22 70 C22 82, 28 85, 30 85"
            fill="none" stroke="#3B82F6" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 15 C52 15, 58 18, 58 30 L58 42 C58 46, 54 50, 50 50"
            fill="none" stroke="#60A5FA" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 50 C54 50, 58 54, 58 58 L58 70 C58 82, 52 85, 50 85"
            fill="none" stroke="#60A5FA" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="40" cy="50" rx="12" ry="4" fill="#1e293b" stroke="#EF4444" stroke-width="1.5"/>
    </svg>`,

  "ATP Molecule": `
    <svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="22" rx="4" ry="4" width="22" height="26" fill="#14B8A6" opacity="0.3" stroke="#14B8A6" stroke-width="1.5"/>
      <text x="19" y="39" text-anchor="middle" font-size="7" fill="#14B8A6" font-weight="bold">A</text>
      <rect x="32" y="25" rx="3" ry="3" width="14" height="20" fill="#F97316" opacity="0.3" stroke="#F97316" stroke-width="1.5"/>
      <text x="39" y="38" text-anchor="middle" font-size="6" fill="#F97316" font-weight="bold">R</text>
      <circle cx="56" cy="35" r="8" fill="#EF4444" opacity="0.25" stroke="#EF4444" stroke-width="1.5"/>
      <text x="56" y="38" text-anchor="middle" font-size="6" fill="#EF4444" font-weight="bold">P</text>
      <line x1="64" y1="35" x2="70" y2="35" stroke="#EAB308" stroke-width="2"/>
      <text x="67" y="30" text-anchor="middle" font-size="5" fill="#EAB308">~</text>
      <circle cx="76" cy="35" r="8" fill="#EF4444" opacity="0.25" stroke="#EF4444" stroke-width="1.5"/>
      <text x="76" y="38" text-anchor="middle" font-size="6" fill="#EF4444" font-weight="bold">P</text>
      <line x1="84" y1="35" x2="90" y2="35" stroke="#EAB308" stroke-width="2"/>
      <text x="87" y="30" text-anchor="middle" font-size="5" fill="#EAB308">~</text>
      <circle cx="96" cy="35" r="8" fill="#EF4444" opacity="0.25" stroke="#EF4444" stroke-width="1.5" transform="translate(-2,0)"/>
      <text x="94" y="38" text-anchor="middle" font-size="6" fill="#EF4444" font-weight="bold">P</text>
    </svg>`,

  "tRNA": `
    <svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 10 L40 25" stroke="#14B8A6" stroke-width="2.5" stroke-linecap="round"/>
      <text x="40" y="8" text-anchor="middle" font-size="6" fill="#F97316">amino acid</text>
      <path d="M40 25 C20 30, 10 45, 20 55 C30 65, 20 70, 15 75"
            fill="none" stroke="#14B8A6" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M40 25 C60 30, 70 45, 60 55 C50 65, 60 70, 65 75"
            fill="none" stroke="#14B8A6" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M15 75 C20 82, 30 85, 40 88 C50 85, 60 82, 65 75"
            fill="none" stroke="#14B8A6" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="28" y="88" rx="2" ry="2" width="24" height="8" fill="none" stroke="#EF4444" stroke-width="1.5"/>
      <text x="40" y="95" text-anchor="middle" font-size="5.5" fill="#EF4444">anticodon</text>
    </svg>`,

  "Cell": `
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="40" rx="45" ry="34" fill="none" stroke="#22C55E" stroke-width="2.5"/>
      <circle cx="38" cy="35" r="10" fill="none" stroke="#A855F7" stroke-width="1.5" stroke-dasharray="3,2"/>
      <circle cx="38" cy="35" r="3" fill="#7C3AED" opacity="0.4"/>
      <ellipse cx="65" cy="28" rx="12" ry="7" fill="none" stroke="#C084FC" stroke-width="1.2"/>
      <path d="M58 25 L58 31 M62 24 L62 32 M66 25 L66 31 M70 26 L70 30" stroke="#C084FC" stroke-width="0.8"/>
      <circle cx="25" cy="55" r="3" fill="#14B8A6" opacity="0.4" stroke="#14B8A6" stroke-width="1"/>
      <circle cx="60" cy="55" r="2.5" fill="#14B8A6" opacity="0.4" stroke="#14B8A6" stroke-width="1"/>
      <circle cx="72" cy="48" r="2" fill="#EF4444" opacity="0.4" stroke="#EF4444" stroke-width="1"/>
    </svg>`,

  "Enzyme": `
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 55 C15 25, 35 15, 50 15 C65 15, 75 25, 75 35 C75 45, 85 45, 85 55 C85 65, 75 70, 65 65 C55 60, 50 65, 40 65 C30 65, 15 65, 15 55Z"
            fill="#EF4444" opacity="0.2" stroke="#EF4444" stroke-width="2"/>
      <path d="M55 60 C58 55, 62 52, 65 55" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="62" y="48" rx="2" ry="2" width="14" height="10" fill="#EAB308" opacity="0.3" stroke="#EAB308" stroke-width="1.5" transform="rotate(10,69,53)"/>
      <text x="50" y="42" text-anchor="middle" font-size="6" fill="#EF4444">active</text>
      <text x="50" y="49" text-anchor="middle" font-size="6" fill="#EF4444">site</text>
      <text x="74" y="47" text-anchor="middle" font-size="5" fill="#EAB308">substrate</text>
    </svg>`,

  "Plasma Membrane Protein": `
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="30" width="90" height="20" fill="#3B82F6" opacity="0.15"/>
      <line x1="5" y1="30" x2="95" y2="30" stroke="#3B82F6" stroke-width="1.5"/>
      <line x1="5" y1="50" x2="95" y2="50" stroke="#3B82F6" stroke-width="1.5"/>
      <path d="M35 15 C30 15, 28 20, 28 25 L28 30 L28 50 L28 55 C28 60, 30 65, 35 65
              L65 65 C70 65, 72 60, 72 55 L72 50 L72 30 L72 25 C72 20, 70 15, 65 15Z"
            fill="#22C55E" opacity="0.3" stroke="#22C55E" stroke-width="2"/>
      <ellipse cx="50" cy="40" rx="8" ry="5" fill="none" stroke="#22C55E" stroke-width="1.5"/>
    </svg>`,

  "Neuron": `
    <svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="35" r="12" fill="#F97316" opacity="0.25" stroke="#F97316" stroke-width="2"/>
      <circle cx="20" cy="35" r="4" fill="#F97316" opacity="0.4"/>
      <line x1="32" y1="35" x2="75" y2="35" stroke="#F97316" stroke-width="2.5"/>
      <line x1="8" y1="22" x2="15" y2="28" stroke="#F97316" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="5" y1="35" x2="8" y2="35" stroke="#F97316" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="8" y1="48" x2="15" y2="42" stroke="#F97316" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="12" y1="18" x2="17" y2="25" stroke="#F97316" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="12" y1="52" x2="17" y2="45" stroke="#F97316" stroke-width="1.5" stroke-linecap="round"/>
      <ellipse cx="42" cy="35" rx="6" ry="5" fill="none" stroke="#EAB308" stroke-width="1" opacity="0.6"/>
      <ellipse cx="55" cy="35" rx="6" ry="5" fill="none" stroke="#EAB308" stroke-width="1" opacity="0.6"/>
      <ellipse cx="68" cy="35" rx="6" ry="5" fill="none" stroke="#EAB308" stroke-width="1" opacity="0.6"/>
      <line x1="75" y1="35" x2="82" y2="25" stroke="#F97316" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="75" y1="35" x2="85" y2="35" stroke="#F97316" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="75" y1="35" x2="82" y2="45" stroke="#F97316" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="85" cy="25" r="2" fill="#F97316" opacity="0.5"/>
      <circle cx="88" cy="35" r="2" fill="#F97316" opacity="0.5"/>
      <circle cx="85" cy="45" r="2" fill="#F97316" opacity="0.5"/>
    </svg>`,

  "Virus": `
    <svg viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg">
      <polygon points="40,12 62,26 62,54 40,68 18,54 18,26" fill="#EF4444" opacity="0.15" stroke="#EF4444" stroke-width="2"/>
      <circle cx="40" cy="40" r="14" fill="none" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="2,2"/>
      <line x1="40" y1="12" x2="40" y2="4" stroke="#EF4444" stroke-width="1.5"/>
      <circle cx="40" cy="3" r="2" fill="#EF4444"/>
      <line x1="62" y1="26" x2="70" y2="20" stroke="#EF4444" stroke-width="1.5"/>
      <circle cx="71" cy="19" r="2" fill="#EF4444"/>
      <line x1="62" y1="54" x2="70" y2="60" stroke="#EF4444" stroke-width="1.5"/>
      <circle cx="71" cy="61" r="2" fill="#EF4444"/>
      <line x1="40" y1="68" x2="40" y2="76" stroke="#EF4444" stroke-width="1.5"/>
      <circle cx="40" cy="77" r="2" fill="#EF4444"/>
      <line x1="18" y1="54" x2="10" y2="60" stroke="#EF4444" stroke-width="1.5"/>
      <circle cx="9" cy="61" r="2" fill="#EF4444"/>
      <line x1="18" y1="26" x2="10" y2="20" stroke="#EF4444" stroke-width="1.5"/>
      <circle cx="9" cy="19" r="2" fill="#EF4444"/>
    </svg>`,

  "Phospholipid": `
    <svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="20" r="12" fill="#3B82F6" opacity="0.35" stroke="#3B82F6" stroke-width="2"/>
      <text x="30" y="24" text-anchor="middle" font-size="7" fill="#3B82F6" font-weight="bold">P</text>
      <line x1="25" y1="32" x2="22" y2="85" stroke="#EAB308" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="35" y1="32" x2="38" y2="85" stroke="#EAB308" stroke-width="2.5" stroke-linecap="round"/>
      <text x="30" y="96" text-anchor="middle" font-size="5" fill="#94a3b8">hydrophobic tails</text>
      <text x="30" y="8" text-anchor="middle" font-size="5" fill="#94a3b8">hydrophilic head</text>
    </svg>`,

  "Endoplasmic Reticulum": `
    <svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 15 Q25 15, 25 25 Q25 35, 10 35" fill="none" stroke="#A855F7" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M10 35 Q25 35, 25 45 Q25 55, 10 55" fill="none" stroke="#A855F7" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M25 15 Q40 15, 40 25 Q40 35, 25 35" fill="none" stroke="#C084FC" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M25 35 Q40 35, 40 45 Q40 55, 25 55" fill="none" stroke="#C084FC" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M40 15 Q55 15, 55 25 Q55 35, 40 35" fill="none" stroke="#A855F7" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M40 35 Q55 35, 55 45 Q55 55, 40 55" fill="none" stroke="#A855F7" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="12" cy="18" r="1.5" fill="#22C55E"/>
      <circle cx="27" cy="22" r="1.5" fill="#22C55E"/>
      <circle cx="12" cy="38" r="1.5" fill="#22C55E"/>
      <circle cx="42" cy="18" r="1.5" fill="#22C55E"/>
      <circle cx="27" cy="42" r="1.5" fill="#22C55E"/>
      <circle cx="42" cy="38" r="1.5" fill="#22C55E"/>
      <text x="75" y="35" text-anchor="middle" font-size="5" fill="#22C55E">= ribosomes</text>
    </svg>`
};

/**
 * IMAGE_CONTENT_POOL — Terms paired with SVG drawing keys for the image game mode.
 * Each entry: { term, drawingKey, category }
 * drawingKey maps to BIO_DRAWINGS above.
 */
const IMAGE_CONTENT_POOL = [
  { term: "Double Helix",           drawingKey: "Double Helix",           category: "dna" },
  { term: "Mitochondria",           drawingKey: "Mitochondria",           category: "organelle" },
  { term: "Ribosome",               drawingKey: "Ribosome",              category: "organelle" },
  { term: "Cell Membrane",          drawingKey: "Cell Membrane",         category: "molecule" },
  { term: "Nucleus",                drawingKey: "Nucleus",               category: "organelle" },
  { term: "Golgi Apparatus",        drawingKey: "Golgi Apparatus",       category: "organelle" },
  { term: "Chromosome",             drawingKey: "Chromosome",            category: "dna" },
  { term: "ATP Molecule",           drawingKey: "ATP Molecule",          category: "molecule" },
  { term: "tRNA",                   drawingKey: "tRNA",                  category: "molecule" },
  { term: "Animal Cell",            drawingKey: "Cell",                  category: "organelle" },
  { term: "Enzyme",                 drawingKey: "Enzyme",                category: "enzyme" },
  { term: "Membrane Protein",       drawingKey: "Plasma Membrane Protein", category: "protein" },
  { term: "Neuron",                 drawingKey: "Neuron",                category: "process" },
  { term: "Virus",                  drawingKey: "Virus",                 category: "enzyme" },
  { term: "Phospholipid",           drawingKey: "Phospholipid",          category: "molecule" },
  { term: "Endoplasmic Reticulum",  drawingKey: "Endoplasmic Reticulum", category: "organelle" }
];
