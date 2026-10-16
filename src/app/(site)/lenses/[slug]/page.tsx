import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LENSES, getLens, relatedLenses } from "@/data/lenses";
import { BRANDS } from "@/data/brands";
import { MOUNTS } from "@/data/mounts";
import { CATEGORY_LABELS, apertureLabel, focalLabel, formatPrice, fullName } from "@/lib/format";
import { LensViewer } from "@/components/three/LensViewer";
import { LensCard } from "@/components/LensCard";
import { MountDiagram } from "@/components/MountDiagram";

export function generateStaticParams() {
  return LENSES.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const lens = getLens((await params).slug);
  return lens ? { title: fullName(lens) } : {};
}

export default async function LensPage({ params }: { params: Promise<{ slug: string }> }) {
  const lens = getLens((await params).slug);
  if (!lens) notFound();
  const brand = BRANDS[lens.brand];
  const related = relatedLenses(lens, 4);

  const specs: [string, string][] = [
    ["Focal length", focalLabel(lens)],
    ["Max aperture", apertureLabel(lens)],
    ["Min aperture", `${lens.tStop ? "T" : "f/"}${lens.apertureMin}`],
    ["Sensor format", lens.format === "MF" ? "Medium format" : lens.format === "S35" ? "Super 35" : lens.format],
    ["Focus", lens.autofocus ? "Autofocus" : "Manual focus"],
    ...(lens.squeeze ? ([["Anamorphic squeeze", `${lens.squeeze}x`]] as [string, string][]) : []),
    ["Aperture blades", lens.bladeCount ? String(lens.bladeCount) : "Fixed"],
    ["Aperture ring", lens.hasApertureRing ? "Yes" : "No"],
    ["Diameter × length", `${lens.diameterMm} × ${lens.lengthMm} mm`],
    ["Weight", `${lens.weightG} g`],
    ["Filter thread", lens.filterMm ? `${lens.filterMm} mm` : "None / rear"],
    ...(lens.minFocusM ? ([["Minimum focus", `${lens.minFocusM} m`]] as [string, string][]) : []),
    ["Zoom type", lens.focalMin === lens.focalMax ? "Prime" : lens.extensionMm > 0 ? "Extending" : "Internal"],
    ["Released", lens.year ? String(lens.year) : "—"],
    ["Launch price", formatPrice(lens.priceUsd)],
  ];

  const headline: [string, string][] = [
    ["Focal length", focalLabel(lens)],
    [lens.tStop ? "T-stop" : "Aperture", apertureLabel(lens)],
    ["Weight", `${lens.weightG} g`],
    ["Price", formatPrice(lens.priceUsd)],
  ];

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-5">
        <nav className="flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/lenses" className="transition hover:text-zinc-200">
            Lenses
          </Link>
          <span className="text-zinc-700">/</span>
          <Link href={`/brands/${brand.id}`} className="transition hover:text-zinc-200">
            {brand.name}
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="truncate text-zinc-300">{lens.name}</span>
        </nav>

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full" style={{ background: brand.accent }} />
              <span className="font-semibold uppercase tracking-wider text-zinc-200">{brand.name}</span>
              {lens.series && <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-xs text-zinc-400">{lens.series}</span>}
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">{lens.name}</h1>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {lens.categories.map((c) => (
                <Link key={c} href={`/lenses?cat=${c}`} className="chip">
                  {CATEGORY_LABELS[c]}
                </Link>
              ))}
            </div>
          </div>
          <dl className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.06] sm:grid-cols-4">
            {headline.map(([k, v]) => (
              <div key={k} className="bg-ink/90 px-5 py-3">
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-1 font-mono text-lg text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <LensViewer lens={lens} />

        <div className="flex flex-col gap-6">
          <div className="panel overflow-hidden">
            <div className="eyebrow border-b border-white/[0.06] px-5 py-3">Specifications</div>
            <dl className="divide-y divide-white/[0.05]">
              {specs.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 px-5 py-2.5 text-sm">
                  <dt className="text-zinc-500">{k}</dt>
                  <dd className="text-right font-mono text-[13px] text-zinc-100">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="panel p-5">
            <div className="eyebrow mb-3">Available for</div>
            <div className="flex flex-col gap-1.5">
              {lens.mounts.map((m) => (
                <Link
                  key={m}
                  href={`/mounts/${m.toLowerCase()}`}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.06] px-3 py-2 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.03]"
                >
                  <span className="flex items-center gap-3">
                    <MountDiagram mount={MOUNTS[m]} className="h-7 w-7" />
                    {MOUNTS[m].name}
                  </span>
                  <span className="font-mono text-xs text-zinc-500 transition group-hover:text-zinc-300">
                    {MOUNTS[m].flangeMm}mm →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-white">Similar lenses</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((l) => (
            <LensCard key={l.slug} lens={l} />
          ))}
        </div>
      </section>
    </div>
  );
}
