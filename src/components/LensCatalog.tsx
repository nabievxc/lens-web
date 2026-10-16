"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LENSES } from "@/data/lenses";
import { BRANDS } from "@/data/brands";
import { CATEGORY_LABELS } from "@/lib/format";
import {
  DEFAULT_FILTERS,
  filterLenses,
  filtersFromParams,
  filtersToParams,
  type LensFilters as Filters,
} from "@/lib/filterLenses";
import { LensFilters } from "./LensFilters";
import { LensCard } from "./LensCard";

const PAGE = 48;

export function LensCatalog() {
  const params = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => filtersFromParams(new URLSearchParams(params.toString())));
  const [limit, setLimit] = useState(PAGE);
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => filterLenses(LENSES, filters), [filters]);

  const counts = useMemo(() => {
    const brands: Record<string, number> = {};
    const mounts: Record<string, number> = {};
    for (const l of LENSES) {
      brands[l.brand] = (brands[l.brand] ?? 0) + 1;
      for (const m of l.mounts) mounts[m] = (mounts[m] ?? 0) + 1;
    }
    return { brands, mounts };
  }, []);

  const update = (f: Filters) => {
    setFilters(f);
    setLimit(PAGE);
    const qs = filtersToParams(f).toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  const active: { key: string; label: string; clear: () => void }[] = [
    ...filters.cats.map((c) => ({
      key: `c-${c}`,
      label: CATEGORY_LABELS[c],
      clear: () => update({ ...filters, cats: filters.cats.filter((x) => x !== c) }),
    })),
    ...filters.mounts.map((m) => ({
      key: `m-${m}`,
      label: `${m} mount`,
      clear: () => update({ ...filters, mounts: filters.mounts.filter((x) => x !== m) }),
    })),
    ...filters.brands.map((b) => ({
      key: `b-${b}`,
      label: BRANDS[b].name,
      clear: () => update({ ...filters, brands: filters.brands.filter((x) => x !== b) }),
    })),
    ...filters.formats.map((x) => ({
      key: `f-${x}`,
      label: x,
      clear: () => update({ ...filters, formats: filters.formats.filter((y) => y !== x) }),
    })),
    ...(filters.maxAperture
      ? [{ key: "ap", label: `f/${filters.maxAperture} or faster`, clear: () => update({ ...filters, maxAperture: null }) }]
      : []),
    ...(filters.focalMin !== DEFAULT_FILTERS.focalMin || filters.focalMax !== DEFAULT_FILTERS.focalMax
      ? [
          {
            key: "focal",
            label: `${filters.focalMin}–${filters.focalMax}mm`,
            clear: () => update({ ...filters, focalMin: DEFAULT_FILTERS.focalMin, focalMax: DEFAULT_FILTERS.focalMax }),
          },
        ]
      : []),
    ...(filters.focus !== "any"
      ? [{ key: "focus", label: filters.focus === "af" ? "Autofocus" : "Manual", clear: () => update({ ...filters, focus: "any" }) }]
      : []),
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start">
        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          className="btn btn-ghost mb-4 w-full lg:hidden"
        >
          {showFilters ? "Hide filters" : `Show filters${active.length ? ` (${active.length})` : ""}`}
        </button>
        <div
          className={`${showFilters ? "block" : "hidden"} panel scroll-thin p-5 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto`}
        >
          <LensFilters value={filters} onChange={update} counts={counts} />
        </div>
      </aside>

      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-sm text-zinc-400">
            <span className="font-mono text-base font-medium text-white">{results.length}</span> of {LENSES.length} lenses
          </span>
          {active.map((a) => (
            <button key={a.key} type="button" onClick={a.clear} className="chip chip-active">
              {a.label}
              <span aria-hidden className="text-accent/70">×</span>
            </button>
          ))}
          {active.length > 1 && (
            <button
              type="button"
              onClick={() => update({ ...DEFAULT_FILTERS, q: filters.q, sort: filters.sort })}
              className="text-xs text-zinc-500 underline-offset-4 hover:text-zinc-200 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="panel flex flex-col items-center gap-3 border-dashed p-16 text-center">
            <div className="text-lg font-medium text-zinc-200">No lenses match these filters</div>
            <button type="button" onClick={() => update(DEFAULT_FILTERS)} className="btn btn-ghost">
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.slice(0, limit).map((l) => (
              <LensCard key={l.slug} lens={l} />
            ))}
          </div>
        )}
        {limit < results.length && (
          <div className="mt-4 flex justify-center">
            <button type="button" onClick={() => setLimit((n) => n + PAGE)} className="btn btn-ghost !px-6">
              Show more <span className="font-mono text-zinc-500">{results.length - limit} left</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
