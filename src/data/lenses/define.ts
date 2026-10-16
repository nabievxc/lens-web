import type {
  BrandId,
  Category,
  Format,
  Lens,
  LensColor,
  MountId,
} from "@/types/lens";

/**
 * Compact authoring format. Short keys keep the per-brand files readable
 * with hundreds of entries.
 */
export interface LensInput {
  /** Model name without the brand. */
  n: string;
  /** Focal length, or [wide, tele] for zooms. */
  f: number | [number, number];
  /** Maximum aperture (f-number, or T-stop when `t` is set). */
  a: number;
  /** Minimum aperture. */
  aMin?: number;
  t?: boolean;
  /** Diameter x length in mm, weight in g. */
  d: number;
  l: number;
  w: number;
  fl?: number;
  m?: MountId[];
  fmt?: Format;
  af?: boolean;
  y?: number;
  p?: number;
  s?: string;
  c?: Category[];
  b?: number;
  mf?: number;
  col?: LensColor;
  sq?: number;
  /** Extending zoom: `true` for a typical extension, or the mm amount. */
  ext?: boolean | number;
  ar?: boolean;
}

interface BrandDefaults {
  m: MountId[];
  fmt: Format;
  af: boolean;
  ar?: boolean;
}

const CROP: Record<Format, number> = {
  FF: 1,
  "APS-C": 1.5,
  S35: 1.5,
  M43: 2,
  MF: 0.79,
};

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/\./g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function deriveCategories(
  min: number,
  max: number,
  fmt: Format,
  extra: Category[],
): Category[] {
  const crop = CROP[fmt];
  const eqMin = min * crop;
  const eqMax = max * crop;
  const cats = new Set<Category>(extra);
  cats.add(min === max ? "prime" : "zoom");
  if (eqMin < 35) cats.add("wide");
  if (eqMin <= 70 && eqMax >= 35) cats.add("standard");
  if (eqMax >= 85) cats.add("tele");
  return [...cats];
}

export function defineLenses(
  brand: BrandId,
  defaults: BrandDefaults,
  inputs: LensInput[],
): Lens[] {
  return inputs.map((i) => {
    const [focalMin, focalMax] = Array.isArray(i.f) ? i.f : [i.f, i.f];
    const fmt = i.fmt ?? defaults.fmt;
    const extra = i.c ?? [];
    const cine = extra.includes("cine") || !!i.t;
    const categories = deriveCategories(
      focalMin,
      focalMax,
      fmt,
      cine && !extra.includes("cine") ? [...extra, "cine"] : extra,
    );
    const extension =
      i.ext === true ? Math.round(i.l * 0.32) : typeof i.ext === "number" ? i.ext : 0;

    return {
      slug: slugify(`${brand} ${i.n}`),
      brand,
      name: i.n,
      series: i.s,
      mounts: i.m ?? defaults.m,
      format: fmt,
      categories,
      focalMin,
      focalMax,
      apertureMax: i.a,
      apertureMin: i.aMin ?? (cine ? 22 : focalMax >= 300 ? 32 : 22),
      tStop: !!i.t,
      squeeze: i.sq,
      autofocus: i.af ?? (cine ? false : defaults.af),
      diameterMm: i.d,
      lengthMm: i.l,
      weightG: i.w,
      filterMm: i.fl,
      bladeCount: i.b ?? (cine ? 11 : 9),
      minFocusM: i.mf,
      color: i.col ?? "black",
      hasApertureRing: i.ar ?? (cine || !(i.af ?? defaults.af) ? true : !!defaults.ar),
      extensionMm: extension,
      year: i.y,
      priceUsd: i.p,
    };
  });
}
