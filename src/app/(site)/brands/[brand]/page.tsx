import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { BrandId } from "@/types/lens";
import { BRANDS, BRAND_LIST } from "@/data/brands";
import { MOUNTS } from "@/data/mounts";
import { lensesByBrand } from "@/data/lenses";
import { LensGrid } from "@/components/LensGrid";

export function generateStaticParams() {
  return BRAND_LIST.map((b) => ({ brand: b.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const b = BRANDS[(await params).brand as BrandId];
  return b ? { title: `${b.name} lenses` } : {};
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const brand = BRANDS[(await params).brand as BrandId];
  if (!brand) notFound();
  const lenses = lensesByBrand(brand.id);
  const mounts = [...new Set(lenses.flatMap((l) => l.mounts))];

  return (
    <div className="flex flex-col gap-12">
      <div>
        <Link href="/brands" className="text-sm text-zinc-500 transition hover:text-zinc-200">
          ← All brands
        </Link>
        <h1 className="mt-4 flex items-center gap-3 text-4xl font-semibold tracking-[-0.03em] text-white">
          <span className="h-3 w-3 rounded-full" style={{ background: brand.accent }} />
          {brand.name}
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          {brand.description} {lenses.length} lenses listed. {brand.country}, founded {brand.founded}.
        </p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {mounts.map((m) => (
            <Link key={m} href={`/lenses?brand=${brand.id}&mount=${m}`} className="chip">
              {MOUNTS[m].name}
            </Link>
          ))}
        </div>
      </div>
      <LensGrid lenses={lenses} />
    </div>
  );
}
