import { defineLenses } from "./define";

const FF_MOUNTS = ["E", "Z", "RF", "L"] as const;

export const laowa = defineLenses("laowa", { m: [...FF_MOUNTS], fmt: "FF", af: false }, [
  // Ultra wide Zero-D
  { n: "9mm f/5.6 FF RL", s: "Zero-D", m: ["E", "Z", "RF", "L"], f: 9, a: 5.6, d: 62.5, l: 66, w: 350, y: 2021, p: 799 },
  { n: "10-18mm f/4.5-5.6 FE Zoom", f: [10, 18], a: 4.5, d: 70, l: 85, w: 496, y: 2017, p: 849 },
  { n: "11mm f/4.5 FF RL", s: "Zero-D", f: 11, a: 4.5, d: 63.5, l: 57.5, w: 254, fl: 62, y: 2020, p: 699, col: "silver" },
  { n: "12mm f/2.8 Zero-D", s: "Zero-D", m: ["E", "Z", "RF", "L", "EF", "F"], f: 12, a: 2.8, d: 74.8, l: 82, w: 609, y: 2016, p: 949 },
  { n: "12-24mm f/5.6 Zoom", s: "Zero-D", f: [12, 24], a: 5.6, d: 68.6, l: 85, w: 497, y: 2022, p: 799 },
  { n: "14mm f/4 FF RL Zero-D", s: "Zero-D", f: 14, a: 4, d: 58, l: 55, w: 228, fl: 52, y: 2021, p: 549 },
  { n: "15mm f/2 FE Zero-D", s: "Zero-D", f: 15, a: 2, d: 66, l: 82, w: 500, fl: 72, y: 2017, p: 849 },
  { n: "10mm f/2.8 Zero-D FF AF", s: "Zero-D", af: true, f: 10, a: 2.8, d: 80, l: 72, w: 470, y: 2024, p: 799 },
  { n: "4mm f/2.8 Fisheye", m: ["M43", "E", "X"], fmt: "M43", f: 4, a: 2.8, d: 54, l: 37, w: 135, y: 2017, p: 199, c: ["fisheye"], col: "silver" },
  // Macro
  { n: "24mm f/14 2x Macro Probe", m: ["E", "Z", "RF", "L", "EF", "F", "PL"], f: 24, a: 14, aMin: 40, d: 75, l: 408, w: 474, y: 2019, p: 1699, c: ["macro"] },
  { n: "25mm f/2.8 2.5-5x Ultra Macro", m: ["E", "Z", "RF", "L", "EF", "F"], f: 25, a: 2.8, aMin: 16, d: 60, l: 60, w: 400, fl: 40.5, y: 2018, p: 399, c: ["macro"] },
  { n: "58mm f/2.8 2x Ultra Macro APO", f: 58, a: 2.8, d: 67.5, l: 100, w: 520, fl: 62, y: 2023, p: 499, c: ["macro"] },
  { n: "85mm f/5.6 2x Ultra Macro APO", f: 85, a: 5.6, d: 51.5, l: 96, w: 248, fl: 46, y: 2021, p: 449, c: ["macro"] },
  { n: "90mm f/2.8 2x Ultra Macro APO", f: 90, a: 2.8, d: 69.5, l: 125, w: 586, fl: 67, y: 2022, p: 599, c: ["macro"] },
  { n: "100mm f/2.8 2x Ultra Macro APO", m: ["E", "Z", "RF", "L", "EF", "F"], f: 100, a: 2.8, d: 73, l: 125.8, w: 638, fl: 67, y: 2019, p: 449, c: ["macro"] },
  // Argus
  { n: "Argus 33mm f/0.95 CF APO", s: "Argus", m: ["E", "Z", "RF", "X"], fmt: "APS-C", f: 33, a: 0.95, d: 71.5, l: 83, w: 590, fl: 62, y: 2021, p: 499 },
  { n: "Argus 35mm f/0.95 FF", s: "Argus", f: 35, a: 0.95, d: 76.8, l: 103, w: 755, fl: 72, y: 2021, p: 899 },
  { n: "Argus 45mm f/0.95 FF", s: "Argus", f: 45, a: 0.95, d: 76.8, l: 110, w: 835, fl: 72, y: 2021, p: 899 },
  // Cine
  { n: "OOOM 25-100mm T2.9 Cine", s: "OOOM", m: ["PL", "EF", "E"], f: [25, 100], a: 2.9, t: true, d: 80, l: 187, w: 1450, y: 2021, p: 2499 },
  { n: "Nanomorph 27mm T2.8 1.5x S35", s: "Nanomorph", m: ["E", "X", "M43", "Z", "RF", "L", "PL"], fmt: "S35", f: 27, a: 2.8, t: true, sq: 1.5, d: 60, l: 120, w: 550, y: 2021, p: 1299, c: ["anamorphic"] },
  { n: "Nanomorph 35mm T2.4 1.5x S35", s: "Nanomorph", m: ["E", "X", "M43", "Z", "RF", "L", "PL"], fmt: "S35", f: 35, a: 2.4, t: true, sq: 1.5, d: 60, l: 120, w: 580, y: 2021, p: 1299, c: ["anamorphic"] },
  { n: "Nanomorph 50mm T2.4 1.5x S35", s: "Nanomorph", m: ["E", "X", "M43", "Z", "RF", "L", "PL"], fmt: "S35", f: 50, a: 2.4, t: true, sq: 1.5, d: 60, l: 120, w: 580, y: 2021, p: 1299, c: ["anamorphic"] },
  { n: "Proteus 2x 45mm T2.9 Anamorphic", s: "Proteus", m: ["PL", "EF", "E"], f: 45, a: 2.9, t: true, sq: 2, d: 80, l: 182, w: 1400, y: 2022, p: 3999, c: ["anamorphic"] },
  { n: "Proteus 2x 85mm T2.9 Anamorphic", s: "Proteus", m: ["PL", "EF", "E"], f: 85, a: 2.9, t: true, sq: 2, d: 80, l: 182, w: 1420, y: 2022, p: 3999, c: ["anamorphic"] },
]);
