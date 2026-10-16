import { defineLenses } from "./define";

const MIRRORLESS = ["E", "L"] as const;

export const sigma = defineLenses("sigma", { m: [...MIRRORLESS], fmt: "FF", af: true }, [
  // Art zooms
  { n: "14-24mm F2.8 DG DN | Art", s: "Art", f: [14, 24], a: 2.8, d: 85, l: 131, w: 795, y: 2019, p: 1399 },
  { n: "15mm F1.4 DG DN Diagonal Fisheye | Art", s: "Art", f: 15, a: 1.4, d: 100.4, l: 126.1, w: 745, y: 2024, p: 1899, c: ["fisheye"], ar: true },
  { n: "24-70mm F2.8 DG DN II | Art", s: "Art", f: [24, 70], a: 2.8, d: 87.8, l: 124.9, w: 735, fl: 82, y: 2024, p: 1299, ext: 30 },
  { n: "28-45mm F1.8 DG DN | Art", s: "Art", f: [28, 45], a: 1.8, d: 87.8, l: 150.3, w: 960, fl: 82, y: 2024, p: 1399, ar: true },
  { n: "28-105mm F2.8 DG DN | Art", s: "Art", f: [28, 105], a: 2.8, d: 87.8, l: 157.9, w: 995, fl: 82, y: 2023, p: 1499, ext: 40 },
  { n: "16-28mm F2.8 DG DN | Contemporary", s: "Contemporary", f: [16, 28], a: 2.8, d: 77.2, l: 100.6, w: 450, fl: 72, y: 2022, p: 899 },
  { n: "28-70mm F2.8 DG DN | Contemporary", s: "Contemporary", f: [28, 70], a: 2.8, d: 72.2, l: 101.5, w: 470, fl: 67, y: 2021, p: 769, ext: true },
  { n: "20-200mm F3.5-6.3 DG | Contemporary", s: "Contemporary", f: [20, 200], a: 3.5, d: 77.2, l: 115.5, w: 550, fl: 72, y: 2024, p: 699, ext: 70 },
  { n: "70-200mm F2.8 DG DN OS | Sports", s: "Sports", f: [70, 200], a: 2.8, d: 90.6, l: 205.9, w: 1305, fl: 77, y: 2023, p: 1499 },
  { n: "100-400mm F5-6.3 DG DN OS | Contemporary", s: "Contemporary", f: [100, 400], a: 5, d: 86, l: 197.2, w: 1135, fl: 67, y: 2020, p: 949, ext: 70 },
  { n: "150-600mm F5-6.3 DG DN OS | Sports", s: "Sports", f: [150, 600], a: 5, d: 109.4, l: 263.6, w: 2100, fl: 95, y: 2021, p: 1499, ext: 80 },
  { n: "60-600mm F4.5-6.3 DG DN OS | Sports", s: "Sports", f: [60, 600], a: 4.5, d: 119.4, l: 279.2, w: 2495, fl: 105, y: 2023, p: 1999, ext: 90 },
  { n: "300-600mm F4 DG OS | Sports", s: "Sports", f: [300, 600], a: 4, d: 157.1, l: 469.9, w: 3970, y: 2025, p: 5999 },
  { n: "500mm F5.6 DG DN OS | Sports", s: "Sports", f: 500, a: 5.6, d: 107.6, l: 234.5, w: 1370, fl: 95, y: 2024, p: 2999 },
  // Art primes
  { n: "14mm F1.4 DG DN | Art", s: "Art", f: 14, a: 1.4, d: 101.4, l: 149.9, w: 1170, y: 2023, p: 1599, ar: true },
  { n: "20mm F1.4 DG DN | Art", s: "Art", f: 20, a: 1.4, d: 87.8, l: 111.2, w: 630, y: 2022, p: 899, ar: true },
  { n: "24mm F1.4 DG DN | Art", s: "Art", f: 24, a: 1.4, d: 75.7, l: 97.5, w: 520, fl: 72, y: 2022, p: 849, ar: true },
  { n: "35mm F1.2 DG DN | Art", s: "Art", f: 35, a: 1.2, d: 87.8, l: 136.2, w: 1090, fl: 82, y: 2019, p: 1499, ar: true, b: 11 },
  { n: "35mm F1.4 DG DN | Art", s: "Art", f: 35, a: 1.4, d: 75.5, l: 111.5, w: 645, fl: 67, y: 2021, p: 899, ar: true, b: 11 },
  { n: "50mm F1.2 DG DN | Art", s: "Art", f: 50, a: 1.2, d: 81, l: 108.8, w: 740, fl: 72, y: 2024, p: 1399, ar: true, b: 13 },
  { n: "50mm F1.4 DG DN | Art", s: "Art", f: 50, a: 1.4, d: 78.2, l: 109.5, w: 670, fl: 72, y: 2023, p: 849, ar: true, b: 11 },
  { n: "85mm F1.4 DG DN | Art", s: "Art", f: 85, a: 1.4, d: 82.8, l: 96.1, w: 630, fl: 77, y: 2020, p: 1199, ar: true, b: 11 },
  { n: "105mm F1.4 DG HSM | Art", s: "Art", f: 105, a: 1.4, d: 115.9, l: 133.6, w: 1645, fl: 105, y: 2018, p: 1599, b: 9 },
  { n: "105mm F2.8 DG DN Macro | Art", s: "Art", f: 105, a: 2.8, d: 74, l: 135.5, w: 715, fl: 62, y: 2020, p: 799, c: ["macro"], ar: true },
  { n: "135mm F1.4 DG | Art", s: "Art", f: 135, a: 1.4, d: 106.9, l: 155, w: 1430, fl: 105, y: 2025, p: 1899, ar: true, b: 13 },
  // Contemporary I-series
  { n: "17mm F4 DG DN | Contemporary", s: "I series", f: 17, a: 4, d: 64, l: 48.8, w: 225, fl: 55, y: 2022, p: 549, ar: true, col: "silver", b: 7 },
  { n: "24mm F2 DG DN | Contemporary", s: "I series", f: 24, a: 2, d: 70, l: 72, w: 365, fl: 62, y: 2021, p: 639, ar: true, col: "silver" },
  { n: "35mm F2 DG DN | Contemporary", s: "I series", f: 35, a: 2, d: 70, l: 65.4, w: 325, fl: 58, y: 2020, p: 639, ar: true, col: "silver" },
  { n: "50mm F2 DG DN | Contemporary", s: "I series", f: 50, a: 2, d: 70, l: 70, w: 350, fl: 58, y: 2021, p: 639, ar: true, col: "silver" },
  { n: "65mm F2 DG DN | Contemporary", s: "I series", f: 65, a: 2, d: 72, l: 74.7, w: 405, fl: 62, y: 2020, p: 699, ar: true, col: "silver" },
  { n: "90mm F2.8 DG DN | Contemporary", s: "I series", f: 90, a: 2.8, d: 64, l: 59.7, w: 295, fl: 55, y: 2021, p: 639, ar: true, col: "silver" },
  { n: "56mm F1.4 DC DN | Contemporary", s: "Contemporary", m: ["E", "L", "X", "RF", "Z", "M43"], fmt: "APS-C", f: 56, a: 1.4, d: 66.5, l: 59.5, w: 280, fl: 55, y: 2018, p: 479 },
  { n: "30mm F1.4 DC DN | Contemporary", s: "Contemporary", m: ["E", "L", "X", "RF", "Z", "M43"], fmt: "APS-C", f: 30, a: 1.4, d: 64.8, l: 73.3, w: 265, fl: 52, y: 2016, p: 339 },
  { n: "16mm F1.4 DC DN | Contemporary", s: "Contemporary", m: ["E", "L", "X", "RF", "Z", "M43"], fmt: "APS-C", f: 16, a: 1.4, d: 72.2, l: 92.3, w: 405, fl: 67, y: 2017, p: 449 },
  { n: "23mm F1.4 DC DN | Contemporary", s: "Contemporary", m: ["E", "L", "X", "RF"], fmt: "APS-C", f: 23, a: 1.4, d: 65.8, l: 76.6, w: 285, fl: 55, y: 2021, p: 549 },
  { n: "18-50mm F2.8 DC DN | Contemporary", s: "Contemporary", m: ["E", "L", "X", "RF"], fmt: "APS-C", f: [18, 50], a: 2.8, d: 65.4, l: 74.5, w: 290, fl: 55, y: 2021, p: 549, ext: true },
  { n: "10-18mm F2.8 DC DN | Contemporary", s: "Contemporary", m: ["E", "L", "X", "RF"], fmt: "APS-C", f: [10, 18], a: 2.8, d: 72.2, l: 64.3, w: 260, fl: 67, y: 2023, p: 599, ext: 10 },
  // Cine
  { n: "18-35mm T2 Cine High Speed Zoom", s: "Cine", m: ["PL", "EF", "E"], fmt: "S35", f: [18, 35], a: 2, t: true, d: 95, l: 129.5, w: 1445, y: 2015, p: 3999 },
  { n: "50-100mm T2 Cine High Speed Zoom", s: "Cine", m: ["PL", "EF", "E"], fmt: "S35", f: [50, 100], a: 2, t: true, d: 95, l: 180.5, w: 1880, y: 2015, p: 3999 },
  { n: "24mm T1.5 FF Cine", s: "Cine", m: ["PL", "EF", "E", "L"], f: 24, a: 1.5, t: true, d: 95, l: 106.5, w: 1150, y: 2017, p: 3499 },
  { n: "35mm T1.5 FF Cine", s: "Cine", m: ["PL", "EF", "E", "L"], f: 35, a: 1.5, t: true, d: 95, l: 104.5, w: 1150, y: 2017, p: 3499 },
  { n: "50mm T1.5 FF Cine", s: "Cine", m: ["PL", "EF", "E", "L"], f: 50, a: 1.5, t: true, d: 95, l: 104.5, w: 1225, y: 2017, p: 3499 },
  { n: "85mm T1.5 FF Cine", s: "Cine", m: ["PL", "EF", "E", "L"], f: 85, a: 1.5, t: true, d: 95, l: 104.5, w: 1300, y: 2017, p: 3499 },
  { n: "135mm T2 FF Cine", s: "Cine", m: ["PL", "EF", "E", "L"], f: 135, a: 2, t: true, d: 95, l: 141.5, w: 1600, y: 2017, p: 3999 },
]);
