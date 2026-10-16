import type { Lens, MountId } from "@/types/lens";
import { MOUNTS } from "@/data/mounts";
import { BRANDS } from "@/data/brands";

/** All values in millimetres. The optical axis is +Y, the mount flange sits at y = 0. */
export type Pt = [r: number, y: number];
export type Group = "rear" | "front";
export type RingRole = "zoom" | "focus" | "aperture";

/** Angle (around the barrel) facing the default camera: labels and index marks live here. */
export const INDEX_THETA = Math.PI * 0.75;
/** How far each ring turns over its full travel. */
export const RING_TRAVEL: Record<RingRole, number> = {
  zoom: Math.PI * 0.55,
  focus: Math.PI * 0.9,
  aperture: Math.PI * 0.5,
};

export interface ScaleBand {
  y0: number;
  y1: number;
  /** Mark positions as 0..1 around the ring in ring-local space. */
  marks: { u: number; text: string; color?: string }[];
}

export interface Ring {
  role: RingRole;
  gear: boolean;
  y0: number;
  y1: number;
  r: number;
  ribs: number;
  depth: number;
  group: Group;
  band?: ScaleBand;
}

export interface IndexMark {
  y: number;
  group: Group;
}

export interface Label {
  y: number;
  h: number;
  group: Group;
  brand: string;
  brandFont: string;
  name: string;
  badge?: { text: string; bg: string; fg: string; round?: boolean };
}

export interface SwitchPanel {
  y: number;
  h: number;
  count: number;
}

export interface AccentRing {
  y: number;
  h: number;
  color: string;
  group: Group;
}

export interface LensProfile {
  length: number;
  radius: number;
  throatR: number;
  rear: Pt[];
  front: Pt[];
  /** Outer silhouette from flange to front face, for 2D drawings. */
  outline: Pt[];
  splitY: number;
  extension: number;
  innerTubeR: number;
  glass: { y: number; r: number; bulge: number; oval: number; tint: string };
  innerElements: { y: number; r: number; bulge: number }[];
  nameRing: { y: number; rIn: number; rOut: number; text: string } | null;
  bladesY: number;
  rings: Ring[];
  indexMarks: IndexMark[];
  label: Label | null;
  switches: SwitchPanel | null;
  accents: AccentRing[];
  hoodBayonet: boolean;
  hood: { r0: number; r1: number; depth: number; petalCut: number; y: number } | null;
  petalHood: boolean;
  bodyColor: string;
  printColor: string;
  rubberColor: string;
  indexColor: string;
}

const BODY_COLORS = {
  black: "#1f1f23",
  white: "#e8e7e2",
  silver: "#b8bbc0",
} as const;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

function brandWordmark(lens: Lens): { text: string; font: string } {
  const H = 128;
  switch (lens.brand) {
    case "canon":
      return { text: "Canon", font: `italic bold ${H * 0.62}px Georgia, "Times New Roman", serif` };
    case "sony":
      return { text: "SONY", font: `900 ${H * 0.6}px "Arial Black", ${FONT}` };
    case "nikon":
      return { text: "Nikon", font: `italic 900 ${H * 0.6}px "Arial Black", ${FONT}` };
    case "fujifilm":
      return { text: "FUJINON", font: `bold ${H * 0.52}px ${FONT}` };
    case "om-system":
      return { text: "OM SYSTEM", font: `bold ${H * 0.5}px ${FONT}` };
    case "panasonic":
      return { text: "LUMIX", font: `900 ${H * 0.56}px "Arial Black", ${FONT}` };
    case "zeiss":
      return { text: "ZEISS", font: `bold ${H * 0.56}px ${FONT}` };
    default:
      return { text: BRANDS[lens.brand].name.toUpperCase(), font: `bold ${H * 0.52}px ${FONT}` };
  }
}

function seriesBadge(lens: Lens): Label["badge"] {
  const s = lens.series ?? "";
  if (lens.brand === "sony") {
    if (s === "GM") return { text: "GM", bg: "#e9e9e9", fg: "#111" };
    if (s === "G") return { text: "G", bg: "#f08a24", fg: "#fff" };
    if (s === "Zeiss") return { text: "ZA", bg: "#1f4fbf", fg: "#fff" };
  }
  if (lens.brand === "sigma") {
    if (s === "Art") return { text: "A", bg: "#c9ccd1", fg: "#111", round: true };
    if (s === "Contemporary" || s === "I series") return { text: "C", bg: "#c9ccd1", fg: "#111", round: true };
    if (s === "Sports") return { text: "S", bg: "#c9ccd1", fg: "#111", round: true };
  }
  if (lens.brand === "fujifilm" && s === "Red Badge") return { text: "XF", bg: "#c81e28", fg: "#fff" };
  if (lens.brand === "nikon" && s === "S") return { text: "S", bg: "#d4d4d8", fg: "#111" };
  if (lens.brand === "om-system" && s === "PRO") return { text: "PRO", bg: "#c81e28", fg: "#fff" };
  if (lens.brand === "panasonic" && s === "S PRO") return { text: "S PRO", bg: "#c81e28", fg: "#fff" };
  if (lens.brand === "panasonic" && s === "Leica DG") return { text: "LEICA", bg: "#c81e28", fg: "#fff" };
  if (lens.categories.includes("cine") && s) return { text: s.toUpperCase(), bg: BRANDS[lens.brand].accent, fg: "#111" };
  return undefined;
}

function accentRingColor(lens: Lens): string | null {
  if (lens.brand === "canon" && lens.series === "L") return "#d4202c";
  if (lens.brand === "nikon" && lens.series === "S") return "#a1a1aa";
  if (lens.categories.includes("anamorphic")) return "#2f6bff";
  return null;
}

function cleanName(lens: Lens): string {
  return lens.name.replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
}

const FOCALS = [8, 10, 12, 14, 16, 18, 20, 24, 28, 35, 40, 50, 55, 70, 85, 100, 135, 150, 200, 300, 400, 500, 600, 800];
const DISTANCES = [0.3, 0.5, 0.7, 1, 1.5, 2, 3, 5, 10];
const STOPS = [1, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32];

/** Ring-local u (0..1) for a mark that should line up with the index when the ring has turned `turn` radians. */
const uAt = (turn: number) => (INDEX_THETA - turn) / (Math.PI * 2);

function zoomMarks(lens: Lens): ScaleBand["marks"] {
  const lo = lens.focalMin;
  const hi = lens.focalMax;
  const vals = [lo, ...FOCALS.filter((f) => f > lo * 1.12 && f < hi * 0.9), hi];
  return vals.map((f) => ({
    u: uAt((Math.log(f / lo) / Math.log(hi / lo)) * RING_TRAVEL.zoom),
    text: String(f),
  }));
}

function focusMarks(minFocus: number, feet: boolean): ScaleBand["marks"] {
  const vals = DISTANCES.filter((d) => d > minFocus * 1.15);
  const marks: ScaleBand["marks"] = [minFocus, ...vals].map((d) => ({
    u: uAt((1 - minFocus / d) * RING_TRAVEL.focus),
    text: d < 1 ? d.toFixed(2).replace(/^0/, "") : String(d),
  }));
  marks.push({ u: uAt(RING_TRAVEL.focus), text: "∞" });
  if (feet) marks.push({ u: uAt(RING_TRAVEL.focus * 0.08), text: "m", color: "#9ca3af" });
  return marks;
}

function apertureMarks(lens: Lens): ScaleBand["marks"] {
  const lo = lens.apertureMax;
  const hi = lens.apertureMin;
  if (hi <= lo) return [];
  const vals = [lo, ...STOPS.filter((s) => s > lo * 1.08 && s < hi), hi];
  const prefix = lens.tStop ? "T" : "";
  return vals.map((s, i) => ({
    u: uAt(-(Math.log(s / lo) / Math.log(hi / lo)) * RING_TRAVEL.aperture),
    text: i === 0 ? `${prefix}${s}` : String(s),
    color: i === 0 ? "#f59e0b" : undefined,
  }));
}

export function buildLensProfile(lens: Lens, mountId: MountId = lens.mounts[0]): LensProfile {
  const mount = MOUNTS[mountId];
  const L = lens.lengthMm;
  const throatR = mount.throatMm / 2;
  const mountOuterR = throatR + (mountId === "PL" ? 7 : 4);
  const R = Math.max(lens.diameterMm / 2, mountOuterR + 1);
  const cine = lens.categories.includes("cine");
  const fisheye = lens.categories.includes("fisheye");
  const anamorphic = lens.categories.includes("anamorphic");
  const zoom = lens.focalMin !== lens.focalMax;
  const manual = !lens.autofocus;
  const minFocus = lens.minFocusM ?? Math.max(0.15, lens.focalMax / 400);

  // Rings, positioned as fractions of length so they scale from pancakes to super-teles.
  const rings: Ring[] = [];
  const ring = (role: RingRole, f0: number, f1: number, gear = false): Ring => {
    const depth = gear ? 1.6 : role === "aperture" ? 0.5 : role === "zoom" ? 0.75 : manual ? 0.7 : 0.4;
    const r = R + depth + (gear ? 0.4 : 0.12);
    const ribs = gear
      ? Math.round((2 * Math.PI * r) / 2.6)
      : role === "aperture"
        ? 48
        : role === "zoom"
          ? 84
          : manual
            ? 72
            : 150;
    return { role, gear, y0: L * f0, y1: L * f1, r, ribs, depth, group: "rear" };
  };

  if (cine) {
    rings.push(ring("aperture", 0.16, 0.26, true));
    rings.push(ring("focus", zoom ? 0.36 : 0.42, zoom ? 0.52 : 0.62, true));
    if (zoom) rings.push(ring("zoom", 0.64, 0.78, true));
  } else if (zoom) {
    if (lens.hasApertureRing) rings.push(ring("aperture", 0.12, 0.2));
    rings.push(ring("zoom", lens.hasApertureRing ? 0.3 : 0.28, 0.54));
    rings.push(ring("focus", 0.64, 0.78));
  } else {
    if (lens.hasApertureRing) rings.push(ring("aperture", manual ? 0.14 : 0.16, manual ? 0.25 : 0.25));
    rings.push(ring("focus", manual ? 0.4 : 0.44, manual ? 0.72 : 0.74));
  }

  const zoomRing = rings.find((r) => r.role === "zoom");
  const extension = lens.extensionMm;
  const splitY = extension > 0 && zoomRing ? zoomRing.y1 + L * 0.03 : L * 0.58;
  for (const r of rings) if (r.y0 >= splitY) r.group = "front";

  // Rear barrel with a curved taper from the mount.
  const rearR = Math.min(R, mountOuterR + 1.5);
  const taperEnd = rearR < R - 1 ? Math.min(L * 0.14, 14) : 0;
  const rear: Pt[] = [
    [throatR - 1, 0],
    [rearR - 0.6, 0],
    [rearR, 0.6],
  ];
  if (taperEnd > 0) {
    const d = R - rearR;
    rear.push([rearR, taperEnd * 0.25], [rearR + d * 0.35, taperEnd * 0.55], [rearR + d * 0.8, taperEnd * 0.85], [R, taperEnd]);
  }
  rear.push([R, splitY]);

  // Front barrel: optional hood bayonet, filter thread, recessed name ring, element.
  const hoodBayonet = !cine && !fisheye && !!lens.filterMm && L > 35 && R > 28;
  const frontEdgeR = hoodBayonet ? R - 2 : R - 1.2;
  const lipR = lens.filterMm ? clamp(lens.filterMm / 2 + 1, R * 0.6, frontEdgeR - 0.6) : R - (cine ? 2.5 : 3);
  const glassR = Math.max(cine ? lipR - 6 : fisheye ? lipR - 2 : lipR * 0.8, 8);
  const recess = fisheye ? 2 : clamp(L * 0.09, 3, 14);
  const glassY = L - recess;
  const nameY = L - recess * 0.45;

  const frontOuter: Pt[] = [[R, splitY]];
  if (hoodBayonet) {
    frontOuter.push([R, L - 8.6], [R - 0.3, L - 8.1], [R - 0.9, L - 7.7], [R - 0.9, L - 1.8], [R - 1.3, L - 0.6], [frontEdgeR, L]);
  } else {
    frontOuter.push([R, L - 1.8], [R - 0.4, L - 0.5], [frontEdgeR, L]);
  }
  frontOuter.push([lipR, L]);
  const front: Pt[] = [
    ...frontOuter,
    [lipR - 0.5, L - 0.5],
    [lipR - 0.5, nameY + 0.5],
    [lipR - 1, nameY],
    [glassR + 1.6, nameY],
    [glassR + 1.1, nameY - 0.6],
    [glassR + 0.4, glassY],
    [glassR, glassY - 0.5],
  ];

  const brandMark = brandWordmark(lens);
  const nameRing =
    lipR - 1 - (glassR + 1.6) > 1.8
      ? {
          y: nameY + 0.04,
          rIn: glassR + 1.6,
          rOut: lipR - 1,
          text: `${brandMark.text.toUpperCase()}  ${cleanName(lens)}${lens.filterMm ? `  Ø${lens.filterMm}` : ""}`,
        }
      : null;

  // Printed scales next to rings, plus a fixed index line on the barrel.
  const occupied: [number, number][] = rings.map((r) => [r.y0, r.y1]);
  const free = (a: number, b: number) =>
    a > taperEnd + 0.5 && b < L - (hoodBayonet ? 9 : 3) && occupied.every(([o0, o1]) => b <= o0 || a >= o1);
  const indexMarks: IndexMark[] = [];
  const addBand = (r: Ring, marks: ScaleBand["marks"], side: "rear" | "front") => {
    if (!marks.length) return;
    const w = clamp(L * 0.035, 2.6, 4.2);
    const [b0, b1] = side === "rear" ? [r.y0 - w - 0.3, r.y0 - 0.3] : [r.y1 + 0.3, r.y1 + w + 0.3];
    const [i0, i1] = side === "rear" ? [b0 - 2.4, b0 - 0.2] : [b1 + 0.2, b1 + 2.4];
    if (!free(Math.min(b0, i0), Math.max(b1, i1))) return;
    r.band = { y0: b0, y1: b1, marks };
    occupied.push([Math.min(b0, i0), Math.max(b1, i1)]);
    indexMarks.push({ y: (i0 + i1) / 2, group: (i0 + i1) / 2 >= splitY ? "front" : "rear" });
  };
  for (const r of rings) {
    if (r.role === "zoom") addBand(r, zoomMarks(lens), "rear");
    if (r.role === "focus" && (manual || cine)) addBand(r, focusMarks(minFocus, !cine), "rear");
    if (r.role === "aperture") addBand(r, apertureMarks(lens), "front");
  }

  // AF/MF (and stabiliser) switch panel on the side of AF lenses.
  let switches: SwitchPanel | null = null;
  if (lens.autofocus && !cine && L >= 60) {
    const count = /OSS|\bIS\b|VR|OIS|VC/.test(lens.name) ? 2 : 1;
    const h = count === 2 ? 16 : 10;
    const sorted = [...occupied].sort((a, b) => a[0] - b[0]);
    let cursor = taperEnd + 1.5;
    for (const [o0, o1] of sorted) {
      if (o0 - cursor >= h + 2 && cursor + h < splitY) {
        switches = { y: cursor + 1 + h / 2, h, count };
        break;
      }
      cursor = Math.max(cursor, o1 + 1);
    }
  }

  // Name label in the largest free stretch of barrel.
  let label: Label | null = null;
  {
    const edges = [taperEnd + 1.5, ...occupied.flat(), L - (hoodBayonet ? 9.5 : 4)].sort((a, b) => a - b);
    let best = { y: 0, h: 0 };
    for (let i = 0; i < edges.length - 1; i += 1) {
      const a = edges[i];
      const b = edges[i + 1];
      if (!free(a + 0.01, b - 0.01)) continue;
      if (b - a > best.h) best = { y: (a + b) / 2, h: b - a };
    }
    if (best.h > 4) {
      label = {
        y: best.y,
        h: clamp(best.h * 0.42, 2.6, 6),
        group: best.y >= splitY ? "front" : "rear",
        brand: brandMark.text,
        brandFont: brandMark.font,
        name: cleanName(lens),
        badge: seriesBadge(lens),
      };
    }
  }

  const accents: AccentRing[] = [];
  const ringColor = accentRingColor(lens);
  if (ringColor) {
    const y = hoodBayonet ? L - 10.2 : L - 6;
    accents.push({ y, h: 2, color: ringColor, group: y >= splitY ? "front" : "rear" });
  }

  const tint = anamorphic ? "#1d3a8a" : cine ? "#2a1f55" : fisheye ? "#174536" : "#1a2a24";
  const bladesY = glassY - clamp(L * 0.3, 4, 40);
  const tunnel = glassY - bladesY;

  const eqFocal = lens.focalMin * (lens.format === "M43" ? 2 : lens.format === "APS-C" || lens.format === "S35" ? 1.5 : 1);
  const hood =
    hoodBayonet
      ? eqFocal < 50
        ? { r0: R - 0.4, r1: R * 1.28, depth: R * 0.85, petalCut: R * 0.42, y: L - 8 }
        : { r0: R - 0.4, r1: R * 1.1, depth: Math.min(R * 1.5, 110), petalCut: 0, y: L - 8 }
      : null;

  const outline: Pt[] = [...rear.slice(1), ...frontOuter.slice(1)];

  return {
    length: L,
    radius: R,
    throatR,
    rear,
    front,
    outline,
    splitY,
    extension,
    innerTubeR: R - 2.5,
    glass: {
      y: glassY,
      r: glassR,
      bulge: fisheye ? glassR * 0.85 : glassR * 0.18,
      oval: anamorphic ? 0.72 : 1,
      tint,
    },
    innerElements: [
      { y: glassY - tunnel * 0.35, r: glassR * 0.9, bulge: glassR * 0.12 },
      { y: bladesY - 2, r: glassR * 0.75, bulge: glassR * 0.1 },
    ],
    nameRing,
    bladesY,
    rings,
    indexMarks,
    label,
    switches,
    accents,
    hoodBayonet,
    hood,
    petalHood: fisheye && lens.focalMax < 10,
    bodyColor: BODY_COLORS[lens.color],
    printColor: lens.color === "black" ? "#ececec" : "#1b1b1d",
    rubberColor: lens.color === "white" ? "#1a1a1a" : "#121212",
    indexColor: mount.indexColor,
  };
}
