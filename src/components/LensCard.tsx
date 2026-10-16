import Link from "next/link";
import type { Lens } from "@/types/lens";
import { BRANDS } from "@/data/brands";
import { apertureLabel, focalLabel, formatPrice } from "@/lib/format";
import { LensSilhouette } from "./LensSilhouette";

const SPECIAL = ["macro", "fisheye", "anamorphic", "cine"] as const;

export function LensCard({ lens }: { lens: Lens }) {
  const brand = BRANDS[lens.brand];
  const special = lens.categories.filter((c) => (SPECIAL as readonly string[]).includes(c));
  return (
    <Link
      href={`/lenses/${lens.slug}`}
      className="panel panel-hover group relative flex flex-col overflow-hidden"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <LensSilhouette lens={lens} className="lens-shadow relative h-24 w-full transition duration-300 group-hover:scale-[1.03]" />
        <div className="absolute left-3 top-3 flex gap-1">
          {special.map((t) => (
            <span key={t} className="rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-soft backdrop-blur">
              {t}
            </span>
          ))}
        </div>
        <span className="absolute right-3 top-3 font-mono text-[10px] text-zinc-500">
          {lens.autofocus ? "AF" : "MF"} · {lens.format}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: brand.accent }} />
            <span className="font-semibold uppercase tracking-wider text-zinc-300">{brand.name}</span>
            {lens.series && <span className="text-zinc-500">{lens.series}</span>}
          </div>
          <h3 className="text-[15px] font-medium leading-snug text-white">{lens.name}</h3>
        </div>

        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-white/[0.06] font-mono text-xs">
          <Spec label="Focal" value={focalLabel(lens)} />
          <Spec label={lens.tStop ? "T-stop" : "Aperture"} value={apertureLabel(lens)} />
          <Spec label="Weight" value={`${lens.weightG}g`} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {lens.mounts.slice(0, 5).map((m) => (
              <span key={m} className="rounded-md border border-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                {m}
              </span>
            ))}
            {lens.mounts.length > 5 && <span className="px-1 font-mono text-[10px] text-zinc-500">+{lens.mounts.length - 5}</span>}
          </div>
          <span className="shrink-0 text-sm font-medium text-zinc-200">{formatPrice(lens.priceUsd)}</span>
        </div>
      </div>
    </Link>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-panel px-2 py-1.5">
      <span className="text-[9px] uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="truncate text-zinc-100">{value}</span>
    </div>
  );
}
