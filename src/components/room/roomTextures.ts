import * as THREE from "three";
import { focalLabel } from "@/lib/format";
import type { Slot } from "./layout";

const DISPLAY = '"Shrikhand", Georgia, serif';
const SANS = '"Work Sans Variable", system-ui, sans-serif';

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext("2d")! };
}

function texture(c: HTMLCanvasElement, opts: { repeat?: [number, number]; srgb?: boolean } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (opts.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...opts.repeat);
  }
  return t;
}

/** Deterministic noise so the room looks the same on every visit. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function woodFloor(): THREE.CanvasTexture {
  const W = 1024;
  const H = 1024;
  const { c, ctx } = canvas(W, H);
  const rand = rng(7);
  const planks = 8;
  const ph = H / planks;
  for (let row = 0; row < planks; row += 1) {
    let x = -rand() * 400;
    while (x < W) {
      const len = 300 + rand() * 420;
      const tone = 0.82 + rand() * 0.3;
      const r = Math.round(150 * tone);
      const g = Math.round(98 * tone);
      const b = Math.round(60 * tone);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, row * ph, len, ph);
      for (let i = 0; i < 26; i += 1) {
        const y = row * ph + rand() * ph;
        ctx.strokeStyle = `rgba(60,32,14,${0.05 + rand() * 0.1})`;
        ctx.lineWidth = 0.6 + rand() * 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(x + len * 0.3, y + rand() * 6 - 3, x + len * 0.7, y + rand() * 6 - 3, x + len, y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(40,20,8,0.55)";
      ctx.fillRect(x, row * ph, 2, ph);
      x += len;
    }
    ctx.fillStyle = "rgba(40,20,8,0.6)";
    ctx.fillRect(0, row * ph, W, 2);
  }
  return texture(c, { repeat: [3, 3] });
}

/** Long-grain hardwood for shelf boards and frames. Grain runs along u. */
export function woodGrain(base: [number, number, number], opts: { vertical?: boolean; seed?: number } = {}): THREE.CanvasTexture {
  const W = 1024;
  const H = 256;
  const { c, ctx } = canvas(W, H);
  const rand = rng(opts.seed ?? 11);
  const [r0, g0, b0] = base;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  for (let i = 0; i <= 6; i += 1) {
    const t = 0.9 + rand() * 0.2;
    grad.addColorStop(i / 6, `rgb(${Math.round(r0 * t)},${Math.round(g0 * t)},${Math.round(b0 * t)})`);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 140; i += 1) {
    const y = rand() * H;
    const dark = rand() < 0.7;
    ctx.strokeStyle = dark ? `rgba(30,14,6,${0.06 + rand() * 0.16})` : `rgba(255,220,180,${0.03 + rand() * 0.05})`;
    ctx.lineWidth = 0.5 + rand() * 2.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    const amp = 2 + rand() * 7;
    const f = 1 + rand() * 3;
    const ph = rand() * Math.PI * 2;
    for (let x = 0; x <= W; x += 16) ctx.lineTo(x, y + Math.sin((x / W) * Math.PI * 2 * f + ph) * amp);
    ctx.stroke();
  }
  // A few knots with the grain bending around them.
  for (let k = 0; k < 3; k += 1) {
    const kx = rand() * W;
    const ky = rand() * H;
    for (let ring = 10; ring > 0; ring -= 1) {
      ctx.strokeStyle = `rgba(35,16,6,${0.05 + (10 - ring) * 0.012})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(kx, ky, ring * 4.2, ring * 1.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const t = texture(c, { repeat: [1, 1] });
  if (opts.vertical) {
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI / 2;
  }
  return t;
}

/** Trowelled concrete for the cine room floor. */
export function concrete(): THREE.CanvasTexture {
  const S = 1024;
  const { c, ctx } = canvas(S, S);
  ctx.fillStyle = "#8d8780";
  ctx.fillRect(0, 0, S, S);
  const rand = rng(21);
  for (let i = 0; i < 260; i += 1) {
    const x = rand() * S;
    const y = rand() * S;
    const r = 20 + rand() * 120;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const v = rand() < 0.5 ? "60,56,52" : "170,164,156";
    g.addColorStop(0, `rgba(${v},${0.05 + rand() * 0.08})`);
    g.addColorStop(1, `rgba(${v},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 16000; i += 1) {
    const v = rand() < 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${0.02 + rand() * 0.04})`;
    ctx.fillRect(rand() * S, rand() * S, 1.5, 1.5);
  }
  // Saw-cut control joints.
  ctx.fillStyle = "rgba(30,28,26,0.55)";
  ctx.fillRect(0, S / 2 - 1, S, 3);
  ctx.fillRect(S / 2 - 1, 0, 3, S);
  return texture(c, { repeat: [2, 2] });
}

/** Printed lettering on a transparent background, for logos on camera bodies. */
export function labelTexture(text: string, color: string, font: "sans" | "wide"): THREE.CanvasTexture {
  const W = 512;
  const H = 128;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let size = 110;
  const face = () => (font === "wide" ? `800 ${size}px ${SANS}` : `600 ${size}px ${SANS}`);
  ctx.font = face();
  if (font === "wide") ctx.letterSpacing = "8px";
  while (ctx.measureText(text).width > W * 0.94 && size > 20) {
    size -= 4;
    ctx.font = face();
  }
  ctx.fillText(text, W / 2, H / 2 + 4);
  return texture(c);
}

/** Pebbled leatherette for camera grips, as a bump map. */
export function leatherBump(): THREE.CanvasTexture {
  const S = 256;
  const { c, ctx } = canvas(S, S);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, S, S);
  const r = rng(11);
  for (let i = 0; i < 2600; i++) {
    const x = r() * S;
    const y = r() * S;
    const rad = 1.2 + r() * 2.4;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  return texture(c, { repeat: [3, 3], srgb: false });
}

/** Fine bead-blasted / brushed grain for anodised and painted metal, as a bump map. */
export function metalBump(brushed: boolean): THREE.CanvasTexture {
  const S = 256;
  const { c, ctx } = canvas(S, S);
  const img = ctx.createImageData(S, S);
  const r = rng(brushed ? 23 : 31);
  const row = new Float32Array(S);
  for (let y = 0; y < S; y++) {
    const streak = brushed ? (r() - 0.5) * 40 : 0;
    for (let x = 0; x < S; x++) {
      row[x] = 128 + streak + (r() - 0.5) * (brushed ? 18 : 60);
      const i = (y * S + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = row[x];
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return texture(c, { repeat: [2, 2], srgb: false });
}

export type PrintKind = "dunes" | "bokeh" | "sea" | "peaks" | "street";

/** Large framed photographs for the walls, drawn procedurally. */
export function printTexture(kind: PrintKind): THREE.CanvasTexture {
  const W = 768;
  const H = 540;
  const { c, ctx } = canvas(W, H);
  const rand = rng(kind.length * 97 + 13);
  const grad = (stops: [number, string][], y0 = 0, y1 = H) => {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    for (const [t, col] of stops) g.addColorStop(t, col);
    return g;
  };
  if (kind === "dunes") {
    ctx.fillStyle = grad([[0, "#f6c58d"], [1, "#f08a5d"]]);
    ctx.fillRect(0, 0, W, H);
    const tones = ["#d9774a", "#c25f3a", "#a8492c", "#7d3220"];
    tones.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      const base = H * (0.45 + i * 0.14);
      ctx.moveTo(0, H);
      ctx.lineTo(0, base);
      for (let x = 0; x <= W; x += 24) ctx.lineTo(x, base - Math.sin(x / (120 + i * 40) + i) * (30 - i * 4) - rand() * 4);
      ctx.lineTo(W, H);
      ctx.fill();
    });
  } else if (kind === "bokeh") {
    ctx.fillStyle = "#0b0d18";
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i += 1) {
      const x = rand() * W;
      const y = rand() * H;
      const r = 14 + rand() * 50;
      const hue = [30, 45, 200, 340][Math.floor(rand() * 4)];
      const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
      g.addColorStop(0, `hsla(${hue},90%,70%,${0.25 + rand() * 0.3})`);
      g.addColorStop(0.85, `hsla(${hue},90%,60%,${0.2 + rand() * 0.2})`);
      g.addColorStop(1, `hsla(${hue},90%,60%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "sea") {
    ctx.fillStyle = grad([[0, "#9fb8c9"], [0.55, "#e9e4d8"], [0.56, "#6f8896"], [1, "#2c3e4a"]]);
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let i = 0; i < 30; i += 1) ctx.fillRect(rand() * W, H * 0.57 + rand() * H * 0.4, 30 + rand() * 120, 1.5);
    ctx.fillStyle = "#1d2a33";
    ctx.fillRect(W * 0.68, H * 0.36, 6, H * 0.2);
    ctx.fillRect(W * 0.66, H * 0.36, 40, 4);
  } else if (kind === "peaks") {
    ctx.fillStyle = grad([[0, "#2a3557"], [0.6, "#e7a07a"], [1, "#f3d3b0"]]);
    ctx.fillRect(0, 0, W, H);
    ["#5a5f7d", "#3d4260", "#262a40"].forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, H);
      let x = 0;
      let y = H * (0.55 + i * 0.12);
      ctx.lineTo(x, y);
      while (x < W) {
        x += 40 + rand() * 70;
        y = H * (0.4 + i * 0.13) + (rand() - 0.5) * 120;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.fill();
    });
  } else {
    ctx.fillStyle = grad([[0, "#120f1e"], [1, "#2a1530"]]);
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i += 1) {
      const x = rand() * W;
      const w = 50 + rand() * 90;
      const h = 200 + rand() * 300;
      ctx.fillStyle = "#0a0910";
      ctx.fillRect(x, H - h, w, h);
      for (let k = 0; k < 20; k += 1) {
        ctx.fillStyle = rand() < 0.5 ? "rgba(255,200,120,0.8)" : "rgba(120,220,255,0.7)";
        ctx.fillRect(x + 6 + rand() * (w - 14), H - h + 10 + rand() * (h - 20), 5, 7);
      }
    }
    ctx.fillStyle = "rgba(255,60,120,0.9)";
    ctx.fillRect(W * 0.2, H * 0.62, 140, 10);
    ctx.fillStyle = "rgba(255,60,120,0.25)";
    ctx.fillRect(W * 0.2 - 10, H * 0.62 - 10, 160, 30);
  }
  // Slight vignette like a real print.
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.7);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  return texture(c);
}

export function clockFace(): THREE.CanvasTexture {
  const S = 512;
  const { c, ctx } = canvas(S, S);
  ctx.fillStyle = "#f4ecdf";
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1612";
  for (let i = 0; i < 60; i += 1) {
    const a = (i / 60) * Math.PI * 2;
    const long = i % 5 === 0;
    ctx.save();
    ctx.translate(S / 2, S / 2);
    ctx.rotate(a);
    ctx.fillRect(-(long ? 5 : 2), -S / 2 + 22, long ? 10 : 4, long ? 44 : 18);
    ctx.restore();
  }
  ctx.font = `48px ${DISPLAY}`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#c0392b";
  ctx.fillText("Lens Catalog", S / 2, S * 0.68);
  return texture(c);
}

/** A 2.39:1 frame on the screening wall: dusk over water, with the blue streak anamorphics are known for. */
export function screenTexture(): THREE.CanvasTexture {
  const W = 1434;
  const H = 600;
  const { c, ctx } = canvas(W, H);
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
  sky.addColorStop(0, "#14213a");
  sky.addColorStop(0.55, "#a8513a");
  sky.addColorStop(1, "#f2a65a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.62);
  const sea = ctx.createLinearGradient(0, H * 0.62, 0, H);
  sea.addColorStop(0, "#3a2a33");
  sea.addColorStop(1, "#0a0d16");
  ctx.fillStyle = sea;
  ctx.fillRect(0, H * 0.62, W, H * 0.38);

  const sx = W * 0.62;
  const sy = H * 0.58;
  const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, 120);
  sun.addColorStop(0, "rgba(255,240,210,1)");
  sun.addColorStop(0.25, "rgba(255,200,140,0.9)");
  sun.addColorStop(1, "rgba(255,160,90,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(sx - 120, sy - 120, 240, 240);
  for (let i = 0; i < 18; i += 1) {
    const y = H * 0.64 + i * 11;
    ctx.fillStyle = `rgba(255,190,120,${0.35 - i * 0.017})`;
    ctx.fillRect(sx - 60 + Math.sin(i) * 20, y, 120 - i * 4, 2);
  }
  const streak = ctx.createLinearGradient(0, 0, W, 0);
  streak.addColorStop(0, "rgba(90,150,255,0)");
  streak.addColorStop(0.5, "rgba(140,190,255,0.85)");
  streak.addColorStop(1, "rgba(90,150,255,0)");
  ctx.fillStyle = streak;
  ctx.fillRect(0, sy - 2, W, 4);

  // Headland silhouette.
  ctx.fillStyle = "#0b0a10";
  ctx.beginPath();
  ctx.moveTo(0, H * 0.62);
  ctx.bezierCurveTo(W * 0.12, H * 0.42, W * 0.25, H * 0.5, W * 0.36, H * 0.62);
  ctx.closePath();
  ctx.fill();
  return texture(c);
}

export function plaster(base: string): THREE.CanvasTexture {
  const S = 512;
  const { c, ctx } = canvas(S, S);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  const rand = rng(3);
  for (let i = 0; i < 9000; i += 1) {
    const v = rand() < 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${0.015 + rand() * 0.03})`;
    const s = 1 + rand() * 3;
    ctx.fillRect(rand() * S, rand() * S, s, s);
  }
  return texture(c, { repeat: [4, 2] });
}

/** Price rail along the front of a shelf: focal length under each lens, brand name where a brand starts. */
export function railTexture(slots: Slot[], width: number): THREE.CanvasTexture {
  const W = 2048;
  const H = 64;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#efe3cf";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(0, H - 6, W, 6);
  const pxPerM = W / width;
  let lastBrand = "";
  ctx.textBaseline = "middle";
  for (const s of slots) {
    const cx = (s.local[0] + width / 2) * pxPerM;
    if (s.lens.brand !== lastBrand) {
      lastBrand = s.lens.brand;
      ctx.fillStyle = "#c0392b";
      ctx.fillRect(cx - 40, 6, 3, H - 18);
    }
    ctx.fillStyle = "#1b1612";
    ctx.textAlign = "center";
    ctx.font = `600 22px ${SANS}`;
    ctx.fillText(focalLabel(s.lens).replace("mm", ""), cx, 24);
    ctx.font = `500 15px ${SANS}`;
    ctx.fillStyle = "#6b5a48";
    ctx.fillText(s.lens.tStop ? `T${s.lens.apertureMax}` : `f/${s.lens.apertureMax}`, cx, 46);
  }
  return texture(c);
}

export function signTexture(lines: string[], opts: { bg: string; fg: string; w?: number; h?: number }) {
  const W = opts.w ?? 1024;
  const H = opts.h ?? 192;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = opts.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = opts.fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const text = lines.join(" · ");
  let size = H * 0.5;
  ctx.font = `${size}px ${DISPLAY}`;
  while (ctx.measureText(text).width > W * 0.9 && size > 18) {
    size -= 2;
    ctx.font = `${size}px ${DISPLAY}`;
  }
  ctx.fillText(text, W / 2, H / 2 + size * 0.06);
  return texture(c);
}

/** Neon tube lettering on a transparent background, drawn bright so bloom picks it up. */
export function neonTexture(text: string, sub: string): THREE.CanvasTexture {
  const W = 2048;
  const H = 512;
  const { c, ctx } = canvas(W, H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `230px ${DISPLAY}`;
  ctx.shadowColor = "#ff5a3c";
  ctx.shadowBlur = 40;
  ctx.fillStyle = "#ff7a5c";
  ctx.fillText(text, W / 2, H * 0.4);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffe0d2";
  ctx.fillText(text, W / 2, H * 0.4);
  ctx.font = `600 72px ${SANS}`;
  ctx.shadowColor = "#ffd27a";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "#ffe7a8";
  ctx.fillText(sub.toUpperCase().split("").join(" "), W / 2, H * 0.83);
  return texture(c);
}

export function posterTexture(title: string, body: string[]): THREE.CanvasTexture {
  const W = 768;
  const H = 1024;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#e7d7c1";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const maxW = W - 120;
  let size = 120;
  ctx.font = `${size}px ${DISPLAY}`;
  const lines: string[] = [];
  for (const word of title.split(" ")) {
    const last = lines.length - 1;
    if (last >= 0 && ctx.measureText(`${lines[last]} ${word}`).width <= maxW) lines[last] += ` ${word}`;
    else lines.push(word);
  }
  while (lines.some((l) => ctx.measureText(l).width > maxW) && size > 40) {
    size -= 4;
    ctx.font = `${size}px ${DISPLAY}`;
  }
  const lineH = size * 1.05;
  lines.forEach((line, i) => ctx.fillText(line, 60, 64 + i * lineH));

  ctx.font = `500 40px ${SANS}`;
  const bodyTop = 64 + lines.length * lineH + 50;
  body.forEach((line, i) => ctx.fillText(line, 60, bodyTop + i * 64));
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  return texture(c);
}
