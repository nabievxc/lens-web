import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { MountId } from "@/types/lens";
import { MOUNTS, MOUNT_LIST } from "@/data/mounts";
import { BRANDS } from "@/data/brands";
import { lensesByMount } from "@/data/lenses";
import { LensGrid } from "@/components/LensGrid";
import { MountDiagram } from "@/components/MountDiagram";

function findMount(slug: string) {
  return MOUNT_LIST.find((m) => m.id.toLowerCase() === slug.toLowerCase());
}

export function generateStaticParams() {
  return MOUNT_LIST.map((m) => ({ mount: m.id.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ mount: string }> }): Promise<Metadata> {
  const m = findMount((await params).mount);
  return m ? { title: `${m.name} lenses` } : {};
}

export default async function MountPage({ params }: { params: Promise<{ mount: string }> }) {
  const mount = findMount((await params).mount);
  if (!mount) notFound();
  const lenses = lensesByMount(mount.id as MountId);
  const brands = [...new Set(lenses.map((l) => l.brand))];

  const facts: [string, string][] = [
    ["Maker", mount.maker],
    ["Introduced", String(mount.year)],
    ["Flange distance", `${mount.flangeMm} mm`],
    ["Throat diameter", `${mount.throatMm} mm`],
    ["Bayonet lugs", String(mount.tabs)],
    ["Electrical contacts", mount.contacts ? String(mount.contacts) : "None"],
    ["Formats", mount.formats.join(", ")],
  ];

  return (
    <div className="flex flex-col gap-12">
      <div>
        <Link href="/mounts" className="text-sm text-zinc-500 transition hover:text-zinc-200">
          ← All mounts
        </Link>
        <div className="mt-6 grid items-center gap-10 md:grid-cols-[220px_1fr]">
          <MountDiagram mount={MOUNTS[mount.id]} className="lens-shadow h-52 w-52" />
          <div>
            <div className="eyebrow mb-2">
              {mount.maker} · {mount.year}
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-white">{mount.name}</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">{mount.description}</p>
            <dl className="mt-6 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.06] sm:grid-cols-3">
              {facts.slice(2).map(([k, v]) => (
                <div key={k} className="bg-ink/90 px-4 py-3">
                  <dt className="eyebrow">{k}</dt>
                  <dd className="mt-1 truncate font-mono text-sm text-zinc-100">{v}</dd>
                </div>
              ))}
              <div className="bg-ink/90 px-4 py-3">
                <dt className="eyebrow">Lenses listed</dt>
                <dd className="mt-1 font-mono text-sm text-zinc-100">{lenses.length}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {brands.map((b) => (
                <Link key={b} href={`/lenses?mount=${mount.id}&brand=${b}`} className="chip">
                  {BRANDS[b].name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <LensGrid lenses={lenses} />
    </div>
  );
}
