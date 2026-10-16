import { defineLenses } from "./define";

export const viltrox = defineLenses("viltrox", { m: ["E", "X", "Z"], fmt: "FF", af: true }, [
  // Full frame
  { n: "AF 16mm F1.8 FE", m: ["E", "Z"], f: 16, a: 1.8, d: 80.2, l: 102, w: 545, fl: 77, y: 2023, p: 549, ar: true },
  { n: "AF 20mm F2.8 FE", m: ["E", "Z"], f: 20, a: 2.8, d: 65.5, l: 37.6, w: 166, fl: 52, y: 2023, p: 159, b: 7 },
  { n: "AF 24mm F1.8 FE", m: ["E", "Z"], f: 24, a: 1.8, d: 65.5, l: 76, w: 330, fl: 55, y: 2022, p: 299 },
  { n: "AF 35mm F1.2 LAB FE", s: "LAB", m: ["E", "Z"], f: 35, a: 1.2, d: 84, l: 125, w: 1088, fl: 77, y: 2024, p: 899, ar: true, b: 11 },
  { n: "AF 35mm F1.8 FE", m: ["E", "Z"], f: 35, a: 1.8, d: 65.5, l: 76, w: 330, fl: 55, y: 2022, p: 299 },
  { n: "AF 40mm F2.5 FE", m: ["E", "Z"], f: 40, a: 2.5, d: 62, l: 41.3, w: 160, fl: 52, y: 2024, p: 179, b: 7 },
  { n: "AF 50mm F1.4 Pro FE", s: "Pro", m: ["E", "Z"], f: 50, a: 1.4, d: 72, l: 88.5, w: 400, fl: 62, y: 2025, p: 449, ar: true, b: 11 },
  { n: "AF 50mm F1.8 FE", m: ["E", "Z"], f: 50, a: 1.8, d: 71.6, l: 92.4, w: 370, fl: 58, y: 2023, p: 249 },
  { n: "AF 85mm F1.8 FE II", m: ["E", "Z"], f: 85, a: 1.8, d: 76.2, l: 92, w: 482, fl: 72, y: 2021, p: 399 },
  { n: "AF 135mm F1.8 LAB FE", s: "LAB", m: ["E", "Z"], f: 135, a: 1.8, d: 96, l: 132, w: 1215, fl: 82, y: 2024, p: 799, ar: true, b: 11 },
  { n: "AF 28mm F4.5 FE", m: ["E"], f: 28, a: 4.5, d: 63, l: 15, w: 60, y: 2024, p: 99, b: 5, col: "silver" },
  // APS-C
  { n: "AF 13mm F1.4 XF", m: ["X", "E", "Z"], fmt: "APS-C", f: 13, a: 1.4, d: 74.6, l: 85, w: 420, fl: 67, y: 2021, p: 439, ar: true },
  { n: "AF 23mm F1.4 XF", m: ["X", "E", "Z"], fmt: "APS-C", f: 23, a: 1.4, d: 65, l: 72, w: 260, fl: 52, y: 2019, p: 279 },
  { n: "AF 27mm F1.2 Pro XF", s: "Pro", m: ["X", "E", "Z"], fmt: "APS-C", f: 27, a: 1.2, d: 75.6, l: 96.9, w: 570, fl: 67, y: 2023, p: 549, ar: true, b: 11 },
  { n: "AF 33mm F1.4 XF", m: ["X", "E", "Z"], fmt: "APS-C", f: 33, a: 1.4, d: 65, l: 72, w: 270, fl: 52, y: 2020, p: 279 },
  { n: "AF 56mm F1.4 XF", m: ["X", "E", "Z"], fmt: "APS-C", f: 56, a: 1.4, d: 65, l: 72, w: 290, fl: 52, y: 2019, p: 299 },
  { n: "AF 75mm F1.2 Pro XF", s: "Pro", m: ["X", "E", "Z"], fmt: "APS-C", f: 75, a: 1.2, d: 87, l: 108, w: 670, fl: 72, y: 2022, p: 549, ar: true, b: 11 },
  { n: "AF 9mm F2.8 Air", m: ["X", "E", "Z"], fmt: "APS-C", f: 9, a: 2.8, d: 62, l: 43, w: 152, fl: 52, y: 2025, p: 199, b: 7 },
  // Cine
  { n: "EPIC 25mm T2.1 1.33x Anamorphic", s: "EPIC", m: ["E", "L", "RF", "Z"], f: 25, a: 2.1, t: true, sq: 1.33, d: 80, l: 115, w: 1010, y: 2025, p: 1499, c: ["anamorphic"] },
  { n: "EPIC 35mm T2 1.33x Anamorphic", s: "EPIC", m: ["E", "L", "RF", "Z"], f: 35, a: 2, t: true, sq: 1.33, d: 80, l: 115, w: 1040, y: 2025, p: 1499, c: ["anamorphic"] },
  { n: "EPIC 50mm T2 1.33x Anamorphic", s: "EPIC", m: ["E", "L", "RF", "Z"], f: 50, a: 2, t: true, sq: 1.33, d: 80, l: 115, w: 1050, y: 2025, p: 1499, c: ["anamorphic"] },
]);
