import Link from "next/link";
import type { Metadata } from "next";
import { MOUNT_LIST } from "@/data/mounts";
import { lensesByMount } from "@/data/lenses";
import { MountDiagram } from "@/components/MountDiagram";

export const metadata: Metadata = { title: "Lens mounts" };

export default function MountsPage() {
  const maxThroat = Math.max(...MOUNT_LIST.map((m) => m.throatMm));
  const maxFlange = Math.max(...MOUNT_LIST.map((m) => m.flangeMm));
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-white">Lens mounts</h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          Flange distance and throat diameter decide which lenses can be adapted to which cameras. A camera with a
          shorter flange distance can take an adapter for a mount with a longer one.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOUNT_LIST.map((m) => (
          <Link
            key={m.id}
            href={`/mounts/${m.id.toLowerCase()}`}
            className="panel panel-hover group flex flex-col gap-5 p-6"
          >
            <div className="flex items-center gap-5">
              <MountDiagram mount={m} className="h-24 w-24 shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold text-white">{m.name}</span>
                <span className="text-xs text-zinc-500">
                  {m.maker} · {m.year}
                </span>
                <span className="mt-1 w-fit rounded-full border border-white/10 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                  {lensesByMount(m.id).length} lenses
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <Bar label="Flange" value={m.flangeMm} max={maxFlange} />
              <Bar label="Throat" value={m.throatMm} max={maxThroat} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="grid grid-cols-[52px_1fr_56px] items-center gap-3 text-xs">
      <span className="eyebrow !text-[10px]">{label}</span>
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="text-right font-mono text-zinc-300">{value}mm</span>
    </div>
  );
}
