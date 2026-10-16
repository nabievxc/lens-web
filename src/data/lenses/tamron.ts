import { defineLenses } from "./define";

export const tamron = defineLenses("tamron", { m: ["E"], fmt: "FF", af: true }, [
  { n: "17-28mm F/2.8 Di III RXD", f: [17, 28], a: 2.8, d: 73, l: 99, w: 420, fl: 67, y: 2019, p: 899, ext: 10 },
  { n: "20-40mm F/2.8 Di III VXD", f: [20, 40], a: 2.8, d: 74.4, l: 86.5, w: 365, fl: 67, y: 2022, p: 739, ext: 12 },
  { n: "17-50mm F/4 Di III VXD", f: [17, 50], a: 4, d: 74.8, l: 114.4, w: 460, fl: 67, y: 2023, p: 599, ext: true },
  { n: "28-75mm F/2.8 Di III VXD G2", s: "G2", m: ["E", "Z"], f: [28, 75], a: 2.8, d: 75.8, l: 117.6, w: 540, fl: 67, y: 2021, p: 879, ext: true },
  { n: "28-200mm F/2.8-5.6 Di III RXD", f: [28, 200], a: 2.8, d: 74, l: 117, w: 575, fl: 67, y: 2020, p: 729, ext: 60 },
  { n: "28-300mm F/4-7.1 Di III VC VXD", f: [28, 300], a: 4, d: 75, l: 126, w: 610, fl: 67, y: 2023, p: 899, ext: 70 },
  { n: "35-150mm F/2-2.8 Di III VXD", m: ["E", "Z"], f: [35, 150], a: 2, d: 89.2, l: 158, w: 1165, fl: 82, y: 2021, p: 1899, ext: 40 },
  { n: "70-180mm F/2.8 Di III VXD G2", s: "G2", f: [70, 180], a: 2.8, d: 83, l: 156.5, w: 855, fl: 67, y: 2023, p: 1299, ext: 45 },
  { n: "50-400mm F/4.5-6.3 Di III VC VXD", m: ["E", "Z"], f: [50, 400], a: 4.5, d: 88.5, l: 183.4, w: 1155, fl: 67, y: 2022, p: 1299, ext: 70 },
  { n: "150-500mm F/5-6.7 Di III VC VXD", m: ["E", "X", "Z"], f: [150, 500], a: 5, d: 93, l: 209.6, w: 1725, fl: 82, y: 2021, p: 1399, ext: 80 },
  { n: "70-300mm F/4.5-6.3 Di III RXD", m: ["E", "Z"], f: [70, 300], a: 4.5, d: 77, l: 148, w: 545, fl: 67, y: 2020, p: 549, ext: 60 },
  { n: "20mm F/2.8 Di III OSD M1:2", f: 20, a: 2.8, d: 73, l: 64, w: 220, fl: 67, y: 2019, p: 349, c: ["macro"], b: 7 },
  { n: "24mm F/2.8 Di III OSD M1:2", f: 24, a: 2.8, d: 73, l: 64, w: 215, fl: 67, y: 2019, p: 349, c: ["macro"], b: 7 },
  { n: "35mm F/2.8 Di III OSD M1:2", f: 35, a: 2.8, d: 73, l: 64, w: 210, fl: 67, y: 2019, p: 349, c: ["macro"], b: 7 },
  { n: "90mm F/2.8 Di III Macro VXD", m: ["E", "Z"], f: 90, a: 2.8, d: 73, l: 126.5, w: 630, fl: 67, y: 2025, p: 699, c: ["macro"] },
  { n: "11-20mm F/2.8 Di III-A RXD", m: ["E", "X"], fmt: "APS-C", f: [11, 20], a: 2.8, d: 73, l: 86.2, w: 335, fl: 67, y: 2021, p: 729 },
  { n: "17-70mm F/2.8 Di III-A VC RXD", m: ["E", "X"], fmt: "APS-C", f: [17, 70], a: 2.8, d: 74.6, l: 119.3, w: 525, fl: 67, y: 2021, p: 799, ext: true },
  { n: "18-300mm F/3.5-6.3 Di III-A VC VXD", m: ["E", "X"], fmt: "APS-C", f: [18, 300], a: 3.5, d: 75.5, l: 125.8, w: 620, fl: 67, y: 2021, p: 699, ext: 80 },
  { n: "SP 150-600mm F/5-6.3 Di VC USD G2", s: "SP", m: ["EF", "F"], f: [150, 600], a: 5, d: 108.4, l: 260.2, w: 2010, fl: 95, y: 2016, p: 1399, ext: 80 },
]);
