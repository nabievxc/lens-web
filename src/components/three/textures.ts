import * as THREE from "three";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const cache = new Map<string, THREE.CanvasTexture>();

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  return { c, ctx };
}

function finish(c: HTMLCanvasElement, srgb = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

function cached(key: string, make: () => THREE.CanvasTexture) {
  let t = cache.get(key);
  if (!t) {
    t = make();
    cache.set(key, t);
  }
  return t;
}

export interface LabelBadge {
  text: string;
  bg: string;
  fg: string;
  round?: boolean;
}

export interface LabelSpec {
  brand: string;
  brandFont: string;
  name: string;
  color: string;
  badge?: LabelBadge;
}

/** Barrel print: optional series badge, brand wordmark and model name. Returns width/height aspect. */
export function labelTexture(spec: LabelSpec): { texture: THREE.CanvasTexture; aspect: number } {
  const H = 128;
  const key = `label|${JSON.stringify(spec)}`;
  const measure = canvas(8, 8).ctx;
  const pad = 24;
  const gap = 36;
  measure.font = spec.brandFont;
  const brandW = measure.measureText(spec.brand).width;
  measure.font = `500 ${H * 0.4}px ${FONT}`;
  const nameW = measure.measureText(spec.name).width;
  let badgeW = 0;
  if (spec.badge) {
    measure.font = `bold ${H * 0.5}px ${FONT}`;
    badgeW = spec.badge.round ? H * 0.78 : measure.measureText(spec.badge.text).width + H * 0.36;
  }
  const W = Math.ceil(pad * 2 + brandW + gap + nameW + (badgeW ? badgeW + gap : 0));

  const texture = cached(key, () => {
    const { c, ctx } = canvas(W, H);
    ctx.textBaseline = "middle";
    let x = pad;
    if (spec.badge) {
      const b = spec.badge;
      const bh = H * 0.78;
      ctx.fillStyle = b.bg;
      ctx.beginPath();
      if (b.round) ctx.arc(x + bh / 2, H / 2, bh / 2, 0, Math.PI * 2);
      else ctx.roundRect(x, (H - bh) / 2, badgeW, bh, 10);
      ctx.fill();
      ctx.fillStyle = b.fg;
      ctx.font = `bold ${H * 0.5}px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillText(b.text, x + badgeW / 2, H / 2 + 2);
      ctx.textAlign = "left";
      x += badgeW + gap;
    }
    ctx.fillStyle = spec.color;
    ctx.font = spec.brandFont;
    ctx.fillText(spec.brand, x, H / 2 + 2);
    x += brandW + gap;
    ctx.font = `500 ${H * 0.4}px ${FONT}`;
    ctx.globalAlpha = 0.9;
    ctx.fillText(spec.name, x, H / 2 + 2);
    return finish(c);
  });
  return { texture, aspect: W / H };
}

export interface ScaleMark {
  /** 0..1 around the circumference. */
  u: number;
  text: string;
  color?: string;
}

/** Printed scale that wraps all the way round a ring (focal lengths, distances, f-stops). */
export function scaleTexture(marks: ScaleMark[], bg: string, fg: string): THREE.CanvasTexture {
  const key = `scale|${bg}|${fg}|${marks.map((m) => `${m.u.toFixed(4)}:${m.text}`).join(",")}`;
  return cached(key, () => {
    const W = 4096;
    const H = 96;
    const { c, ctx } = canvas(W, H);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${H * 0.52}px ${FONT}`;
    for (const m of marks) {
      const u = ((m.u % 1) + 1) % 1;
      for (const x of [u * W, u * W - W, u * W + W]) {
        if (x < -200 || x > W + 200) continue;
        ctx.fillStyle = m.color ?? fg;
        ctx.fillText(m.text, x, H * 0.42);
        ctx.fillRect(x - 2, H * 0.78, 4, H * 0.22);
      }
    }
    return finish(c);
  });
}

/** Text printed in a circle on the flat ring around the front element. */
export function nameRingTexture(text: string, rInFrac: number, color: string): THREE.CanvasTexture {
  const key = `ring|${text}|${rInFrac.toFixed(3)}|${color}`;
  return cached(key, () => {
    // 1024 keeps the lettering sharp at any viewing distance; 2048 cost ~16 MB of upload per lens.
    const S = 1024;
    const { c, ctx } = canvas(S, S);
    ctx.fillStyle = "#0b0b0d";
    ctx.fillRect(0, 0, S, S);
    const outer = S / 2;
    const inner = outer * rInFrac;
    const band = outer - inner;
    const radius = inner + band * 0.48;
    let size = Math.min(band * 0.5, 32);
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.font = `600 ${size}px ${FONT}`;
    const maxArc = Math.PI * 2 * radius * 0.92;
    const w = ctx.measureText(text).width;
    if (w > maxArc) {
      size *= maxArc / w;
      ctx.font = `600 ${size}px ${FONT}`;
    }
    const total = ctx.measureText(text).width;
    let a = -Math.PI / 2 - total / radius / 2;
    for (const ch of text) {
      const cw = ctx.measureText(ch).width;
      const mid = a + cw / 2 / radius;
      ctx.save();
      ctx.translate(S / 2 + Math.cos(mid) * radius, S / 2 + Math.sin(mid) * radius);
      ctx.rotate(mid + Math.PI / 2);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      a += cw / radius;
    }
    return finish(c);
  });
}

/** Fine grain used as bump/roughness map for painted metal and rubber. */
export function grainTexture(): THREE.CanvasTexture {
  return cached("grain", () => {
    const S = 256;
    const { c, ctx } = canvas(S, S);
    const img = ctx.createImageData(S, S);
    for (let i = 0; i < S * S; i += 1) {
      const v = 128 + (Math.random() - 0.5) * 70;
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const t = finish(c, false);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(24, 6);
    return t;
  });
}
