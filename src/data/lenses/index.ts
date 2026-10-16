import type { BrandId, Category, Lens, MountId } from "@/types/lens";
import { sony } from "./sony";
import { canon } from "./canon";
import { nikon } from "./nikon";
import { fujifilm } from "./fujifilm";
import { panasonic } from "./panasonic";
import { omSystem } from "./om-system";
import { sigma } from "./sigma";
import { tamron } from "./tamron";
import { samyang } from "./samyang";
import { viltrox } from "./viltrox";
import { sirui } from "./sirui";
import { sevenArtisans } from "./7artisans";
import { ttartisan } from "./ttartisan";
import { laowa } from "./laowa";
import { atlas, blazar, dzofilm, meike, voigtlander, zeiss } from "./cine";

const ALL: Lens[] = [
  ...sony,
  ...canon,
  ...nikon,
  ...fujifilm,
  ...panasonic,
  ...omSystem,
  ...sigma,
  ...tamron,
  ...samyang,
  ...viltrox,
  ...sirui,
  ...sevenArtisans,
  ...ttartisan,
  ...laowa,
  ...voigtlander,
  ...zeiss,
  ...dzofilm,
  ...meike,
  ...atlas,
  ...blazar,
];

function dedupe(list: Lens[]): Lens[] {
  const seen = new Set<string>();
  return list.filter((l) => {
    if (seen.has(l.slug)) return false;
    seen.add(l.slug);
    return true;
  });
}

export const LENSES: Lens[] = dedupe(ALL);

const BY_SLUG = new Map(LENSES.map((l) => [l.slug, l]));

export function getLens(slug: string): Lens | undefined {
  return BY_SLUG.get(slug);
}

export function lensesByBrand(brand: BrandId): Lens[] {
  return LENSES.filter((l) => l.brand === brand);
}

export function lensesByMount(mount: MountId): Lens[] {
  return LENSES.filter((l) => l.mounts.includes(mount));
}

export function lensesByCategory(cat: Category): Lens[] {
  return LENSES.filter((l) => l.categories.includes(cat));
}

export function relatedLenses(lens: Lens, limit = 6): Lens[] {
  const score = (o: Lens) => {
    let s = 0;
    if (o.brand === lens.brand) s += 2;
    if (o.mounts.some((m) => lens.mounts.includes(m))) s += 1;
    for (const c of o.categories) if (lens.categories.includes(c)) s += 1;
    s -= Math.abs(Math.log(o.focalMin / lens.focalMin));
    return s;
  };
  return LENSES.filter((o) => o.slug !== lens.slug)
    .map((o) => ({ o, s: score(o) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.o);
}
