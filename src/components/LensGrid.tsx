import type { Lens } from "@/types/lens";
import { LensCard } from "./LensCard";

/** Assigned in this order (cine first), displayed by `order`. */
const GROUPS: { title: string; order: number; test: (l: Lens) => boolean }[] = [
  { title: "Cine & anamorphic", order: 2, test: (l) => l.categories.includes("cine") || l.categories.includes("anamorphic") },
  { title: "Zoom lenses", order: 0, test: (l) => l.focalMin !== l.focalMax },
  { title: "Prime lenses", order: 1, test: () => true },
];

/** Lenses grouped into zooms / primes / cine, each sorted by focal length. */
export function LensGrid({ lenses }: { lenses: Lens[] }) {
  const remaining = [...lenses].sort((a, b) => a.focalMin - b.focalMin || a.focalMax - b.focalMax);
  const used = new Set<string>();
  const sections = GROUPS.map((g) => {
    const items = remaining.filter((l) => !used.has(l.slug) && g.test(l));
    items.forEach((l) => used.add(l.slug));
    return { title: g.title, order: g.order, items };
  })
    .filter((s) => s.items.length)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-14">
      {sections.map((s) => (
        <section key={s.title}>
          <div className="mb-5 flex items-center gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-white">{s.title}</h2>
            <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-xs text-zinc-400">{s.items.length}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {s.items.map((l) => (
              <LensCard key={l.slug} lens={l} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
