/** Six-blade aperture mark. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  const blades = Array.from({ length: 6 }, (_, i) => i * 60);
  return (
    <svg viewBox="-16 -16 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd58a" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <circle r="15" fill="none" stroke="url(#logo-g)" strokeWidth="2" />
      {blades.map((a) => (
        <path
          key={a}
          d="M0 -12.5 A12.5 12.5 0 0 1 10.8 -6.25 L2.6 -1.5 Z"
          fill="url(#logo-g)"
          opacity={0.9}
          transform={`rotate(${a})`}
        />
      ))}
    </svg>
  );
}
