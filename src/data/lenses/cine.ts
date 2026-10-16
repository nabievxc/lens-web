import { defineLenses } from "./define";

export const voigtlander = defineLenses("voigtlander", { m: ["E"], fmt: "FF", af: false }, [
  { n: "HELIAR-HYPER WIDE 10mm F5.6 Aspherical", f: 10, a: 5.6, d: 67.8, l: 53.9, w: 252, y: 2016, p: 1099 },
  { n: "ULTRON 21mm F1.8 Aspherical", m: ["E"], f: 21, a: 1.8, d: 69.4, l: 78.5, w: 432, fl: 62, y: 2023, p: 899 },
  { n: "NOKTON 21mm F1.4 Aspherical", f: 21, a: 1.4, d: 69.4, l: 76.8, w: 430, fl: 62, y: 2020, p: 1099 },
  { n: "NOKTON 35mm F1.2 Aspherical SE", m: ["E", "Z"], f: 35, a: 1.2, d: 67.7, l: 50.8, w: 343, fl: 52, y: 2022, p: 749, col: "silver" },
  { n: "NOKTON 40mm F1.2 Aspherical", m: ["E", "Z", "RF"], f: 40, a: 1.2, d: 70.1, l: 59.3, w: 420, fl: 58, y: 2018, p: 899 },
  { n: "NOKTON 50mm F1.0 Aspherical", m: ["E", "Z", "RF"], f: 50, a: 1, d: 74.9, l: 68.3, w: 575, fl: 62, y: 2022, p: 1199, col: "silver" },
  { n: "APO-LANTHAR 50mm F2 Aspherical", m: ["E", "Z", "RF"], f: 50, a: 2, d: 62.6, l: 61.7, w: 364, fl: 49, y: 2019, p: 999, col: "silver" },
  { n: "APO-LANTHAR 65mm F2 Macro", m: ["E"], f: 65, a: 2, d: 78, l: 91.1, w: 625, fl: 67, y: 2017, p: 999, c: ["macro"] },
  { n: "APO-LANTHAR 110mm F2.5 Macro", m: ["E", "Z"], f: 110, a: 2.5, d: 78.4, l: 99.7, w: 770, fl: 62, y: 2020, p: 1149, c: ["macro"] },
  { n: "NOKTON 23mm F1.2 Aspherical", m: ["X", "E", "Z"], fmt: "APS-C", f: 23, a: 1.2, d: 66.4, l: 39.8, w: 210, fl: 46, y: 2022, p: 649, col: "silver" },
  { n: "NOKTON 25mm F0.95 Type II", m: ["M43"], fmt: "M43", f: 25, a: 0.95, d: 58.6, l: 70, w: 410, fl: 52, y: 2014, p: 799, col: "silver" },
  { n: "NOKTON 10.5mm F0.95", m: ["M43"], fmt: "M43", f: 10.5, a: 0.95, d: 77, l: 82, w: 585, fl: 72, y: 2015, p: 1099, col: "silver" },
]);

export const zeiss = defineLenses("zeiss", { m: ["E"], fmt: "FF", af: true }, [
  { n: "Batis 18mm f/2.8", s: "Batis", f: 18, a: 2.8, d: 100, l: 95, w: 330, fl: 77, y: 2016, p: 1499 },
  { n: "Batis 25mm f/2", s: "Batis", f: 25, a: 2, d: 92, l: 78, w: 335, fl: 67, y: 2015, p: 1299 },
  { n: "Batis 40mm f/2 CF", s: "Batis", f: 40, a: 2, d: 91, l: 93, w: 361, fl: 67, y: 2018, p: 1299 },
  { n: "Batis 85mm f/1.8", s: "Batis", f: 85, a: 1.8, d: 92, l: 105, w: 475, fl: 67, y: 2015, p: 1199 },
  { n: "Batis 135mm f/2.8", s: "Batis", f: 135, a: 2.8, d: 98, l: 120, w: 614, fl: 67, y: 2017, p: 1899 },
  { n: "Loxia 21mm f/2.8", s: "Loxia", af: false, f: 21, a: 2.8, d: 62, l: 72, w: 394, fl: 52, y: 2015, p: 1499 },
  { n: "Loxia 35mm f/2", s: "Loxia", af: false, f: 35, a: 2, d: 62, l: 66, w: 340, fl: 52, y: 2014, p: 1299 },
  { n: "Loxia 50mm f/2", s: "Loxia", af: false, f: 50, a: 2, d: 62, l: 59, w: 320, fl: 52, y: 2014, p: 949 },
  { n: "Loxia 85mm f/2.4", s: "Loxia", af: false, f: 85, a: 2.4, d: 62, l: 108, w: 594, fl: 52, y: 2016, p: 1299 },
  { n: "Otus 55mm f/1.4", s: "Otus", m: ["EF", "F"], af: false, f: 55, a: 1.4, d: 92.4, l: 141, w: 970, fl: 77, y: 2013, p: 3990 },
  { n: "CP.3 15mm T2.9", s: "CP.3", m: ["PL", "EF", "E"], f: 15, a: 2.9, t: true, d: 95, l: 92, w: 990, y: 2017, p: 4990 },
  { n: "CP.3 25mm T2.1", s: "CP.3", m: ["PL", "EF", "E"], f: 25, a: 2.1, t: true, d: 95, l: 92, w: 800, y: 2017, p: 4490 },
  { n: "CP.3 35mm T2.1", s: "CP.3", m: ["PL", "EF", "E"], f: 35, a: 2.1, t: true, d: 95, l: 92, w: 820, y: 2017, p: 4490 },
  { n: "CP.3 50mm T2.1", s: "CP.3", m: ["PL", "EF", "E"], f: 50, a: 2.1, t: true, d: 95, l: 92, w: 800, y: 2017, p: 4490 },
  { n: "CP.3 85mm T2.1", s: "CP.3", m: ["PL", "EF", "E"], f: 85, a: 2.1, t: true, d: 95, l: 92, w: 880, y: 2017, p: 4490 },
  { n: "CP.3 135mm T2.1", s: "CP.3", m: ["PL", "EF", "E"], f: 135, a: 2.1, t: true, d: 95, l: 133, w: 1270, y: 2017, p: 4990 },
  { n: "Supreme Prime 21mm T1.5", s: "Supreme", m: ["PL"], f: 21, a: 1.5, t: true, d: 95, l: 140, w: 1500, y: 2018, p: 19400 },
  { n: "Supreme Prime 35mm T1.5", s: "Supreme", m: ["PL"], f: 35, a: 1.5, t: true, d: 95, l: 126, w: 1300, y: 2018, p: 19400 },
  { n: "Supreme Prime 50mm T1.5", s: "Supreme", m: ["PL"], f: 50, a: 1.5, t: true, d: 95, l: 126, w: 1300, y: 2018, p: 19400 },
  { n: "Supreme Prime 85mm T1.5", s: "Supreme", m: ["PL"], f: 85, a: 1.5, t: true, d: 95, l: 140, w: 1600, y: 2018, p: 19400 },
  { n: "Nano Prime 35mm T1.5", s: "Nano Prime", m: ["E"], f: 35, a: 1.5, t: true, d: 95, l: 102, w: 1100, y: 2024, p: 5990 },
  { n: "Nano Prime 50mm T1.5", s: "Nano Prime", m: ["E"], f: 50, a: 1.5, t: true, d: 95, l: 102, w: 1100, y: 2024, p: 5990 },
]);

export const dzofilm = defineLenses("dzofilm", { m: ["PL", "EF"], fmt: "FF", af: false }, [
  { n: "Pictor 12-25mm T2.8 S35 Zoom", s: "Pictor", m: ["PL", "EF"], fmt: "S35", f: [12, 25], a: 2.8, t: true, d: 95, l: 172, w: 1630, y: 2021, p: 3999 },
  { n: "Pictor 20-55mm T2.8 S35 Zoom", s: "Pictor", fmt: "S35", f: [20, 55], a: 2.8, t: true, d: 95, l: 210, w: 1910, y: 2020, p: 3999 },
  { n: "Pictor 50-125mm T2.8 S35 Zoom", s: "Pictor", fmt: "S35", f: [50, 125], a: 2.8, t: true, d: 95, l: 232, w: 2080, y: 2020, p: 3999 },
  { n: "Catta 35-80mm T2.9 FF Zoom", s: "Catta", m: ["E", "L", "RF", "Z"], f: [35, 80], a: 2.9, t: true, d: 80, l: 138, w: 1250, y: 2022, p: 2999 },
  { n: "Catta 70-135mm T2.9 FF Zoom", s: "Catta", m: ["E", "L", "RF", "Z"], f: [70, 135], a: 2.9, t: true, d: 80, l: 170, w: 1450, y: 2022, p: 2999 },
  { n: "Catta Ace 18-35mm T2.9", s: "Catta Ace", m: ["PL", "EF"], f: [18, 35], a: 2.9, t: true, d: 95, l: 158, w: 1900, y: 2023, p: 3499 },
  { n: "Vespid 16mm T2.8", s: "Vespid", f: 16, a: 2.8, t: true, d: 80, l: 99, w: 960, y: 2020, p: 1299 },
  { n: "Vespid 25mm T2.1", s: "Vespid", f: 25, a: 2.1, t: true, d: 80, l: 99, w: 930, y: 2020, p: 1299 },
  { n: "Vespid 35mm T2.1", s: "Vespid", f: 35, a: 2.1, t: true, d: 80, l: 99, w: 900, y: 2020, p: 1299 },
  { n: "Vespid 50mm T2.1", s: "Vespid", f: 50, a: 2.1, t: true, d: 80, l: 99, w: 880, y: 2020, p: 1299 },
  { n: "Vespid 75mm T2.1", s: "Vespid", f: 75, a: 2.1, t: true, d: 80, l: 99, w: 870, y: 2020, p: 1299 },
  { n: "Vespid 100mm T2.1", s: "Vespid", f: 100, a: 2.1, t: true, d: 80, l: 115, w: 1050, y: 2020, p: 1299 },
  { n: "Vespid 90mm T2.8 Macro", s: "Vespid", f: 90, a: 2.8, t: true, d: 80, l: 126, w: 1150, y: 2021, p: 1499, c: ["macro"] },
  { n: "Pavo 2x 32mm T2.1 Anamorphic", s: "Pavo", m: ["PL", "EF"], fmt: "S35", f: 32, a: 2.1, t: true, sq: 2, d: 95, l: 165, w: 2200, y: 2022, p: 5999, c: ["anamorphic"] },
  { n: "Pavo 2x 40mm T2.1 Anamorphic", s: "Pavo", m: ["PL", "EF"], fmt: "S35", f: 40, a: 2.1, t: true, sq: 2, d: 95, l: 165, w: 2150, y: 2022, p: 5999, c: ["anamorphic"] },
  { n: "Pavo 2x 75mm T2.1 Anamorphic", s: "Pavo", m: ["PL", "EF"], fmt: "S35", f: 75, a: 2.1, t: true, sq: 2, d: 95, l: 165, w: 2250, y: 2022, p: 5999, c: ["anamorphic"] },
  { n: "Pavo 2x 100mm T2.4 Anamorphic", s: "Pavo", m: ["PL", "EF"], fmt: "S35", f: 100, a: 2.4, t: true, sq: 2, d: 95, l: 185, w: 2450, y: 2022, p: 5999, c: ["anamorphic"] },
  { n: "Gnosis 65mm T2.8 Macro", s: "Gnosis", f: 65, a: 2.8, t: true, d: 95, l: 120, w: 1470, y: 2023, p: 2499, c: ["macro"] },
]);

export const meike = defineLenses("meike", { m: ["E", "RF", "L", "M43", "X"], fmt: "S35", af: false }, [
  { n: "S35 16mm T2.2 Cine", s: "S35 Prime", f: 16, a: 2.2, t: true, d: 80, l: 87, w: 690, y: 2021, p: 649 },
  { n: "S35 25mm T2.2 Cine", s: "S35 Prime", f: 25, a: 2.2, t: true, d: 80, l: 87, w: 670, y: 2021, p: 649 },
  { n: "S35 35mm T2.1 Cine", s: "S35 Prime", f: 35, a: 2.1, t: true, d: 80, l: 87, w: 660, y: 2021, p: 649 },
  { n: "S35 50mm T2.1 Cine", s: "S35 Prime", f: 50, a: 2.1, t: true, d: 80, l: 87, w: 650, y: 2021, p: 649 },
  { n: "S35 75mm T2.1 Cine", s: "S35 Prime", f: 75, a: 2.1, t: true, d: 80, l: 87, w: 680, y: 2021, p: 649 },
  { n: "FF Prime 24mm T2.1 Cine", s: "FF Prime", m: ["PL", "EF", "E", "L", "RF"], fmt: "FF", f: 24, a: 2.1, t: true, d: 95, l: 117, w: 1350, y: 2022, p: 1199 },
  { n: "FF Prime 50mm T2.1 Cine", s: "FF Prime", m: ["PL", "EF", "E", "L", "RF"], fmt: "FF", f: 50, a: 2.1, t: true, d: 95, l: 117, w: 1350, y: 2022, p: 1199 },
  { n: "FF Prime 85mm T2.1 Cine", s: "FF Prime", m: ["PL", "EF", "E", "L", "RF"], fmt: "FF", f: 85, a: 2.1, t: true, d: 95, l: 117, w: 1450, y: 2022, p: 1199 },
  { n: "AF 55mm F1.4 Pro", m: ["E", "X", "Z"], fmt: "APS-C", af: true, f: 55, a: 1.4, d: 68, l: 74, w: 300, fl: 55, y: 2023, p: 249 },
  { n: "AF 85mm F1.8 Pro", m: ["E", "Z", "X"], fmt: "FF", af: true, f: 85, a: 1.8, d: 74, l: 91, w: 438, fl: 62, y: 2023, p: 299 },
]);

export const atlas = defineLenses("atlas", { m: ["PL", "EF"], fmt: "FF", af: false }, [
  { n: "Orion 32mm T2 2x Anamorphic", s: "Orion", f: 32, a: 2, t: true, sq: 2, d: 95, l: 178, w: 2268, y: 2018, p: 14990, c: ["anamorphic"] },
  { n: "Orion 40mm T2 2x Anamorphic", s: "Orion", f: 40, a: 2, t: true, sq: 2, d: 95, l: 178, w: 2268, y: 2017, p: 14990, c: ["anamorphic"] },
  { n: "Orion 50mm T2 2x Anamorphic", s: "Orion", f: 50, a: 2, t: true, sq: 2, d: 95, l: 178, w: 2268, y: 2017, p: 14990, c: ["anamorphic"] },
  { n: "Orion 65mm T2 2x Anamorphic", s: "Orion", f: 65, a: 2, t: true, sq: 2, d: 95, l: 178, w: 2268, y: 2017, p: 14990, c: ["anamorphic"] },
  { n: "Orion 100mm T2 2x Anamorphic", s: "Orion", f: 100, a: 2, t: true, sq: 2, d: 95, l: 200, w: 2700, y: 2018, p: 14990, c: ["anamorphic"] },
  { n: "Mercury 36mm T2.2 1.5x Anamorphic", s: "Mercury", f: 36, a: 2.2, t: true, sq: 1.5, d: 95, l: 155, w: 1700, y: 2022, p: 9990, c: ["anamorphic"] },
  { n: "Mercury 54mm T2.2 1.5x Anamorphic", s: "Mercury", f: 54, a: 2.2, t: true, sq: 1.5, d: 95, l: 155, w: 1700, y: 2022, p: 9990, c: ["anamorphic"] },
  { n: "Mercury 72mm T2.2 1.5x Anamorphic", s: "Mercury", f: 72, a: 2.2, t: true, sq: 1.5, d: 95, l: 155, w: 1700, y: 2022, p: 9990, c: ["anamorphic"] },
]);

export const blazar = defineLenses("blazar", { m: ["E", "Z", "RF", "L", "X", "M43"], fmt: "FF", af: false }, [
  { n: "Remus 33mm T2 1.5x Anamorphic", s: "Remus", f: 33, a: 2, t: true, sq: 1.5, d: 75, l: 120, w: 630, fl: 67, y: 2022, p: 1299, c: ["anamorphic"] },
  { n: "Remus 45mm T2 1.5x Anamorphic", s: "Remus", f: 45, a: 2, t: true, sq: 1.5, d: 75, l: 120, w: 640, fl: 67, y: 2022, p: 1299, c: ["anamorphic"] },
  { n: "Remus 65mm T2 1.5x Anamorphic", s: "Remus", f: 65, a: 2, t: true, sq: 1.5, d: 75, l: 120, w: 660, fl: 67, y: 2022, p: 1299, c: ["anamorphic"] },
  { n: "Cato 2x 40mm T2.8 Anamorphic", s: "Cato", f: 40, a: 2.8, t: true, sq: 2, d: 80, l: 132, w: 900, y: 2024, p: 1599, c: ["anamorphic"] },
  { n: "Cato 2x 75mm T2.8 Anamorphic", s: "Cato", f: 75, a: 2.8, t: true, sq: 2, d: 80, l: 132, w: 920, y: 2024, p: 1599, c: ["anamorphic"] },
]);
