import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { buildLensProfile, type LensProfile } from "../three/buildLensProfile";
import { lathe } from "../three/geometries";
import type { Slot } from "./layout";

const SEG = 24;
const MM = 0.001;
const MOUNT_H = 4;

const profiles = new Map<string, LensProfile>();
function profileFor(slot: Slot): LensProfile {
  let p = profiles.get(slot.lens.slug);
  if (!p) {
    p = buildLensProfile(slot.lens);
    profiles.set(slot.lens.slug, p);
  }
  return p;
}

function paint(geo: THREE.BufferGeometry, hex: string): THREE.BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const c = new THREE.Color(hex);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 1) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  g.deleteAttribute("uv");
  return g;
}

/** Lens parts in millimetres, mount face at y = 0, optical axis along +y. */
function lensParts(p: LensProfile): { body: THREE.BufferGeometry[]; glass: THREE.BufferGeometry[] } {
  const body: THREE.BufferGeometry[] = [];
  const glass: THREE.BufferGeometry[] = [];

  body.push(paint(lathe([...p.rear, ...p.front.slice(1)], SEG), p.bodyColor));

  for (const r of p.rings) {
    const g = new THREE.CylinderGeometry(r.r, r.r, r.y1 - r.y0, SEG, 1, false);
    g.translate(0, (r.y0 + r.y1) / 2, 0);
    body.push(paint(g, r.gear ? "#2a2a2e" : r.role === "aperture" ? p.bodyColor : p.rubberColor));
  }
  for (const a of p.accents) {
    const g = new THREE.CylinderGeometry(p.radius + 0.15, p.radius + 0.15, a.h, SEG, 1, true);
    g.translate(0, a.y, 0);
    body.push(paint(g, a.color));
  }
  if (p.label) {
    const g = new THREE.CylinderGeometry(p.radius + 0.1, p.radius + 0.1, p.label.h * 0.35, SEG, 1, true, Math.PI * 0.35, Math.PI * 0.8);
    g.translate(0, p.label.y, 0);
    body.push(paint(g, p.printColor));
  }

  const mount = new THREE.CylinderGeometry(p.throatR + 3, p.throatR + 3, MOUNT_H, SEG, 1, false);
  mount.translate(0, -MOUNT_H / 2, 0);
  body.push(paint(mount, "#c4c6ca"));

  const g = new THREE.CircleGeometry(p.glass.r, SEG);
  g.rotateX(-Math.PI / 2);
  g.scale(p.glass.oval, 1, 1);
  g.translate(0, p.glass.y, 0);
  glass.push(paint(g, p.glass.tint));
  return { body, glass };
}

/** Matrix that puts a lens (mm, axis +y, mount at 0) into a slot's local frame (m). */
export function slotMatrix(slot: Slot): THREE.Matrix4 {
  const p = profileFor(slot);
  const m = new THREE.Matrix4();
  const [x, y, z] = slot.local;
  if (slot.horizontal) {
    // Lying on its side along the board, front element towards +x.
    const maxR = Math.max(p.radius, ...p.rings.map((r) => r.r));
    return m
      .makeTranslation(x - ((p.length - MOUNT_H) / 2) * MM, y + maxR * MM, z)
      .multiply(new THREE.Matrix4().makeRotationZ(-Math.PI / 2))
      .multiply(new THREE.Matrix4().makeScale(MM, MM, MM));
  }
  return m.makeTranslation(x, y + MOUNT_H * MM, z).multiply(new THREE.Matrix4().makeScale(MM, MM, MM));
}

export interface ShelfGeometry {
  body: THREE.BufferGeometry | null;
  glass: THREE.BufferGeometry | null;
}

export function buildShelfGeometry(slots: Slot[]): ShelfGeometry {
  const body: THREE.BufferGeometry[] = [];
  const glass: THREE.BufferGeometry[] = [];
  for (const slot of slots) {
    const parts = lensParts(profileFor(slot));
    const m = slotMatrix(slot);
    for (const g of parts.body) body.push(g.applyMatrix4(m));
    for (const g of parts.glass) glass.push(g.applyMatrix4(m));
  }
  const merged = {
    body: body.length ? mergeGeometries(body) : null,
    glass: glass.length ? mergeGeometries(glass) : null,
  };
  for (const g of [...body, ...glass]) g.dispose();
  return merged;
}

/** Single-lens shell used to outline whatever the crosshair is on. */
export function outlineGeometry(slot: Slot): THREE.BufferGeometry {
  const p = profileFor(slot);
  const g = lathe([[p.throatR, -MOUNT_H], ...p.outline.map(([r, y]) => [r + 2.5, y] as [number, number]), [p.glass.r, p.length + 1]], SEG);
  return g.applyMatrix4(slotMatrix(slot));
}

export function lensProfile(slot: Slot): LensProfile {
  return profileFor(slot);
}
