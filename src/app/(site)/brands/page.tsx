import Link from "next/link";
import type { Metadata } from "next";
import { BRAND_LIST } from "@/data/brands";
import { lensesByBrand } from "@/data/lenses";
import { LensSilhouette } from "@/components/LensSilhouette";

export const metadata: Metadata = { title: "Brands" };

export default function BrandsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-white">Brands</h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          Camera makers&apos; own lenses, third-party autofocus lenses, cheap manual primes and cinema lenses.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BRAND_LIST.map((b) => {
          const lenses = lensesByBrand(b.id);
          const rep = [...lenses].sort((x, y) => (y.priceUsd ?? 0) - (x.priceUsd ?? 0))[0];
          return (
            <Link key={b.id} href={`/brands/${b.id}`} className="panel panel-hover flex flex-col gap-4 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
                    <span className="h-2 w-2 rounded-full" style={{ background: b.accent }} />
                    {b.name}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {b.country}, since {b.founded}
                  </div>
                </div>
                <span className="text-sm text-zinc-500 tabular-nums">{lenses.length} lenses</span>
              </div>
              {rep && <LensSilhouette lens={rep} className="lens-shadow h-16 w-full" />}
              <p className="text-sm leading-relaxed text-zinc-400">{b.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
