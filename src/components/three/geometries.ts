import * as THREE from "three";
import type { Pt } from "./buildLensProfile";

export function lathe(points: Pt[], segments = 96): THREE.LatheGeometry {
  return new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.001), y)),
    segments,
  );
}

/**
 * Closed ring with rounded shoulders whose outer face carries ribs (rubber grip)
 * or teeth (cine gear). `base` is the barrel radius the ring sits on.
 */
export function ringSolid(
  base: number,
  r: number,
  h: number,
  ribs: number,
  depth: number,
  gear: boolean,
): THREE.BufferGeometry {
  const e = Math.min(0.6, h * 0.12);
  const profile: Pt[] = [
    [base - 0.2, -h / 2],
    [r - depth - e * 0.4, -h / 2],
    [r - e * 0.3, -h / 2 + e * 0.6],
    [r, -h / 2 + e],
    [r, h / 2 - e],
    [r - e * 0.3, h / 2 - e * 0.6],
    [r - depth - e * 0.4, h / 2],
    [base - 0.2, h / 2],
  ];
  const geo = lathe(profile, Math.min(ribs * 4, 720));
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const outerStart = r - depth - 0.01;
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i);
    const rad = Math.hypot(v.x, v.z);
    if (rad < outerStart) continue;
    const a = Math.atan2(v.x, v.z);
    const c = 0.5 + 0.5 * Math.cos(a * ribs);
    const bump = gear ? Math.min(1, Math.max(0, (c - 0.25) * 2)) : Math.pow(c, 0.6);
    const w = Math.min(1, (rad - outerStart) / depth);
    const rr = rad - depth * (1 - bump) * w;
    v.x = Math.sin(a) * rr;
    v.z = Math.cos(a) * rr;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Lens hood shell from radius r0 (bayonet) flaring to r1, with optional petals:
 * the rim is cut lower on the left/right so it clears a 3:2 frame.
 */
export function hoodGeometry(r0: number, r1: number, depth: number, petalCut: number): THREE.BufferGeometry {
  const seg = 128;
  const rows = 12;
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  for (let i = 0; i <= seg; i += 1) {
    const a = (i / seg) * Math.PI * 2;
    const side = Math.pow(Math.abs(Math.sin(a)), 3);
    const top = depth - petalCut * side;
    for (let j = 0; j <= rows; j += 1) {
      const t = j / rows;
      const y = top * t;
      const r = r0 + (r1 - r0) * Math.pow(t, 0.8);
      positions.push(Math.sin(a) * r, y, Math.cos(a) * r);
      uvs.push(i / seg, t);
    }
  }
  for (let i = 0; i < seg; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      const a = i * (rows + 1) + j;
      const b = (i + 1) * (rows + 1) + j;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

/** Open cylinder with radial ribs (rubber grip) or teeth (cine follow-focus gear). */
export function ribbedRing(
  r: number,
  h: number,
  ribs: number,
  depth: number,
  gear: boolean,
): THREE.BufferGeometry {
  const radial = Math.min(ribs * 4, 720);
  const geo = new THREE.CylinderGeometry(r, r, h, radial, 1, true);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i);
    const a = Math.atan2(v.x, v.z);
    const c = 0.5 + 0.5 * Math.cos(a * ribs);
    const bump = gear ? (c > 0.5 ? 1 : c * 2) : Math.pow(c, 0.7);
    const rr = r - depth + depth * bump;
    v.x = Math.sin(a) * rr;
    v.z = Math.cos(a) * rr;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Flat annular sector in the XZ plane (used for bayonet lugs). */
export function annularSector(
  rIn: number,
  rOut: number,
  a0: number,
  a1: number,
  thickness: number,
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const steps = 16;
  for (let i = 0; i <= steps; i += 1) {
    const a = a0 + ((a1 - a0) * i) / steps;
    const x = Math.cos(a) * rOut;
    const y = Math.sin(a) * rOut;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i -= 1) {
    const a = a0 + ((a1 - a0) * i) / steps;
    shape.lineTo(Math.cos(a) * rIn, Math.sin(a) * rIn);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
  geo.rotateX(Math.PI / 2);
  return geo;
}

/** Spherical cap: chord radius `r`, height `h`, apex on +Y at y = 0. */
export function dome(r: number, h: number): THREE.BufferGeometry {
  const R = (r * r + h * h) / (2 * h);
  const theta = Math.asin(Math.min(1, r / R));
  const geo = new THREE.SphereGeometry(R, 64, 24, 0, Math.PI * 2, 0, h > r ? Math.PI - theta : theta);
  geo.translate(0, -R, 0);
  return geo;
}

/**
 * Iris built from N overlapping blades. Each blade covers the wedge between one
 * polygon edge (extended to the outer housing) and the next vertex, so together
 * they leave exactly an N-sided opening of circumradius `hole`.
 */
export function bladeGeometry(
  index: number,
  count: number,
  hole: number,
  outer: number,
  twist: number,
): THREE.BufferGeometry {
  const t0 = twist + (2 * Math.PI * index) / count;
  const t1 = twist + (2 * Math.PI * (index + 1)) / count;
  const p0 = new THREE.Vector2(Math.cos(t0) * hole, Math.sin(t0) * hole);
  const p1 = new THREE.Vector2(Math.cos(t1) * hole, Math.sin(t1) * hole);
  const d = p1.clone().sub(p0).normalize();
  const b = p1.dot(d);
  const c = p1.lengthSq() - outer * outer;
  const t = -b + Math.sqrt(Math.max(b * b - c, 0));
  const q = p1.clone().add(d.multiplyScalar(t));
  let aq = Math.atan2(q.y, q.x);
  while (aq < t0) aq += Math.PI * 2;
  while (aq - t0 > Math.PI * 2) aq -= Math.PI * 2;

  const shape = new THREE.Shape();
  shape.moveTo(p0.x, p0.y);
  shape.lineTo(p1.x, p1.y);
  shape.lineTo(q.x, q.y);
  const steps = 18;
  for (let i = 1; i <= steps; i += 1) {
    const a = aq + ((t0 - aq) * i) / steps;
    shape.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
  }
  shape.closePath();
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  return geo;
}
