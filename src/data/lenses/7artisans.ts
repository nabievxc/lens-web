import { defineLenses } from "./define";

const APSC_MOUNTS = ["E", "X", "Z", "RF", "M43", "L"] as const;

export const sevenArtisans = defineLenses("7artisans", { m: [...APSC_MOUNTS], fmt: "APS-C", af: false }, [
  // Manual APS-C
  { n: "4mm F2.8 Circular Fisheye", f: 4, a: 2.8, aMin: 16, d: 62, l: 50, w: 175, y: 2022, p: 139, c: ["fisheye"], col: "black", b: 6 },
  { n: "7.5mm F2.8 II Fisheye", f: 7.5, a: 2.8, aMin: 16, d: 63, l: 60, w: 300, y: 2021, p: 149, c: ["fisheye"], b: 7 },
  { n: "10mm F2.8 Fisheye", m: ["E", "Z", "RF", "L"], fmt: "FF", f: 10, a: 2.8, d: 74, l: 80, w: 500, y: 2021, p: 289, c: ["fisheye"] },
  { n: "12mm F2.8 II", f: 12, a: 2.8, d: 62, l: 58, w: 260, y: 2021, p: 149, b: 7 },
  { n: "25mm F1.8", f: 25, a: 1.8, d: 51, l: 41, w: 150, fl: 46, y: 2018, p: 69, b: 12, col: "silver" },
  { n: "35mm F0.95", f: 35, a: 0.95, d: 65, l: 63, w: 375, fl: 52, y: 2021, p: 179, b: 12 },
  { n: "35mm F1.2 II", f: 35, a: 1.2, d: 54, l: 52, w: 210, fl: 43, y: 2021, p: 99, b: 12 },
  { n: "50mm F0.95", f: 50, a: 0.95, d: 65, l: 63, w: 437, fl: 58, y: 2022, p: 199, b: 12 },
  { n: "55mm F1.4 II", f: 55, a: 1.4, d: 57, l: 57, w: 275, fl: 49, y: 2021, p: 109, b: 13 },
  { n: "60mm F2.8 II Macro", f: 60, a: 2.8, d: 65, l: 97, w: 450, fl: 49, y: 2021, p: 169, c: ["macro"] },
  // Full frame manual
  { n: "50mm F1.05", m: ["E", "Z", "RF", "L"], fmt: "FF", f: 50, a: 1.05, d: 70, l: 78, w: 760, fl: 62, y: 2021, p: 399, b: 13 },
  { n: "35mm F1.4 Mark II", m: ["E", "Z", "RF", "L"], fmt: "FF", f: 35, a: 1.4, d: 63, l: 68, w: 400, fl: 52, y: 2022, p: 249 },
  { n: "14mm F2.8 Spectrum", m: ["E", "Z", "RF", "L"], fmt: "FF", f: 14, a: 2.8, d: 72, l: 85, w: 495, y: 2023, p: 249 },
  { n: "50mm F2 Tilt-Shift", m: ["E", "Z", "RF", "L", "X"], fmt: "FF", f: 50, a: 2, d: 69, l: 84, w: 540, fl: 62, y: 2023, p: 299 },
  // AF
  { n: "AF 35mm F1.8", m: ["E", "Z"], fmt: "FF", af: true, f: 35, a: 1.8, d: 64, l: 73, w: 285, fl: 58, y: 2023, p: 239 },
  { n: "AF 50mm F1.8", m: ["E", "Z"], fmt: "FF", af: true, f: 50, a: 1.8, d: 64, l: 73, w: 300, fl: 58, y: 2023, p: 199 },
  { n: "AF 27mm F2.8", m: ["E", "X", "Z"], af: true, f: 27, a: 2.8, d: 64, l: 23, w: 85, fl: 39, y: 2024, p: 99, b: 7, col: "silver" },
  // Hope cine primes
  { n: "Hope 14mm T2.9 Cine", s: "Hope", m: ["PL", "E", "RF", "L"], fmt: "FF", f: 14, a: 2.9, t: true, d: 95, l: 108, w: 1040, y: 2022, p: 599 },
  { n: "Hope 24mm T1.4 Cine", s: "Hope", m: ["PL", "E", "RF", "L"], fmt: "FF", f: 24, a: 1.4, t: true, d: 95, l: 108, w: 1150, y: 2022, p: 599 },
  { n: "Hope 35mm T1.4 Cine", s: "Hope", m: ["PL", "E", "RF", "L"], fmt: "FF", f: 35, a: 1.4, t: true, d: 95, l: 108, w: 1150, y: 2022, p: 599 },
  { n: "Hope 50mm T1.4 Cine", s: "Hope", m: ["PL", "E", "RF", "L"], fmt: "FF", f: 50, a: 1.4, t: true, d: 95, l: 108, w: 1160, y: 2022, p: 599 },
  { n: "Hope 85mm T1.4 Cine", s: "Hope", m: ["PL", "E", "RF", "L"], fmt: "FF", f: 85, a: 1.4, t: true, d: 95, l: 108, w: 1210, y: 2022, p: 599 },
  { n: "Hope 135mm T2 Cine", s: "Hope", m: ["PL", "E", "RF", "L"], fmt: "FF", f: 135, a: 2, t: true, d: 95, l: 142, w: 1370, y: 2023, p: 699 },
]);
