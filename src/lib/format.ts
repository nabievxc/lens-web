import type { Category, Lens } from "@/types/lens";
import { BRANDS } from "@/data/brands";

export function focalLabel(l: Lens): string {
  return l.focalMin === l.focalMax ? `${l.focalMin}mm` : `${l.focalMin}-${l.focalMax}mm`;
}

export function apertureLabel(l: Lens): string {
  return l.tStop ? `T${l.apertureMax}` : `f/${l.apertureMax}`;
}

export function fullName(l: Lens): string {
  return `${BRANDS[l.brand].name} ${l.name}`;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  wide: "Wide angle",
  standard: "Standard",
  tele: "Telephoto",
  macro: "Macro",
  fisheye: "Fisheye",
  anamorphic: "Anamorphic",
  cine: "Cine",
  prime: "Prime",
  zoom: "Zoom",
};

export const CATEGORY_ORDER: Category[] = [
  "wide",
  "standard",
  "tele",
  "macro",
  "fisheye",
  "anamorphic",
  "cine",
  "prime",
  "zoom",
];

export function formatPrice(p?: number): string {
  return p ? `$${p.toLocaleString("en-US")}` : "—";
}
