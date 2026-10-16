import { defineLenses } from "./define";

export const omSystem = defineLenses("om-system", { m: ["M43"], fmt: "M43", af: true }, [
  { n: "M.Zuiko 7-14mm F2.8 PRO", s: "PRO", f: [7, 14], a: 2.8, d: 78.9, l: 105.8, w: 534, y: 2015, p: 1299 },
  { n: "M.Zuiko 8-25mm F4 PRO", s: "PRO", f: [8, 25], a: 4, d: 77, l: 88.5, w: 411, fl: 72, y: 2021, p: 999 },
  { n: "M.Zuiko 12-40mm F2.8 PRO II", s: "PRO", f: [12, 40], a: 2.8, d: 69.9, l: 84, w: 382, fl: 62, y: 2022, p: 799, ext: 20 },
  { n: "M.Zuiko 12-100mm F4 IS PRO", s: "PRO", f: [12, 100], a: 4, d: 77.5, l: 116.5, w: 561, fl: 72, y: 2016, p: 1299, ext: 40 },
  { n: "M.Zuiko 40-150mm F2.8 PRO", s: "PRO", f: [40, 150], a: 2.8, d: 79.4, l: 160, w: 760, fl: 72, y: 2014, p: 1499 },
  { n: "M.Zuiko 40-150mm F4 PRO", s: "PRO", f: [40, 150], a: 4, d: 68.2, l: 99.4, w: 382, fl: 62, y: 2022, p: 899, ext: 40 },
  { n: "M.Zuiko 150-600mm F5.0-6.3 IS", f: [150, 600], a: 5, d: 109.4, l: 264.4, w: 2065, fl: 95, y: 2022, p: 2999 },
  { n: "M.Zuiko 150-400mm F4.5 TC1.25x IS PRO", s: "PRO", f: [150, 400], a: 4.5, d: 115.6, l: 314.4, w: 1875, fl: 95, y: 2021, p: 7499, col: "white" },
  { n: "M.Zuiko 300mm F4 IS PRO", s: "PRO", f: 300, a: 4, d: 92.5, l: 227, w: 1270, fl: 77, y: 2016, p: 2499 },
  { n: "M.Zuiko 17mm F1.2 PRO", s: "PRO", f: 17, a: 1.2, d: 68.2, l: 87, w: 390, fl: 62, y: 2017, p: 1199 },
  { n: "M.Zuiko 25mm F1.2 PRO", s: "PRO", f: 25, a: 1.2, d: 70, l: 87, w: 410, fl: 62, y: 2016, p: 1199 },
  { n: "M.Zuiko 45mm F1.2 PRO", s: "PRO", f: 45, a: 1.2, d: 70, l: 84.9, w: 410, fl: 62, y: 2017, p: 1199 },
  { n: "M.Zuiko 20mm F1.4 PRO", s: "PRO", f: 20, a: 1.4, d: 63.4, l: 61.7, w: 247, fl: 58, y: 2022, p: 799 },
  { n: "M.Zuiko 8mm F1.8 Fisheye PRO", s: "PRO", f: 8, a: 1.8, d: 62, l: 80, w: 315, y: 2015, p: 999, c: ["fisheye"] },
  { n: "M.Zuiko 60mm F2.8 Macro", f: 60, a: 2.8, d: 56, l: 82, w: 185, fl: 46, y: 2012, p: 499, c: ["macro"], b: 7 },
  { n: "M.Zuiko 90mm F3.5 Macro IS PRO", s: "PRO", f: 90, a: 3.5, d: 69.6, l: 136.5, w: 453, fl: 62, y: 2023, p: 1499, c: ["macro"] },
  { n: "M.Zuiko 45mm F1.8", f: 45, a: 1.8, d: 56, l: 46, w: 116, fl: 37, y: 2011, p: 299, b: 7, col: "silver" },
  { n: "M.Zuiko 75mm F1.8", f: 75, a: 1.8, d: 64, l: 69, w: 305, fl: 58, y: 2012, p: 899, col: "silver" },
]);
