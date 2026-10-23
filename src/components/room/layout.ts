import type { Lens } from "@/types/lens";
import { LENSES } from "@/data/lenses";
import { BRANDS } from "@/data/brands";

/** Room interior in metres. Origin is the floor centre; the entrance wall is +z. */
export const ROOM = { halfX: 4.2, halfZ: 3.6, height: 4.6 } as const;
export const EYE = 1.6;

export const WALL = 0.2;
/** The cine room sits behind the main room's right wall. */
export const CINE = { cx: ROOM.halfX + WALL + 4.0, cz: 0, halfX: 4.0, halfZ: 3.6, height: 4.4 } as const;
/** Opening in the shared wall, centred on z. */
export const DOOR = { z: -0.68, width: 1.2, height: 2.3 } as const;
/**
 * Loading warehouse past the cine room's far wall. 40 × 25 m = 1000 m², tall enough for a pickup.
 * The cine screening wall stays on the back half; this door is on the +z side of that wall.
 */
export const WARE = {
  cx: CINE.cx + CINE.halfX + WALL + 20,
  cz: 0,
  halfX: 20,
  halfZ: 12.5,
  height: 8,
} as const;
/** Walk-through opening from the cine room into the warehouse. */
export const GATE = { z: 2.45, width: 2.2, height: 2.6 } as const;
/** RAM TRX parked just inside the warehouse, facing down the hall. */
export const RAM_START = { x: CINE.cx + CINE.halfX + WALL + 8, z: 0, yaw: -Math.PI / 2 } as const;
export const WARE_CRATES = [
  { x: WARE.cx + 14, z: WARE.cz - 9, hw: 0.7, hd: 0.7, h: 1.2 },
  { x: WARE.cx + 16, z: WARE.cz - 9.2, hw: 0.6, hd: 0.6, h: 1.0 },
  { x: WARE.cx + 15, z: WARE.cz + 10, hw: 0.8, hd: 0.6, h: 1.4 },
  { x: WARE.cx - 12, z: WARE.cz - 10, hw: 0.7, hd: 0.7, h: 1.1 },
  { x: WARE.cx - 6, z: WARE.cz + 10.5, hw: 0.9, hd: 0.7, h: 1.3 },
] as const;

export const UNIT_WIDTH = 1.6;
export const UNIT_DEPTH = 0.42;
export const BOARD_TOPS = [0.14, 0.6, 1.06, 1.52, 1.98];
export const UNIT_TOP = 2.44;
const BOARD_INSET = 0.06;
const GAP = 0.03;
const MAX_UPRIGHT = 0.4;

export interface Unit {
  id: number;
  /** Centre of the unit's footprint on the floor. */
  x: number;
  z: number;
  /** Rotation around y so the unit's local +z faces into the room. */
  rot: number;
  room: 0 | 1;
  brands: string[];
}

export interface Slot {
  lens: Lens;
  unit: number;
  board: number;
  /** Local position inside the unit: x along the board, y = board top, z = depth. */
  local: [number, number, number];
  horizontal: boolean;
  /** World-space centre of the lens, used for picking and the fly-to-hand animation. */
  world: [number, number, number];
  /** Half extents of the world-space bounding box. */
  half: [number, number, number];
}

function makeUnits(): Unit[] {
  const units: Unit[] = [];
  const add = (x: number, z: number, rot: number, room: 0 | 1) => units.push({ id: units.length, x, z, rot, room, brands: [] });
  const side = 3;
  const sideStart = -ROOM.halfZ + UNIT_DEPTH + 0.1;
  // Left wall, front to back.
  for (let i = side - 1; i >= 0; i -= 1) add(-ROOM.halfX + UNIT_DEPTH / 2, sideStart + UNIT_WIDTH * (i + 0.5), Math.PI / 2, 0);
  // Back wall, left to right.
  const back = 4;
  for (let i = 0; i < back; i += 1) add(-(back * UNIT_WIDTH) / 2 + UNIT_WIDTH * (i + 0.5), -ROOM.halfZ + UNIT_DEPTH / 2, 0, 0);
  // Right wall, back to front, skipping the middle bay where the door to the cine room is.
  for (let i = 0; i < side; i += 1) {
    if (i === 1) continue;
    add(ROOM.halfX - UNIT_DEPTH / 2, sideStart + UNIT_WIDTH * (i + 0.5), -Math.PI / 2, 0);
  }

  // Cine room: back wall only; the far wall is the screen.
  const cineBack = CINE.cz - CINE.halfZ;
  for (let i = 0; i < 3; i += 1) add(CINE.cx - 2.8 + UNIT_WIDTH * i, cineBack + UNIT_DEPTH / 2, 0, 1);
  return units;
}

export const isCine = (l: Lens) => l.categories.includes("cine") || l.categories.includes("anamorphic");

/** Local unit coords → world. Local +z points out of the shelf, into the room. */
export function unitToWorld(u: Unit, lx: number, ly: number, lz: number): [number, number, number] {
  const c = Math.cos(u.rot);
  const s = Math.sin(u.rot);
  return [u.x + lx * c + lz * s, ly, u.z - lx * s + lz * c];
}

function lensSize(l: Lens) {
  const d = Math.max(l.diameterMm, 50) / 1000;
  const len = (l.lengthMm + 6) / 1000;
  return { d, len, horizontal: len > MAX_UPRIGHT };
}

function packShelves(lenses: Lens[], units: Unit[]): Slot[] {
  const slots: Slot[] = [];
  const usable = UNIT_WIDTH - 2 * BOARD_INSET;
  const boards = units.length * BOARD_TOPS.length;
  const total = lenses.reduce((sum, l) => {
    const s = lensSize(l);
    return sum + (s.horizontal ? s.len : s.d) + GAP;
  }, 0);
  const target = Math.min(usable, (total / boards) * 1.04);
  let unit = 0;
  let board = BOARD_TOPS.length - 1;
  let cursor = 0;

  const nextBoard = () => {
    board -= 1;
    if (board < 0) {
      board = BOARD_TOPS.length - 1;
      unit += 1;
    }
    cursor = 0;
  };

  for (const lens of lenses) {
    const { d, len, horizontal } = lensSize(lens);
    const w = horizontal ? len : d;
    if (cursor > 0 && (cursor + w / 2 > target || cursor + w > usable)) nextBoard();
    if (unit >= units.length) break;
    const u = units[unit];
    const name = BRANDS[lens.brand].name;
    if (!u.brands.includes(name)) u.brands.push(name);

    const lx = -usable / 2 + cursor + w / 2;
    const ly = BOARD_TOPS[board] + 0.015;
    const lz = -UNIT_DEPTH / 2 + 0.04 + (horizontal ? d / 2 : Math.min(d / 2 + 0.06, UNIT_DEPTH / 2));
    const centreY = ly + (horizontal ? d / 2 : len / 2);
    const world = unitToWorld(u, lx, centreY, lz);
    const along = horizontal ? len / 2 : d / 2;
    const up = horizontal ? d / 2 : len / 2;
    const runsAlongX = Math.abs(Math.sin(u.rot)) < 0.5;
    slots.push({
      lens,
      unit: u.id,
      board,
      local: [lx, ly, lz],
      horizontal,
      world,
      half: runsAlongX ? [along, up, d / 2] : [d / 2, up, along],
    });
    cursor += w + GAP;
  }
  return slots;
}

const BRAND_ORDER = Object.keys(BRANDS);

function shelfOrder(lenses: Lens[]): Lens[] {
  return [...lenses].sort(
    (a, b) =>
      BRAND_ORDER.indexOf(a.brand) - BRAND_ORDER.indexOf(b.brand) ||
      a.focalMin - b.focalMin ||
      a.focalMax - b.focalMax ||
      a.apertureMax - b.apertureMax,
  );
}

export const TABLE = { x: 0, z: -0.7, w: 2.0, d: 0.9, h: 0.86 } as const;
export const COUNTER = { x: -2.7, z: 2.95, w: 2.0, d: 0.6, h: 1.02 } as const;
export const START = { x: 1.3, z: 2.7, yaw: 0.28 } as const;
/** Display table in the cine room with the cameras on it. */
export const CAMERA_BAR = { x: CINE.cx + 1.0, z: CINE.cz + 0.4, w: 2.6, d: 1.0, h: 0.92 } as const;
export const CHAIR = { x: CINE.cx + 2.7, z: CINE.cz + 2.3 } as const;
export const SOFTBOXES = [
  { x: CINE.cx - CINE.halfX + 0.8, z: CINE.cz + CINE.halfZ - 0.8, rot: 2.3 },
  { x: CINE.cx + CINE.halfX - 0.8, z: CINE.cz - CINE.halfZ + 0.8, rot: -0.75 },
] as const;
export const APPLE_BOXES = { x: CINE.cx + CINE.halfX - 0.7, z: CINE.cz + CINE.halfZ - 0.55 } as const;
export const ARMCHAIR = { x: 2.8, z: 2.75 } as const;

const FEATURED = [
  "sony-fe-24-70mm-f2-8-gm-ii",
  "canon-rf-28-70mm-f2-l-usm",
  "sirui-venus-50mm-t2-9-1-6x-full-frame-anamorphic",
  "laowa-24mm-f-14-2x-macro-probe",
  "nikon-nikkor-z-58mm-f-0-95-s-noct",
  "zeiss-cp-3-50mm-t2-1",
  "7artisans-7-5mm-f2-8-ii-fisheye",
];

function tableSlots(): Slot[] {
  const picks = FEATURED.map((s) => LENSES.find((l) => l.slug === s)).filter((l): l is Lens => !!l);
  const n = picks.length;
  return picks.map((lens, i) => {
    const { d, len } = lensSize(lens);
    const row = i % 2;
    const x = TABLE.x - TABLE.w / 2 + 0.25 + (i * (TABLE.w - 0.5)) / Math.max(n - 1, 1);
    const z = TABLE.z + (row ? 0.18 : -0.18);
    return {
      lens,
      unit: -1,
      board: -1,
      local: [x, TABLE.h, z],
      horizontal: false,
      world: [x, TABLE.h + len / 2, z],
      half: [d / 2, len / 2, d / 2],
    };
  });
}

export interface RoomLayout {
  units: Unit[];
  slots: Slot[];
  table: Slot[];
}

let cached: RoomLayout | null = null;

export function roomLayout(): RoomLayout {
  if (cached) return cached;
  const units = makeUnits();
  const sorted = shelfOrder(LENSES);
  const slots = [
    ...packShelves(sorted.filter((l) => !isCine(l)), units.filter((u) => u.room === 0)),
    ...packShelves(sorted.filter(isCine), units.filter((u) => u.room === 1)),
  ];
  cached = { units, slots, table: tableSlots() };
  return cached;
}

/** Rough rental price: about 2.2% of the purchase price per day. */
export function dayRate(l: Lens): number {
  return Math.max(9, Math.round((l.priceUsd ?? 900) * 0.022));
}
