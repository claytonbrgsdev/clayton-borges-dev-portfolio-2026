// LAB NARRATIVE — three-act story structure
// Drives: LabChrome navigation + landing page roadmap

export type LabPartNumber = 1 | 2 | 3;

export interface LabPart {
  number: LabPartNumber;
  id: "form" | "force" | "mind";
  title: string;
  titlePt: string;
  subtitle: string;
  subtitlePt: string;
  tagline: string;
  taglinePt: string;
  arc: string;
  arcPt: string;
  accent: string;        // primary CSS color
  accentMuted: string;   // rgba version for backgrounds
  phases: string[];      // ordered routes
}

export const LAB_PARTS: LabPart[] = [
  {
    number: 1,
    id: "form",
    title: "FORM",
    titlePt: "FORMA",
    subtitle: "Geometry · Mechanism · Emergence",
    subtitlePt: "Geometria · Mecanismo · Emergência",
    tagline: "before force, there is geometry",
    taglinePt: "antes da força, há geometria",
    arc: "The simplest machine. Chemistry that draws without a hand. A network with no center. Form arises before force names it.",
    arcPt: "A máquina mais simples. Química que desenha sem uma mão. Uma rede sem centro. A forma surge antes de a força nomeá-la.",
    accent: "#C84030",
    accentMuted: "rgba(200,64,48,0.14)",
    phases: [
      "/lab-phase-14",
      "/lab-phase-17",
      "/lab-phase-17-b",
      "/lab-phase-18",
      "/lab-phase-18-b",
      "/lab-phase-19",
      "/lab-phase-19-b",
      "/lab-phase-19-c",
      "/lab-phase-20",
      "/lab-phase-20-b",
    ],
  },
  {
    number: 2,
    id: "force",
    title: "FORCE",
    titlePt: "FORÇA",
    subtitle: "Criticality · Chaos · Computation",
    subtitlePt: "Criticalidade · Caos · Computação",
    tagline: "the cascade from order to complexity",
    taglinePt: "a cascata da ordem à complexidade",
    arc: "Sand topples at the critical threshold. The butterfly breaks the forecast. One rule iterated becomes infinite detail. The boundary itself is fractal.",
    arcPt: "A areia tomba no limiar crítico. A borboleta quebra a previsão. Uma regra iterada se torna detalhe infinito. O limite em si é fractal.",
    accent: "#3060D0",
    accentMuted: "rgba(48,96,208,0.14)",
    phases: [
      "/lab-phase-20-c",
      "/lab-phase-21",
      "/lab-phase-22-b",
      "/lab-phase-22-c",
      "/lab-phase-23",
      "/lab-phase-23-b",
      "/lab-phase-23-c",
    ],
  },
  {
    number: 3,
    id: "mind",
    title: "MIND",
    titlePt: "MENTE",
    subtitle: "Fractals · Universality · The Question",
    subtitlePt: "Fractais · Universalidade · A Questão",
    tagline: "you were watching yourself think",
    taglinePt: "você estava observando a si mesmo pensar",
    arc: "Mandelbrot contains Mandelbrot. Molecules phase-transition. The ant builds a highway from two rules. Then the question the lab was building toward.",
    arcPt: "Mandelbrot contém Mandelbrot. Moléculas transitam de fase. A formiga constrói uma rodovia com duas regras. Então a questão para a qual o lab estava se construindo.",
    accent: "#8040C0",
    accentMuted: "rgba(128,64,192,0.14)",
    phases: [
      "/lab-phase-24-c",
      "/lab-phase-25",
      "/lab-phase-25-b",
      "/lab-phase-25-c",
      "/lab-phase-26",
    ],
  },
];

// ── Flat sequence with full navigation info ────────────────────────────────────

const _flat = LAB_PARTS.flatMap((part) =>
  part.phases.map((route, idx) => ({
    route,
    partNumber: part.number,
    partId: part.id,
    partTitle: part.title,
    partAccent: part.accent,
    indexInPart: idx,
    totalInPart: part.phases.length,
  }))
);

export const LAB_SEQUENCE = _flat.map((entry, gi) => ({
  ...entry,
  prevRoute: gi > 0 ? _flat[gi - 1].route : null,
  nextRoute: gi < _flat.length - 1 ? _flat[gi + 1].route : null,
  isLastInPart: entry.indexInPart === entry.totalInPart - 1,
  isLastOverall: gi === _flat.length - 1,
}));

export function getLabNav(route: string) {
  return LAB_SEQUENCE.find((s) => s.route === route) ?? null;
}

// ── Roman numeral helpers ──────────────────────────────────────────────────────
export const ROMAN: Record<LabPartNumber, string> = { 1: "I", 2: "II", 3: "III" };
