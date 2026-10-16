import Link from "next/link";
import type { Category } from "@/types/lens";
import { LENSES, getLens, lensesByCategory, lensesByMount } from "@/data/lenses";
import { MOUNT_LIST } from "@/data/mounts";
import { CATEGORY_LABELS, CATEGORY_ORDER, apertureLabel, focalLabel, fullName } from "@/lib/format";
import { LensViewer } from "@/components/three/LensViewer";
import { LensCard } from "@/components/LensCard";
import { LensSilhouette } from "@/components/LensSilhouette";
import { MountDiagram } from "@/components/MountDiagram";

const FEATURED_SLUG = "sony-fe-24-70mm-f2-8-gm-ii";
const PICKS = [
  "canon-rf-28-70mm-f2-l-usm",
  "sirui-venus-50mm-t2-9-1-6x-full-frame-anamorphic",
  "laowa-24mm-f-14-2x-macro-probe",
  "7artisans-7-5mm-f2-8-ii-fisheye",
  "nikon-nikkor-z-58mm-f-0-95-s-noct",
  "zeiss-cp-3-50mm-t2-1",
  "sigma-14mm-f1-4-dg-dn-art",
  "fujifilm-xf-50mm-f1-0-r-wr",
];

const CATEGORY_INFO: Record<Category, { blurb: string; slug: string }> = {
  wide: { blurb: "Landscapes, architecture, astro", slug: "sigma-14mm-f1-4-dg-dn-art" },
  standard: { blurb: "35–70mm on full frame", slug: "sony-fe-24-70mm-f2-8-gm-ii" },
  tele: { blurb: "Portraits, sports, wildlife", slug: "sony-fe-70-200mm-f2-8-gm-oss-ii" },
  macro: { blurb: "1:1 magnification or more", slug: "sony-fe-90mm-f2-8-macro-g-oss" },
  fisheye: { blurb: "Up to 180° field of view", slug: "7artisans-7-5mm-f2-8-ii-fisheye" },
  anamorphic: { blurb: "Oval bokeh, streak flares", slug: "sirui-venus-50mm-t2-9-1-6x-full-frame-anamorphic" },
  cine: { blurb: "T-stops, geared rings, no aperture clicks", slug: "zeiss-cp-3-50mm-t2-1" },
  prime: { blurb: "One focal length", slug: "nikon-nikkor-z-58mm-f-0-95-s-noct" },
  zoom: { blurb: "Variable focal length", slug: "canon-rf-100-500mm-f4-5-7-1-l-is-usm" },
};

export default function Home() {
  const featured = getLens(FEATURED_SLUG) ?? LENSES[0];
  const picks = PICKS.map(getLens).filter((l) => l !== undefined);
  const brandCount = new Set(LENSES.map((l) => l.brand)).size;

  return (
    <div className="flex flex-col gap-20">
      <section className="grid items-center gap-8 lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl font-semibold tracking-[-0.03em] text-white sm:text-6xl">Lens Catalog</h1>
          <p className="max-w-md text-lg leading-relaxed text-zinc-400">
            {LENSES.length} lenses from Sony, Canon, Nikon, Sigma, Tamron, Sirui, 7Artisans, Laowa and{" "}
            {brandCount - 8} other brands. Open any lens to turn it around in 3D, put it on another mount, zoom it and
            stop down the aperture.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/lenses" className="btn btn-primary !px-5 !py-2.5">
              Browse all lenses
            </Link>
            <Link href="/mounts" className="btn btn-ghost !px-5 !py-2.5">
              Compare mounts
            </Link>
          </div>
        </div>

        <figure>
          <LensViewer lens={featured} showControls={false} bare />
          <figcaption className="text-center text-sm text-zinc-500">
            <Link href={`/lenses/${featured.slug}`} className="text-zinc-300 underline-offset-4 hover:underline">
              {fullName(featured)}
            </Link>{" "}
            · {focalLabel(featured)} · {apertureLabel(featured)}
          </figcaption>
        </figure>
      </section>

      <section>
        <SectionHead title="Browse by type" href="/lenses" link="All lenses" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORY_ORDER.map((c) => {
            const info = CATEGORY_INFO[c];
            const list = lensesByCategory(c);
            const rep = getLens(info.slug) ?? list[0];
            return (
              <Link key={c} href={`/lenses?cat=${c}`} className="panel panel-hover flex flex-col justify-between gap-5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{CATEGORY_LABELS[c]}</div>
                    <div className="text-sm text-zinc-500">{info.blurb}</div>
                  </div>
                  <span className="text-sm text-zinc-500 tabular-nums">{list.length}</span>
                </div>
                {rep && <LensSilhouette lens={rep} className="lens-shadow h-20 w-full lg:h-24" />}
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHead title="A few to start with" href="/lenses" link="All lenses" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {picks.map((l) => (
            <LensCard key={l.slug} lens={l} />
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="Lens mounts" href="/mounts" link="Flange and throat sizes" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {MOUNT_LIST.map((m) => (
            <Link
              key={m.id}
              href={`/mounts/${m.id.toLowerCase()}`}
              className="panel panel-hover flex flex-col items-center gap-3 p-5 text-center"
            >
              <MountDiagram mount={m} className="h-20 w-20" />
              <div>
                <div className="text-sm font-medium text-white">{m.name}</div>
                <div className="text-xs text-zinc-500">{lensesByMount(m.id).length} lenses</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHead({ title, href, link }: { title: string; href: string; link: string }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
      <Link href={href} className="text-sm text-zinc-400 underline-offset-4 hover:text-white hover:underline">
        {link}
      </Link>
    </div>
  );
}
