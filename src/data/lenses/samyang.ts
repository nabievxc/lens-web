import { defineLenses } from "./define";

export const samyang = defineLenses("samyang", { m: ["E"], fmt: "FF", af: true }, [
  // AF photo
  { n: "AF 12mm F2 E", m: ["E", "X"], fmt: "APS-C", f: 12, a: 2, d: 70.8, l: 59.2, w: 213, fl: 62, y: 2021, p: 399 },
  { n: "AF 14mm F2.8 FE", f: 14, a: 2.8, d: 85.5, l: 92.6, w: 505, y: 2017, p: 699 },
  { n: "AF 18mm F2.8 FE", f: 18, a: 2.8, d: 64.6, l: 60.5, w: 145, fl: 58, y: 2019, p: 399, b: 7 },
  { n: "AF 24mm F1.8 FE", f: 24, a: 1.8, d: 65, l: 71.5, w: 230, fl: 58, y: 2020, p: 399, b: 9 },
  { n: "AF 35mm F1.4 FE II", f: 35, a: 1.4, d: 75, l: 98, w: 659, fl: 67, y: 2022, p: 799 },
  { n: "AF 35-150mm F2-2.8 FE", f: [35, 150], a: 2, d: 88.5, l: 158, w: 1166, fl: 82, y: 2024, p: 1199, ext: 40 },
  { n: "AF 45mm F1.8 FE", f: 45, a: 1.8, d: 61.8, l: 56.1, w: 162, fl: 49, y: 2019, p: 399, b: 7 },
  { n: "AF 50mm F1.4 FE II", f: 50, a: 1.4, d: 75, l: 97.5, w: 585, fl: 67, y: 2022, p: 699 },
  { n: "AF 75mm F1.8 FE", f: 75, a: 1.8, d: 65, l: 69, w: 230, fl: 58, y: 2020, p: 399 },
  { n: "AF 85mm F1.4 FE II", f: 85, a: 1.4, d: 88, l: 99.5, w: 509, fl: 77, y: 2023, p: 799, b: 11 },
  { n: "AF 135mm F1.8 FE", f: 135, a: 1.8, d: 93.4, l: 130.2, w: 772, fl: 82, y: 2022, p: 999 },
  // Manual photo
  { n: "8mm F3.5 UMC Fish-eye CS II", m: ["E", "X", "EF", "F", "M43"], fmt: "APS-C", f: 8, a: 3.5, af: false, d: 75, l: 74.8, w: 417, y: 2011, p: 249, c: ["fisheye"], b: 6 },
  { n: "12mm F2.8 ED AS NCS Fish-eye", m: ["E", "EF", "F"], af: false, f: 12, a: 2.8, d: 77.4, l: 72.2, w: 525, y: 2014, p: 449, c: ["fisheye"], b: 7 },
  { n: "14mm F2.8 ED AS IF UMC", m: ["E", "EF", "F", "RF", "Z", "L"], af: false, f: 14, a: 2.8, d: 87, l: 96.1, w: 552, y: 2010, p: 299, b: 6 },
  { n: "100mm F2.8 ED UMC Macro", m: ["E", "EF", "F"], af: false, f: 100, a: 2.8, d: 72.5, l: 123.1, w: 720, fl: 67, y: 2013, p: 549, c: ["macro"] },
  // Cine (VDSLR / XEEN)
  { n: "VDSLR 14mm T3.1 MK2", s: "VDSLR", m: ["E", "EF", "F", "RF", "Z", "L", "M43", "X"], f: 14, a: 3.1, t: true, d: 87, l: 96.1, w: 593, y: 2020, p: 399 },
  { n: "VDSLR 24mm T1.5 MK2", s: "VDSLR", m: ["E", "EF", "F", "RF", "Z", "L", "M43", "X"], f: 24, a: 1.5, t: true, d: 86, l: 95.2, w: 680, fl: 77, y: 2020, p: 549 },
  { n: "VDSLR 35mm T1.5 MK2", s: "VDSLR", m: ["E", "EF", "F", "RF", "Z", "L", "M43", "X"], f: 35, a: 1.5, t: true, d: 83.6, l: 111, w: 720, fl: 77, y: 2020, p: 449 },
  { n: "VDSLR 50mm T1.5 MK2", s: "VDSLR", m: ["E", "EF", "F", "RF", "Z", "L", "M43", "X"], f: 50, a: 1.5, t: true, d: 74.8, l: 103.5, w: 580, fl: 77, y: 2020, p: 449 },
  { n: "VDSLR 85mm T1.5 MK2", s: "VDSLR", m: ["E", "EF", "F", "RF", "Z", "L", "M43", "X"], f: 85, a: 1.5, t: true, d: 78, l: 102.3, w: 540, fl: 72, y: 2020, p: 349 },
  { n: "XEEN CF 24mm T1.5", s: "XEEN CF", m: ["PL", "EF", "E"], f: 24, a: 1.5, t: true, d: 95, l: 82, w: 750, y: 2019, p: 1995 },
  { n: "XEEN CF 50mm T1.5", s: "XEEN CF", m: ["PL", "EF", "E"], f: 50, a: 1.5, t: true, d: 95, l: 82, w: 750, y: 2019, p: 1995 },
  { n: "XEEN CF 85mm T1.5", s: "XEEN CF", m: ["PL", "EF", "E"], f: 85, a: 1.5, t: true, d: 95, l: 82, w: 750, y: 2019, p: 1995 },
]);
