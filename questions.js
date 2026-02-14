/**
 * questions.js — 30 multiple-choice biology trivia questions.
 *
 * Difficulty levels:
 *   "easy"   — Introductory biology (high-school / AP level)
 *   "medium" — College-level cell & molecular biology
 *   "hard"   — Graduate-level molecular biology
 *
 * Each question object:
 *   { difficulty, question, choices: [string], answer: index }
 */

const TRIVIA_QUESTIONS = [
  // ===== EASY (1–10) =====
  {
    difficulty: "easy",
    question: "What molecule is known as the 'energy currency' of the cell?",
    choices: ["ATP", "DNA", "RNA", "Glucose"],
    answer: 0
  },
  {
    difficulty: "easy",
    question: "Which organelle is called the 'powerhouse of the cell'?",
    choices: ["Nucleus", "Ribosome", "Mitochondrion", "Golgi apparatus"],
    answer: 2
  },
  {
    difficulty: "easy",
    question: "DNA is composed of how many strands in its typical form?",
    choices: ["1", "2", "3", "4"],
    answer: 1
  },
  {
    difficulty: "easy",
    question: "Which base pairs with adenine (A) in DNA?",
    choices: ["Cytosine", "Guanine", "Thymine", "Uracil"],
    answer: 2
  },
  {
    difficulty: "easy",
    question: "Ribosomes are the site of which cellular process?",
    choices: ["DNA replication", "Protein synthesis", "Lipid metabolism", "Cell division"],
    answer: 1
  },
  {
    difficulty: "easy",
    question: "What type of bond holds the two strands of DNA together?",
    choices: ["Covalent bonds", "Ionic bonds", "Hydrogen bonds", "Peptide bonds"],
    answer: 2
  },
  {
    difficulty: "easy",
    question: "Which organelle contains the cell's genetic material?",
    choices: ["Mitochondrion", "Ribosome", "Nucleus", "Lysosome"],
    answer: 2
  },
  {
    difficulty: "easy",
    question: "The process of copying DNA into mRNA is called:",
    choices: ["Translation", "Transcription", "Replication", "Transduction"],
    answer: 1
  },
  {
    difficulty: "easy",
    question: "Proteins are polymers of which monomer?",
    choices: ["Nucleotides", "Amino acids", "Fatty acids", "Monosaccharides"],
    answer: 1
  },
  {
    difficulty: "easy",
    question: "Which sugar is found in DNA but NOT in RNA?",
    choices: ["Ribose", "Deoxyribose", "Glucose", "Fructose"],
    answer: 1
  },

  // ===== MEDIUM (11–20) =====
  {
    difficulty: "medium",
    question: "Which enzyme unwinds the DNA double helix during replication?",
    choices: ["DNA polymerase", "Ligase", "Helicase", "Primase"],
    answer: 2
  },
  {
    difficulty: "medium",
    question: "The Okazaki fragments are produced on the:",
    choices: ["Leading strand", "Lagging strand", "Template strand", "mRNA strand"],
    answer: 1
  },
  {
    difficulty: "medium",
    question: "Which complex adds a 5' cap to eukaryotic mRNA?",
    choices: [
      "Spliceosome",
      "Capping enzyme (guanylyltransferase)",
      "Poly-A polymerase",
      "RNA polymerase II"
    ],
    answer: 1
  },
  {
    difficulty: "medium",
    question: "The signal recognition particle (SRP) directs ribosomes to the:",
    choices: [
      "Nucleus",
      "Mitochondrion",
      "Rough endoplasmic reticulum",
      "Golgi apparatus"
    ],
    answer: 2
  },
  {
    difficulty: "medium",
    question: "Which amino acid is always the first to be incorporated during translation in eukaryotes?",
    choices: ["Leucine", "Valine", "Methionine", "Glycine"],
    answer: 2
  },
  {
    difficulty: "medium",
    question: "Histones are proteins that help package DNA into:",
    choices: ["Ribosomes", "Chromatin", "Plasmids", "Capsids"],
    answer: 1
  },
  {
    difficulty: "medium",
    question: "Which type of RNA carries amino acids to the ribosome during translation?",
    choices: ["mRNA", "rRNA", "tRNA", "snRNA"],
    answer: 2
  },
  {
    difficulty: "medium",
    question: "The lac operon is regulated by which molecule acting as an inducer?",
    choices: ["Glucose", "Allolactose", "Lactose", "Galactose"],
    answer: 1
  },
  {
    difficulty: "medium",
    question: "Ubiquitin tagging marks proteins for degradation by the:",
    choices: ["Lysosome", "Proteasome", "Peroxisome", "Endosome"],
    answer: 1
  },
  {
    difficulty: "medium",
    question: "Which phase of the cell cycle includes DNA synthesis?",
    choices: ["G1 phase", "S phase", "G2 phase", "M phase"],
    answer: 1
  },

  // ===== HARD (21–30) =====
  {
    difficulty: "hard",
    question: "In eukaryotic transcription, which general transcription factor recognizes the TATA box?",
    choices: ["TFIIA", "TFIIB", "TFIID (TBP subunit)", "TFIIH"],
    answer: 2
  },
  {
    difficulty: "hard",
    question: "The Spliceosome catalyzes intron removal through which chemical mechanism?",
    choices: [
      "Hydrolysis",
      "Two sequential transesterification reactions",
      "Oxidative cleavage",
      "Phosphodiester bond isomerization"
    ],
    answer: 1
  },
  {
    difficulty: "hard",
    question: "Which histone modification is most associated with transcriptional activation?",
    choices: [
      "H3K9 trimethylation",
      "H3K27 trimethylation",
      "H3K4 trimethylation",
      "H4K20 trimethylation"
    ],
    answer: 2
  },
  {
    difficulty: "hard",
    question: "Telomerase is a reverse transcriptase. Which component provides its RNA template?",
    choices: ["TERT", "TERC (TR)", "Dyskerin", "POT1"],
    answer: 1
  },
  {
    difficulty: "hard",
    question: "In nonsense-mediated mRNA decay (NMD), the key surveillance factor that bridges the exon junction complex to UPF1 is:",
    choices: ["UPF2", "SMG1", "eRF3", "PABPC1"],
    answer: 0
  },
  {
    difficulty: "hard",
    question: "The CRISPRCas9 system achieves target specificity primarily through:",
    choices: [
      "PAM sequence recognition by Cas9",
      "Base-pairing between guide RNA and target DNA",
      "Chromatin accessibility",
      "Methylation-sensitive binding"
    ],
    answer: 1
  },
  {
    difficulty: "hard",
    question: "Which molecular motor moves cargo toward the plus end of microtubules?",
    choices: ["Dynein", "Kinesin", "Myosin II", "Myosin V"],
    answer: 1
  },
  {
    difficulty: "hard",
    question: "In the MAP kinase cascade, Ras activates which kinase first?",
    choices: ["MEK", "ERK", "Raf", "JNK"],
    answer: 2
  },
  {
    difficulty: "hard",
    question: "During V(D)J recombination, which enzyme complex introduces double-strand breaks at recombination signal sequences?",
    choices: [
      "Terminal deoxynucleotidyl transferase (TdT)",
      "RAG1/RAG2",
      "Artemis",
      "DNA-PKcs"
    ],
    answer: 1
  },
  {
    difficulty: "hard",
    question: "The Mediator complex in eukaryotic transcription primarily functions to:",
    choices: [
      "Unwind DNA at the promoter",
      "Phosphorylate the RNA Pol II CTD",
      "Bridge enhancer-bound activators to the general transcription machinery",
      "Recruit the spliceosome to nascent mRNA"
    ],
    answer: 2
  }
];
