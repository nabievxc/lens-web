import Link from "next/link";
import { LENSES } from "@/data/lenses";
import { BRAND_LIST } from "@/data/brands";
import { MOUNT_LIST } from "@/data/mounts";
import { SiteHeader } from "@/components/SiteHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader lensCount={LENSES.length} />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">{children}</main>
      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <Link href="/" className="font-display text-2xl text-white">
              Lens Catalog
            </Link>
            <p className="max-w-xs text-sm text-zinc-500">
              The 3D models are built from each lens&apos;s published diameter, length and filter size. Rings, print and
              glass are simplified, and specs may contain mistakes.
            </p>
            <Link href="/" className="text-sm text-accent underline underline-offset-4">
              Walk into the rental shop
            </Link>
          </div>
          <FooterCol title="Explore">
            <Link href="/lenses">All lenses</Link>
            <Link href="/lenses?cat=anamorphic">Anamorphic</Link>
            <Link href="/lenses?cat=cine">Cine</Link>
            <Link href="/lenses?cat=macro">Macro</Link>
            <Link href="/lenses?cat=fisheye">Fisheye</Link>
          </FooterCol>
          <FooterCol title="Brands">
            {BRAND_LIST.slice(0, 5).map((b) => (
              <Link key={b.id} href={`/brands/${b.id}`}>
                {b.name}
              </Link>
            ))}
          </FooterCol>
          <FooterCol title="Mounts">
            {MOUNT_LIST.slice(0, 5).map((m) => (
              <Link key={m.id} href={`/mounts/${m.id.toLowerCase()}`}>
                {m.name}
              </Link>
            ))}
          </FooterCol>
        </div>
      </footer>
    </>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 text-sm text-zinc-400 [&_a]:w-fit [&_a]:transition [&_a:hover]:text-white">
      <span className="eyebrow mb-1">{title}</span>
      {children}
    </div>
  );
}
