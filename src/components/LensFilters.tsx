"use client";

import type { BrandId, Category, Format, MountId } from "@/types/lens";
import { BRAND_LIST } from "@/data/brands";
import { MOUNT_LIST } from "@/data/mounts";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/format";
import { DEFAULT_FILTERS, FOCAL_LIMITS, type LensFilters as Filters, type SortKey } from "@/lib/filterLenses";

interface Props {
  value: Filters;
  onChange: (f: Filters) => void;
  counts: { brands: Record<string, number>; mounts: Record<string, number> };
}

const FORMATS: { id: Format; label: string }[] = [
  { id: "FF", label: "Full frame" },
  { id: "APS-C", label: "APS-C" },
  { id: "S35", label: "Super 35" },
  { id: "M43", label: "Micro 4/3" },
  { id: "MF", label: "Medium format" },
];

const APERTURES = [null, 1.2, 1.4, 1.8, 2, 2.8, 4] as const;

const SORTS: { id: SortKey; label: string }[] = [
  { id: "name", label: "Brand & name" },
  { id: "focal", label: "Focal length" },
  { id: "aperture", label: "Fastest aperture" },
  { id: "weight", label: "Lightest" },
  { id: "price", label: "Cheapest" },
  { id: "year", label: "Newest" },
];

const LOG_RANGE = Math.log(FOCAL_LIMITS.max / FOCAL_LIMITS.min);
const toPos = (mm: number) => Math.round((Math.log(mm / FOCAL_LIMITS.min) / LOG_RANGE) * 100);
const fromPos = (pos: number) => {
  const mm = FOCAL_LIMITS.min * Math.exp((pos / 100) * LOG_RANGE);
  return mm < 20 ? Math.round(mm) : Math.round(mm / 5) * 5;
};

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-white/[0.06] pt-5">
      <div className="flex items-baseline justify-between">
        <h3 className="eyebrow">{title}</h3>
        {aside && <span className="font-mono text-xs text-accent-soft">{aside}</span>}
      </div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`chip ${active ? "chip-active" : ""}`}>
      {children}
    </button>
  );
}

function Count({ n }: { n: number }) {
  return <span className="font-mono text-[10px] text-zinc-500">{n}</span>;
}

export function LensFilters({ value: f, onChange, counts }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...f, ...patch });
  const lo = toPos(f.focalMin);
  const hi = toPos(f.focalMax);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <svg
          viewBox="0 0 20 20"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-zinc-500"
          strokeWidth="2"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="m14 14 4 4" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={f.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Search lenses…"
          className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 transition focus:border-accent/60 focus:outline-none focus:ring-4 focus:ring-accent/10"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <h3 className="eyebrow">Sort by</h3>
        <select
          value={f.sort}
          onChange={(e) => set({ sort: e.target.value as SortKey })}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-zinc-200 focus:border-accent/60 focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <Section title="Type">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_ORDER.map((c: Category) => (
            <Chip key={c} active={f.cats.includes(c)} onClick={() => set({ cats: toggle(f.cats, c) })}>
              {CATEGORY_LABELS[c]}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Mount">
        <div className="flex flex-wrap gap-1.5">
          {MOUNT_LIST.map((m) => (
            <Chip key={m.id} active={f.mounts.includes(m.id)} onClick={() => set({ mounts: toggle<MountId>(f.mounts, m.id) })}>
              {m.id} <Count n={counts.mounts[m.id] ?? 0} />
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Brand">
        <div className="flex flex-wrap gap-1.5">
          {BRAND_LIST.map((b) => (
            <Chip key={b.id} active={f.brands.includes(b.id)} onClick={() => set({ brands: toggle<BrandId>(f.brands, b.id) })}>
              {b.name} <Count n={counts.brands[b.id] ?? 0} />
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Focal length" aside={`${f.focalMin}–${f.focalMax}mm`}>
        <div className="dual-range relative h-5">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
            style={{ left: `${lo}%`, right: `${100 - hi}%` }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={lo}
            onChange={(e) => set({ focalMin: Math.min(fromPos(Number(e.target.value)), f.focalMax) })}
            aria-label="Minimum focal length"
          />
          <input
            type="range"
            min={0}
            max={100}
            value={hi}
            onChange={(e) => set({ focalMax: Math.max(fromPos(Number(e.target.value)), f.focalMin) })}
            aria-label="Maximum focal length"
          />
        </div>
        <div className="flex justify-between font-mono text-[10px] text-zinc-600">
          <span>{FOCAL_LIMITS.min}mm</span>
          <span>{FOCAL_LIMITS.max}mm</span>
        </div>
      </Section>

      <Section title="Max aperture at least">
        <div className="flex flex-wrap gap-1.5">
          {APERTURES.map((a) => (
            <Chip key={a ?? "any"} active={f.maxAperture === a} onClick={() => set({ maxAperture: a })}>
              {a ? `f/${a}` : "Any"}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Sensor format">
        <div className="flex flex-wrap gap-1.5">
          {FORMATS.map((x) => (
            <Chip key={x.id} active={f.formats.includes(x.id)} onClick={() => set({ formats: toggle(f.formats, x.id) })}>
              {x.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Focus">
        <div className="flex flex-wrap gap-1.5">
          {(["any", "af", "mf"] as const).map((x) => (
            <Chip key={x} active={f.focus === x} onClick={() => set({ focus: x })}>
              {x === "any" ? "Any" : x === "af" ? "Autofocus" : "Manual"}
            </Chip>
          ))}
        </div>
      </Section>

      <button type="button" onClick={() => onChange(DEFAULT_FILTERS)} className="btn btn-ghost w-full">
        Reset all filters
      </button>
    </div>
  );
}
