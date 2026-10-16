import type { BrandId, Category, Format, Lens, MountId } from "@/types/lens";
import { BRANDS } from "@/data/brands";

export type SortKey = "name" | "focal" | "aperture" | "weight" | "price" | "year";
export type FocusFilter = "any" | "af" | "mf";

export interface LensFilters {
  q: string;
  brands: BrandId[];
  mounts: MountId[];
  cats: Category[];
  formats: Format[];
  focus: FocusFilter;
  /** Only lenses at least this fast (f-number / T-stop ≤ value). */
  maxAperture: number | null;
  focalMin: number;
  focalMax: number;
  sort: SortKey;
}

export const FOCAL_LIMITS = { min: 4, max: 1200 } as const;

export const DEFAULT_FILTERS: LensFilters = {
  q: "",
  brands: [],
  mounts: [],
  cats: [],
  formats: [],
  focus: "any",
  maxAperture: null,
  focalMin: FOCAL_LIMITS.min,
  focalMax: FOCAL_LIMITS.max,
  sort: "name",
};

const list = <T extends string>(v: string | null): T[] => (v ? (v.split(",").filter(Boolean) as T[]) : []);

export function filtersFromParams(p: URLSearchParams): LensFilters {
  return {
    q: p.get("q") ?? "",
    brands: list<BrandId>(p.get("brand")),
    mounts: list<MountId>(p.get("mount")),
    cats: list<Category>(p.get("cat")),
    formats: list<Format>(p.get("fmt")),
    focus: (p.get("focus") as FocusFilter) ?? "any",
    maxAperture: p.get("ap") ? Number(p.get("ap")) : null,
    focalMin: p.get("fmin") ? Number(p.get("fmin")) : FOCAL_LIMITS.min,
    focalMax: p.get("fmax") ? Number(p.get("fmax")) : FOCAL_LIMITS.max,
    sort: (p.get("sort") as SortKey) ?? "name",
  };
}

export function filtersToParams(f: LensFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.brands.length) p.set("brand", f.brands.join(","));
  if (f.mounts.length) p.set("mount", f.mounts.join(","));
  if (f.cats.length) p.set("cat", f.cats.join(","));
  if (f.formats.length) p.set("fmt", f.formats.join(","));
  if (f.focus !== "any") p.set("focus", f.focus);
  if (f.maxAperture) p.set("ap", String(f.maxAperture));
  if (f.focalMin > FOCAL_LIMITS.min) p.set("fmin", String(f.focalMin));
  if (f.focalMax < FOCAL_LIMITS.max) p.set("fmax", String(f.focalMax));
  if (f.sort !== "name") p.set("sort", f.sort);
  return p;
}

export function filterLenses(lenses: Lens[], f: LensFilters): Lens[] {
  const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  const result = lenses.filter((l) => {
    if (f.brands.length && !f.brands.includes(l.brand)) return false;
    if (f.mounts.length && !l.mounts.some((m) => f.mounts.includes(m))) return false;
    if (f.cats.length && !f.cats.every((c) => l.categories.includes(c))) return false;
    if (f.formats.length && !f.formats.includes(l.format)) return false;
    if (f.focus === "af" && !l.autofocus) return false;
    if (f.focus === "mf" && l.autofocus) return false;
    if (f.maxAperture && l.apertureMax > f.maxAperture) return false;
    if (l.focalMax < f.focalMin || l.focalMin > f.focalMax) return false;
    if (terms.length) {
      const hay = `${BRANDS[l.brand].name} ${l.name} ${l.series ?? ""} ${l.mounts.join(" ")}`.toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });

  const by: Record<SortKey, (a: Lens, b: Lens) => number> = {
    name: (a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, "en", { numeric: true }),
    focal: (a, b) => a.focalMin - b.focalMin || a.focalMax - b.focalMax,
    aperture: (a, b) => a.apertureMax - b.apertureMax,
    weight: (a, b) => a.weightG - b.weightG,
    price: (a, b) => (a.priceUsd ?? Infinity) - (b.priceUsd ?? Infinity),
    year: (a, b) => (b.year ?? 0) - (a.year ?? 0),
  };
  return result.sort(by[f.sort]);
}
