import { defineLenses } from "./define";

const APSC_MOUNTS = ["E", "X", "Z", "RF", "M43", "L"] as const;

export const ttartisan = defineLenses("ttartisan", { m: [...APSC_MOUNTS], fmt: "APS-C", af: false }, [
  { n: "7.5mm F2 Fisheye", f: 7.5, a: 2, d: 62, l: 64, w: 290, y: 2022, p: 129, c: ["fisheye"] },
  { n: "11mm F2.8 Fisheye", m: ["E", "Z", "RF", "L"], fmt: "FF", f: 11, a: 2.8, d: 79, l: 70, w: 357, y: 2021, p: 289, c: ["fisheye"] },
  { n: "17mm F1.4", f: 17, a: 1.4, d: 62, l: 51.5, w: 250, fl: 52, y: 2020, p: 99 },
  { n: "23mm F1.4", f: 23, a: 1.4, d: 52, l: 52, w: 170, fl: 43, y: 2021, p: 79, col: "silver" },
  { n: "25mm F2", f: 25, a: 2, d: 48, l: 32, w: 90, fl: 39, y: 2021, p: 59, b: 10, col: "silver" },
  { n: "35mm F0.95", f: 35, a: 0.95, d: 65, l: 63, w: 350, fl: 52, y: 2022, p: 199 },
  { n: "50mm F1.2", f: 50, a: 1.2, d: 60, l: 60, w: 335, fl: 52, y: 2021, p: 99, col: "silver" },
  { n: "50mm F2 (Full Frame)", m: ["E", "Z", "RF", "L"], fmt: "FF", f: 50, a: 2, d: 55, l: 42, w: 160, fl: 43, y: 2022, p: 69, col: "silver" },
  { n: "100mm F2.8 Bubble Bokeh", m: ["E", "Z", "RF", "L", "X"], fmt: "FF", f: 100, a: 2.8, d: 64, l: 96, w: 450, fl: 52, y: 2022, p: 149 },
  { n: "40mm F2.8 Macro", f: 40, a: 2.8, d: 60, l: 80, w: 320, fl: 52, y: 2022, p: 129, c: ["macro"] },
  { n: "AF 27mm F2.8", m: ["E", "X", "Z"], af: true, f: 27, a: 2.8, d: 62, l: 31, w: 84, fl: 39, y: 2022, p: 119, b: 7 },
  { n: "AF 35mm F1.8 II", m: ["E", "X", "Z"], af: true, f: 35, a: 1.8, d: 60, l: 52, w: 210, fl: 52, y: 2023, p: 159 },
  { n: "AF 56mm F1.8", m: ["E", "X", "Z"], af: true, f: 56, a: 1.8, d: 64, l: 56, w: 162, fl: 52, y: 2022, p: 149 },
  { n: "AF 75mm F2 FE", m: ["E", "Z"], fmt: "FF", af: true, f: 75, a: 2, d: 68, l: 64, w: 345, fl: 52, y: 2023, p: 199 },
  { n: "Tilt 50mm F1.4", m: ["E", "Z", "RF", "L", "X"], fmt: "FF", f: 50, a: 1.4, d: 65, l: 83, w: 520, fl: 62, y: 2022, p: 199 },
]);
