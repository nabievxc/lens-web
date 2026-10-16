import type { Lens } from "@/types/lens";
import { buildLensProfile, type Pt } from "./three/buildLensProfile";

const SCHEME: Record<Lens["color"], { body: string; ring: string; edge: string; print: string }> = {
  black: { body: "#26262b", ring: "#151518", edge: "#0a0a0c", print: "#e9e9ea" },
  white: { body: "#e9e8e3", ring: "#1c1c1f", edge: "#a9a8a2", print: "#2a2a2c" },
  silver: { body: "#b9bcc2", ring: "#232327", edge: "#6d7076", print: "#1d1d20" },
};

/** Side view rendered from the same profile as the 3D model, shaded like a studio product shot. */
export function LensSilhouette({ lens, className = "" }: { lens: Lens; className?: string }) {
  const p = buildLensProfile(lens);
  const pts: Pt[] = [[p.throatR - 1, 0], ...p.outline];
  const top = pts.map(([r, y]) => `${y.toFixed(1)},${(-r).toFixed(1)}`);
  const bottom = [...pts].reverse().map(([r, y]) => `${y.toFixed(1)},${r.toFixed(1)}`);
  const outline = `M${top.join(" L")} L${bottom.join(" L")} Z`;

  const id = lens.slug;
  const mountDepth = 7;
  const pad = 4;
  const hoodH = p.petalHood ? p.radius * 0.55 + 2 : 0;
  const minX = -mountDepth - pad;
  const width = p.length + hoodH + mountDepth + pad * 2;
  const maxR = Math.max(...p.rings.map((r) => r.r), p.radius) + pad;
  const s = SCHEME[lens.color];
  const mountR = p.throatR - 1.5;

  return (
    <svg viewBox={`${minX} ${-maxR} ${width} ${maxR * 2}`} className={className} preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        {/* Cylinder shading: a soft key-light band near the top, falling off into a dark lower edge. */}
        <linearGradient id={`shade-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="0.12" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.24" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="0.34" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="0.62" stopColor="#000" stopOpacity="0.05" />
          <stop offset="0.86" stopColor="#000" stopOpacity="0.35" />
          <stop offset="1" stopColor="#000" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`chrome-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d6168" />
          <stop offset="0.2" stopColor="#f2f4f7" />
          <stop offset="0.45" stopColor="#9aa0a8" />
          <stop offset="0.7" stopColor="#d9dde2" />
          <stop offset="1" stopColor="#4a4d53" />
        </linearGradient>
        <radialGradient id={`glass-${id}`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#9fe8c8" stopOpacity="0.9" />
          <stop offset="0.25" stopColor="#3a6f7c" stopOpacity="0.85" />
          <stop offset="0.7" stopColor="#141c2a" />
          <stop offset="1" stopColor="#07090d" />
        </radialGradient>
        {/* Axial grip ribs bunch up toward the top and bottom edges of a cylinder seen from the side. */}
        <pattern id={`rib-${id}`} width="6" height="1.6" patternUnits="userSpaceOnUse">
          <rect width="6" height="0.55" fill="#fff" opacity="0.14" />
          <rect y="0.55" width="6" height="0.3" fill="#000" opacity="0.35" />
        </pattern>
        <pattern id={`gear-${id}`} width="6" height="2.2" patternUnits="userSpaceOnUse">
          <rect width="6" height="1" fill="#fff" opacity="0.18" />
          <rect y="1" width="6" height="0.5" fill="#000" opacity="0.5" />
        </pattern>
        <clipPath id={`clip-${id}`}>
          <path d={outline} />
          {p.rings.map((r, i) => (
            <rect key={i} x={r.y0} y={-r.r} width={r.y1 - r.y0} height={r.r * 2} rx={1.2} />
          ))}
        </clipPath>
      </defs>

      {/* Mount */}
      <rect x={-mountDepth} y={-mountR} width={mountDepth} height={mountR * 2} rx={0.8} fill={`url(#chrome-${id})`} />
      <rect x={-mountDepth - 1.2} y={-mountR + 2} width={1.4} height={mountR * 2 - 4} rx={0.4} fill="#2a2c30" />

      {/* Barrel */}
      <path d={outline} fill={s.body} />

      {p.rings.map((r, i) => {
        const fill = r.gear ? "#1a1a1d" : r.role === "aperture" ? s.body : s.ring;
        return (
          <g key={i}>
            <rect x={r.y0} y={-r.r} width={r.y1 - r.y0} height={r.r * 2} rx={1.2} fill={fill} />
            {r.role !== "aperture" && (
              <rect
                x={r.y0 + 0.6}
                y={-r.r}
                width={Math.max(r.y1 - r.y0 - 1.2, 0)}
                height={r.r * 2}
                fill={`url(#${r.gear ? "gear" : "rib"}-${id})`}
              />
            )}
          </g>
        );
      })}

      {p.rings
        .filter((r) => r.band)
        .map((r, i) => (
          <rect key={`b${i}`} x={r.band!.y0} y={-p.radius - 0.15} width={r.band!.y1 - r.band!.y0} height={p.radius * 2 + 0.3} fill={s.body} />
        ))}

      {p.accents.map((a, i) => (
        <rect key={`a${i}`} x={a.y - a.h / 2} y={-p.radius - 0.2} width={a.h} height={p.radius * 2 + 0.4} fill={a.color} />
      ))}

      {p.label && (
        <g transform={`translate(${p.label.y} ${-p.radius * 0.18}) rotate(-90)`}>
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(p.label.h * 0.55, p.radius * 0.24)}
            fontWeight={700}
            fontFamily="Arial, sans-serif"
            letterSpacing={0.4}
            fill={s.print}
            opacity={0.85}
          >
            {p.label.brand}
          </text>
        </g>
      )}
      {p.label?.badge && (
        <rect x={p.label.y - p.label.h * 0.18} y={p.radius * 0.18} width={p.label.h * 0.36} height={p.radius * 0.26} rx={0.6} fill={p.label.badge.bg} />
      )}

      {p.petalHood && (
        <path
          d={`M${p.length},${-p.radius} L${p.length + hoodH},${-p.radius - 1} L${p.length + hoodH},${p.radius + 1} L${p.length},${p.radius} Z`}
          fill="#17171a"
        />
      )}

      {/* Shading over everything on the barrel */}
      <g clipPath={`url(#clip-${id})`}>
        <rect x={0} y={-maxR} width={p.length + 1} height={maxR * 2} fill={`url(#shade-${id})`} />
      </g>

      {/* Front element seen edge-on */}
      <ellipse
        cx={p.length - 0.4}
        cy={0}
        rx={Math.max(p.glass.bulge * 0.3, 1.4)}
        ry={p.glass.r}
        fill={`url(#glass-${id})`}
      />
      <path d={outline} fill="none" stroke={s.edge} strokeWidth={0.5} strokeOpacity={0.6} />
    </svg>
  );
}
