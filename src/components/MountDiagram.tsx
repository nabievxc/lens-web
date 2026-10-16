import type { MountSpec } from "@/data/mounts";

/** Rear view of the bayonet: throat, lugs, contacts and index dot, to scale. */
export function MountDiagram({ mount, className = "" }: { mount: MountSpec; className?: string }) {
  const r = mount.throatMm / 2;
  const outer = r + (mount.id === "PL" ? 7 : 4);
  const lugSpan = ((Math.PI * 2) / mount.tabs) * (mount.id === "PL" ? 0.5 : 0.38);
  const pt = (a: number, rr: number) => `${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`;
  const arc = (a0: number, a1: number, rr: number, sweep: 0 | 1) => `${pt(a0, rr)} A${rr},${rr} 0 0 ${sweep} ${pt(a1, rr)}`;
  const contactArc = Math.min(1.4, mount.contacts * 0.1);
  const size = 40;

  return (
    <svg viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`} className={className} aria-hidden>
      <circle r={outer} fill="#3f3f46" />
      <circle r={outer - 0.8} fill="#a1a1aa" />
      <circle r={r} fill="#0b0b0d" />
      {Array.from({ length: mount.tabs }, (_, i) => {
        const mid = (Math.PI * 2 * i) / mount.tabs - Math.PI / 2;
        const a0 = mid - lugSpan / 2;
        const a1 = mid + lugSpan / 2;
        return <path key={i} d={`M${arc(a0, a1, r + 0.2, 1)} L${arc(a1, a0, r - 2.5, 0)} Z`} fill="#e4e4e7" />;
      })}
      {Array.from({ length: mount.contacts }, (_, i) => {
        const a = Math.PI / 2 - contactArc / 2 + (contactArc * (i + 0.5)) / mount.contacts;
        return <circle key={i} cx={Math.cos(a) * (r - 4.5)} cy={Math.sin(a) * (r - 4.5)} r={0.9} fill="#d6a648" />;
      })}
      <circle cx={0} cy={-outer + 2} r={1.3} fill={mount.indexColor} />
    </svg>
  );
}
