import { Suspense } from "react";
import type { Metadata } from "next";
import { LensCatalog } from "@/components/LensCatalog";

export const metadata: Metadata = { title: "All lenses" };

export default function LensesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-white">All lenses</h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          Filter by brand, mount, type, focal length and aperture. Open any lens to see it in 3D.
        </p>
      </div>
      <Suspense fallback={<div className="text-zinc-500">Loading catalog…</div>}>
        <LensCatalog />
      </Suspense>
    </div>
  );
}
