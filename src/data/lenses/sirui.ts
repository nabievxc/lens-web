import { defineLenses } from "./define";

const ALL_MIRRORLESS = ["E", "Z", "RF", "L", "X"] as const;

export const sirui = defineLenses("sirui", { m: [...ALL_MIRRORLESS], fmt: "FF", af: false }, [
  // 1.33x APS-C anamorphic
  { n: "24mm F2.8 1.33x Anamorphic", s: "APS-C Anamorphic", m: ["E", "X", "Z", "RF", "M43", "L"], fmt: "APS-C", f: 24, a: 2.8, sq: 1.33, d: 65, l: 85, w: 420, fl: 67, y: 2021, p: 649, c: ["anamorphic"] },
  { n: "35mm F1.8 1.33x Anamorphic", s: "APS-C Anamorphic", m: ["E", "X", "Z", "RF", "M43", "L"], fmt: "APS-C", f: 35, a: 1.8, sq: 1.33, d: 65, l: 85, w: 450, fl: 67, y: 2020, p: 699, c: ["anamorphic"] },
  { n: "50mm F1.8 1.33x Anamorphic", s: "APS-C Anamorphic", m: ["E", "X", "Z", "RF", "M43", "L"], fmt: "APS-C", f: 50, a: 1.8, sq: 1.33, d: 65, l: 85, w: 450, fl: 67, y: 2020, p: 649, c: ["anamorphic"] },
  { n: "75mm F1.8 1.33x Anamorphic", s: "APS-C Anamorphic", m: ["E", "X", "Z", "RF", "M43", "L"], fmt: "APS-C", f: 75, a: 1.8, sq: 1.33, d: 65, l: 85, w: 475, fl: 67, y: 2021, p: 699, c: ["anamorphic"] },
  // 1.6x full frame anamorphic (Venus)
  { n: "Venus 35mm T2.9 1.6x Full-Frame Anamorphic", s: "Venus", m: ["E", "Z", "RF", "L"], f: 35, a: 2.9, t: true, sq: 1.6, d: 80, l: 141, w: 1020, fl: 77, y: 2022, p: 1099, c: ["anamorphic"] },
  { n: "Venus 50mm T2.9 1.6x Full-Frame Anamorphic", s: "Venus", m: ["E", "Z", "RF", "L"], f: 50, a: 2.9, t: true, sq: 1.6, d: 80, l: 132, w: 935, fl: 77, y: 2022, p: 1099, c: ["anamorphic"] },
  { n: "Venus 75mm T2.9 1.6x Full-Frame Anamorphic", s: "Venus", m: ["E", "Z", "RF", "L"], f: 75, a: 2.9, t: true, sq: 1.6, d: 80, l: 132, w: 935, fl: 77, y: 2022, p: 1099, c: ["anamorphic"] },
  { n: "Venus 100mm T2.9 1.6x Full-Frame Anamorphic", s: "Venus", m: ["E", "Z", "RF", "L"], f: 100, a: 2.9, t: true, sq: 1.6, d: 80, l: 145, w: 1030, fl: 77, y: 2022, p: 1199, c: ["anamorphic"] },
  { n: "Venus 150mm T2.9 1.6x Full-Frame Anamorphic", s: "Venus", m: ["E", "Z", "RF", "L"], f: 150, a: 2.9, t: true, sq: 1.6, d: 80, l: 163, w: 1200, fl: 77, y: 2023, p: 1299, c: ["anamorphic"] },
  // Saturn carbon fiber 1.6x
  { n: "Saturn 35mm T2.9 1.6x Carbon Fiber Anamorphic", s: "Saturn", m: ["E", "Z", "RF", "L"], f: 35, a: 2.9, t: true, sq: 1.6, d: 80, l: 120, w: 740, y: 2023, p: 1299, c: ["anamorphic"] },
  { n: "Saturn 50mm T2.9 1.6x Carbon Fiber Anamorphic", s: "Saturn", m: ["E", "Z", "RF", "L"], f: 50, a: 2.9, t: true, sq: 1.6, d: 80, l: 120, w: 750, y: 2023, p: 1299, c: ["anamorphic"] },
  { n: "Saturn 75mm T2.9 1.6x Carbon Fiber Anamorphic", s: "Saturn", m: ["E", "Z", "RF", "L"], f: 75, a: 2.9, t: true, sq: 1.6, d: 80, l: 120, w: 770, y: 2023, p: 1299, c: ["anamorphic"] },
  // Jupiter macro cine
  { n: "Jupiter 24mm T2 Full-Frame Macro Cine", s: "Jupiter", m: ["PL", "EF"], f: 24, a: 2, t: true, d: 80, l: 110, w: 980, y: 2023, p: 599, c: ["macro"] },
  { n: "Jupiter 35mm T2 Full-Frame Macro Cine", s: "Jupiter", m: ["PL", "EF"], f: 35, a: 2, t: true, d: 80, l: 110, w: 960, y: 2023, p: 599, c: ["macro"] },
  { n: "Jupiter 50mm T2 Full-Frame Macro Cine", s: "Jupiter", m: ["PL", "EF"], f: 50, a: 2, t: true, d: 80, l: 110, w: 950, y: 2023, p: 599, c: ["macro"] },
  { n: "Jupiter 85mm T2 Full-Frame Macro Cine", s: "Jupiter", m: ["PL", "EF"], f: 85, a: 2, t: true, d: 80, l: 125, w: 1050, y: 2023, p: 599, c: ["macro"] },
  // Nightwalker S35 cine
  { n: "Nightwalker 24mm T1.2 S35 Cine", s: "Nightwalker", m: ["E", "X", "RF", "L", "M43"], fmt: "S35", f: 24, a: 1.2, t: true, d: 65, l: 72, w: 460, fl: 58, y: 2022, p: 449 },
  { n: "Nightwalker 35mm T1.2 S35 Cine", s: "Nightwalker", m: ["E", "X", "RF", "L", "M43"], fmt: "S35", f: 35, a: 1.2, t: true, d: 65, l: 72, w: 470, fl: 58, y: 2022, p: 449 },
  { n: "Nightwalker 55mm T1.2 S35 Cine", s: "Nightwalker", m: ["E", "X", "RF", "L", "M43"], fmt: "S35", f: 55, a: 1.2, t: true, d: 65, l: 72, w: 480, fl: 58, y: 2022, p: 449 },
  { n: "Nightwalker 75mm T1.2 S35 Cine", s: "Nightwalker", m: ["E", "X", "RF", "L", "M43"], fmt: "S35", f: 75, a: 1.2, t: true, d: 65, l: 80, w: 520, fl: 58, y: 2023, p: 499 },
  // AF photo
  { n: "Sniper 23mm F1.2 AF", s: "Sniper", m: ["E", "X", "Z"], fmt: "APS-C", af: true, f: 23, a: 1.2, d: 70, l: 74, w: 300, fl: 52, y: 2023, p: 329, b: 11 },
  { n: "Sniper 33mm F1.2 AF", s: "Sniper", m: ["E", "X", "Z"], fmt: "APS-C", af: true, f: 33, a: 1.2, d: 70, l: 74, w: 300, fl: 52, y: 2023, p: 329, b: 11 },
  { n: "Sniper 56mm F1.2 AF", s: "Sniper", m: ["E", "X", "Z"], fmt: "APS-C", af: true, f: 56, a: 1.2, d: 70, l: 74, w: 320, fl: 52, y: 2023, p: 329, b: 11 },
  { n: "Aurora 85mm F1.4 AF", s: "Aurora", m: ["E", "Z", "X"], af: true, f: 85, a: 1.4, d: 75, l: 92, w: 440, fl: 67, y: 2024, p: 399, b: 11 },
]);
