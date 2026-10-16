export type MountId =
  | "E"
  | "Z"
  | "RF"
  | "L"
  | "X"
  | "M43"
  | "EF"
  | "F"
  | "PL"
  | "GFX";

export type BrandId =
  | "sony"
  | "canon"
  | "nikon"
  | "fujifilm"
  | "panasonic"
  | "om-system"
  | "sigma"
  | "tamron"
  | "samyang"
  | "viltrox"
  | "sirui"
  | "7artisans"
  | "ttartisan"
  | "laowa"
  | "voigtlander"
  | "zeiss"
  | "dzofilm"
  | "meike"
  | "atlas"
  | "blazar";

export type Category =
  | "wide"
  | "standard"
  | "tele"
  | "macro"
  | "fisheye"
  | "anamorphic"
  | "cine"
  | "prime"
  | "zoom";

export type Format = "FF" | "APS-C" | "M43" | "MF" | "S35";

export type LensColor = "black" | "white" | "silver";

export interface Lens {
  slug: string;
  brand: BrandId;
  name: string;
  series?: string;
  mounts: MountId[];
  format: Format;
  categories: Category[];
  focalMin: number;
  focalMax: number;
  apertureMax: number;
  apertureMin: number;
  /** Cine lenses are rated in T-stops instead of f-stops. */
  tStop: boolean;
  /** Anamorphic squeeze factor, e.g. 1.33, 1.6, 1.8, 2. */
  squeeze?: number;
  autofocus: boolean;
  diameterMm: number;
  lengthMm: number;
  weightG: number;
  filterMm?: number;
  bladeCount: number;
  minFocusM?: number;
  color: LensColor;
  hasApertureRing: boolean;
  /** Barrel extension at the long end, in mm. 0 for internal zoom / primes. */
  extensionMm: number;
  year?: number;
  priceUsd?: number;
}
