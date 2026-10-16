"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import type { Lens, MountId } from "@/types/lens";
import { MOUNTS } from "@/data/mounts";
import type { SceneTargets } from "./LensScene";

const LensScene = dynamic(() => import("./LensScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">Loading 3D model…</div>
  ),
});

const FULL_STOPS = [1, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32, 40];

function stopList(widest: number, narrowest: number): number[] {
  if (widest >= narrowest) return [widest];
  const between = FULL_STOPS.filter((s) => s > widest * 1.05 && s < narrowest);
  return [widest, ...between, narrowest];
}

function focusDistanceLabel(t: number, minFocus: number): string {
  if (t >= 0.98) return "∞";
  const d = minFocus / Math.max(0.02, 1 - t);
  return d >= 10 ? `${d.toFixed(0)} m` : `${d.toFixed(2)} m`;
}

interface Props {
  lens: Lens;
  showControls?: boolean;
  className?: string;
  /** No frame or background, for placing the model directly on the page. */
  bare?: boolean;
}

export function LensViewer({ lens, showControls = true, className = "", bare = false }: Props) {
  const [mountId, setMountId] = useState<MountId>(lens.mounts[0]);
  const [zoom, setZoom] = useState(0);
  const [focus, setFocus] = useState(1);
  const [stopIdx, setStopIdx] = useState(0);
  const [demo, setDemo] = useState(!showControls);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showHood, setShowHood] = useState(false);
  const hasHood = !!lens.filterMm && !lens.categories.includes("cine") && !lens.categories.includes("fisheye") && lens.lengthMm > 35 && lens.diameterMm > 56;

  const stops = useMemo(() => stopList(lens.apertureMax, lens.apertureMin), [lens]);
  const isZoom = lens.focalMin !== lens.focalMax;
  const closed = stops.length > 1 ? Math.log(stops[stopIdx] / lens.apertureMax) / Math.log(lens.apertureMin / lens.apertureMax) : 0;

  const targets = useRef<SceneTargets>({ zoom, focus, closed, demo });
  targets.current = { zoom, focus, closed, demo };

  const focal = isZoom ? Math.round(lens.focalMin + (lens.focalMax - lens.focalMin) * zoom) : lens.focalMin;
  const stopPrefix = lens.tStop ? "T" : "f/";
  const minFocus = lens.minFocusM ?? Math.max(0.15, lens.focalMax / 400);

  const manual = (fn: () => void) => {
    setDemo(false);
    fn();
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div
        className={`relative w-full overflow-hidden ${
          bare
            ? "h-[380px] [mask-image:radial-gradient(closest-side,black_80%,transparent)] sm:h-[540px]"
            : "h-[380px] viewer-bg rounded-3xl border border-white/[0.08] sm:h-[500px]"
        }`}
      >
        <LensScene
          lens={lens}
          mountId={mountId}
          targets={targets}
          autoRotate={autoRotate}
          showHood={showHood}
          interactive={showControls}
        />
        {showControls && (
          <>
            <div className="pointer-events-none absolute left-4 top-4 flex gap-1.5 font-mono text-xs">
              <Readout label="FL" value={`${focal}mm`} />
              <Readout label={lens.tStop ? "T" : "F"} value={String(stops[stopIdx])} />
              <Readout label="FOCUS" value={focusDistanceLabel(focus, minFocus)} />
            </div>
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[11px] text-zinc-500 backdrop-blur">
              Drag to rotate · scroll to zoom
            </div>
            <div className="absolute right-4 top-4 flex gap-1.5">
              <IconButton label={autoRotate ? "Pause rotation" : "Auto-rotate"} onClick={() => setAutoRotate((r) => !r)}>
                {autoRotate ? (
                  <path d="M7 5v10M13 5v10" strokeLinecap="round" />
                ) : (
                  <path d="M16 10a6 6 0 1 1-2-4.5M16 3v3h-3" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </IconButton>
            </div>
          </>
        )}
      </div>

      {showControls && (
        <div className="panel grid gap-5 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <div className="eyebrow mb-2.5">Mount</div>
            <div className="flex flex-wrap gap-1.5">
              {lens.mounts.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMountId(m)}
                  className={`chip !text-sm ${m === mountId ? "chip-active" : ""}`}
                >
                  {MOUNTS[m].name}
                </button>
              ))}
            </div>
          </div>

          {isZoom && (
            <Slider
              label="Zoom"
              value={`${focal}mm`}
              min={0}
              max={1}
              step={0.01}
              current={zoom}
              onChange={(v) => manual(() => setZoom(v))}
              hint={lens.extensionMm > 0 ? `Barrel extends ${lens.extensionMm}mm` : "Internal zoom"}
            />
          )}
          <Slider
            label="Focus"
            value={focusDistanceLabel(focus, minFocus)}
            min={0}
            max={1}
            step={0.01}
            current={focus}
            onChange={(v) => manual(() => setFocus(v))}
            hint={`Closest focus ${minFocus.toFixed(2)} m`}
          />
          <Slider
            label="Aperture"
            value={`${stopPrefix}${stops[stopIdx]}`}
            min={0}
            max={Math.max(stops.length - 1, 0)}
            step={1}
            current={stopIdx}
            onChange={(v) => manual(() => setStopIdx(v))}
            hint={`${lens.bladeCount} blades · ${stopPrefix}${lens.apertureMax}–${lens.apertureMin}`}
          />

          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4 sm:col-span-2">
            <button type="button" onClick={() => setDemo((d) => !d)} className={`btn ${demo ? "btn-primary" : "btn-ghost"}`}>
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
                {demo ? <rect x="5" y="5" width="10" height="10" rx="1.5" /> : <path d="M6 4.5v11l9-5.5z" />}
              </svg>
              {demo ? "Stop animation" : "Play animation"}
            </button>
            {hasHood && (
              <button type="button" onClick={() => setShowHood((h) => !h)} className={`btn btn-ghost ${showHood ? "!border-accent/50 !text-accent-soft" : ""}`}>
                {showHood ? "Remove hood" : "Attach hood"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Slider(props: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  hint?: string;
  onChange: (v: number) => void;
}) {
  const fill = props.max > props.min ? ((props.current - props.min) / (props.max - props.min)) * 100 : 0;
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-baseline justify-between text-sm">
        <span className="eyebrow">{props.label}</span>
        <span className="font-mono text-sm text-accent-soft">{props.value}</span>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.current}
        onChange={(e) => props.onChange(Number(e.target.value))}
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
      />
      {props.hint && <span className="text-xs text-zinc-500">{props.hint}</span>}
    </label>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1 backdrop-blur">
      <span className="text-[10px] text-zinc-500">{label}</span>
      <span className="text-zinc-100">{value}</span>
    </span>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-black/40 text-zinc-300 backdrop-blur transition hover:border-white/20 hover:text-white"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
        {children}
      </svg>
    </button>
  );
}
