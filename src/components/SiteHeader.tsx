"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/catalog", label: "Catalog" },
  { href: "/lenses", label: "Lenses" },
  { href: "/brands", label: "Brands" },
  { href: "/mounts", label: "Mounts" },
];

export function SiteHeader({ lensCount }: { lensCount: number }) {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/catalog" className="font-display text-2xl leading-none text-white">
          Lens <span className="text-accent">Catalog</span>
        </Link>

        <nav className="hidden items-center sm:flex gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] p-1 text-sm">
          {NAV.map((n) => {
            const active = path === n.href || path.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-full px-3.5 py-1.5 transition ${
                  active ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/" className="btn btn-primary !rounded-full !py-1.5 text-xs">
            Rental shop
          </Link>
          <Link href="/lenses" className="btn btn-ghost hidden !rounded-full !py-1.5 text-xs md:inline-flex">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
              <circle cx="9" cy="9" r="6" />
              <path d="m14 14 4 4" strokeLinecap="round" />
            </svg>
            Search {lensCount} lenses
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
