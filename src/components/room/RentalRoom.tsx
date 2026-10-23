"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BRANDS } from "@/data/brands";
import { MOUNTS } from "@/data/mounts";
import { LENSES } from "@/data/lenses";
import { apertureLabel, focalLabel, formatPrice } from "@/lib/format";
import { addToRental, clearRental, removeFromRental, useRental } from "@/lib/rental";
import type { SceneTargets } from "../three/LensScene";
import { dayRate, type Slot } from "./layout";
import type { HeldCamState, HeldState, RoomControls } from "./RoomScene";
import {
  CAMERAS,
  cameraRate,
  defaultLensFor,
  fit,
  focalAt,
  frameAspect,
  lensesFor,
  stopAt,
  viewfinderFov,
  type CameraId,
} from "./cameras";
import type { Lens } from "@/types/lens";

const RoomScene = dynamic(() => import("./RoomScene"), { ssr: false });

const BY_SLUG = new Map(LENSES.map((l) => [l.slug, l]));

type Phase = "loading" | "ready" | "inside";

export function RentalRoom() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [fonts, setFonts] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState<Slot | null>(null);
  const [held, setHeld] = useState<HeldState | null>(null);
  const [locked, setLocked] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [touchDevice, setTouchDevice] = useState(false);
  const [noLock, setNoLock] = useState(false);
  const [demo, setDemo] = useState(false);
  const [ui, setUi] = useState({ zoom: 0, focus: 1, closed: 0 });
  const [hoverCam, setHoverCam] = useState<CameraId | null>(null);
  const [heldCam, setHeldCam] = useState<HeldCamState | null>(null);
  const [viewing, setViewing] = useState(false);
  const [aspect, setAspect] = useState(16 / 9);
  const [hoverCar, setHoverCar] = useState(false);
  const [driving, setDriving] = useState(false);

  const bag = useRental();
  const targets = useRef<SceneTargets>({ zoom: 0, focus: 1, closed: 0, demo: false });
  const touch = useRef({ x: 0, y: 0 });
  const controls = useRef<RoomControls | null>(null);
  const heldRef = useRef(held);
  heldRef.current = held;
  const camRef = useRef({ heldCam, viewing, driving });
  camRef.current = { heldCam, viewing, driving };

  const hidden = useMemo(() => {
    const s = new Set(bag);
    if (held) s.add(held.slot.lens.slug);
    return s;
  }, [bag, held]);

  useEffect(() => {
    const onResize = () => setAspect(window.innerWidth / window.innerHeight);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const viewfinder = heldCam && viewing ? viewfinderFov(CAMERAS[heldCam.id], heldCam.lens, ui.zoom, aspect) : null;

  useEffect(() => {
    setTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    Promise.all([document.fonts.load('100px "Shrikhand"'), document.fonts.load('600 20px "Work Sans Variable"')])
      .catch(() => {})
      .finally(() => setFonts(true));
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;
    const id = setInterval(() => {
      setProgress((p) => {
        const cap = sceneReady ? 100 : fonts ? 92 : 40;
        const next = Math.min(cap, p + Math.max(1, (cap - p) * 0.12));
        if (next >= 100) setPhase("ready");
        return next;
      });
    }, 60);
    return () => clearInterval(id);
  }, [phase, fonts, sceneReady]);

  const release = useCallback(() => {
    setHeld(null);
    setDemo(false);
    if (!window.matchMedia("(pointer: coarse)").matches) controls.current?.lock();
  }, []);

  const grab = useCallback((slot: Slot) => {
    targets.current = { zoom: 0, focus: 1, closed: 0, demo: false };
    setUi({ zoom: 0, focus: 1, closed: 0 });
    setDemo(false);
    setHovered(null);
    setHeld({ slot });
    if (document.pointerLockElement) document.exitPointerLock();
  }, []);

  const resetTargets = () => {
    targets.current = { zoom: 0, focus: 1, closed: 0, demo: false };
    setUi({ zoom: 0, focus: 1, closed: 0 });
    setDemo(false);
  };

  const grabCam = useCallback(
    (id: CameraId) => {
      resetTargets();
      setHoverCam(null);
      setViewing(false);
      setHeldCam({ id, lens: defaultLensFor(CAMERAS[id], bag) });
      if (document.pointerLockElement) document.exitPointerLock();
    },
    [bag],
  );

  const releaseCam = useCallback(() => {
    setHeldCam(null);
    setViewing(false);
    setDemo(false);
    targets.current.demo = false;
    if (!window.matchMedia("(pointer: coarse)").matches) controls.current?.lock();
  }, []);

  const enterCar = useCallback(() => {
    setHoverCar(false);
    setDriving(true);
  }, []);

  const exitCar = useCallback(() => {
    setDriving(false);
    if (!window.matchMedia("(pointer: coarse)").matches) controls.current?.lock();
  }, []);

  const setViewfinder = useCallback((on: boolean) => {
    setViewing(on);
    targets.current.demo = false;
    setDemo(false);
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (on) controls.current?.lock();
    else if (document.pointerLockElement) document.exitPointerLock();
  }, []);

  const swapLens = (lens: Lens) => {
    if (!heldCam) return;
    resetTargets();
    setHeldCam({ ...heldCam, lens });
  };

  const viewZoom = useCallback((delta: number) => {
    const z = Math.min(1, Math.max(0, targets.current.zoom + delta));
    targets.current.zoom = z;
    setUi((u) => ({ ...u, zoom: z }));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || (e.target instanceof HTMLInputElement && e.target.type !== "range")) return;
      const { heldCam: cam, viewing: v, driving: drive } = camRef.current;
      if (drive) {
        if (e.code === "KeyE" || e.code === "Escape" || e.code === "KeyQ") exitCar();
        return;
      }
      if (cam) {
        if (e.code === "KeyV") setViewfinder(!v);
        else if (v && (e.code === "KeyQ" || e.code === "Escape")) setViewfinder(false);
        else if (!v && (e.code === "KeyE" || e.code === "Escape" || e.code === "KeyQ")) releaseCam();
        return;
      }
      if (!heldRef.current) return;
      if (e.code === "KeyE" || e.code === "Escape" || e.code === "KeyQ") release();
      if (e.code === "KeyR") addToRental(heldRef.current.slot.lens.slug);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [release, releaseCam, setViewfinder, exitCar]);

  const onLockChange = useCallback((on: boolean) => {
    setLocked(on);
    // Esc while looking through the camera drops the pointer lock without a keydown.
    if (!on && camRef.current.viewing && !window.matchMedia("(pointer: coarse)").matches) setViewing(false);
  }, []);

  const enter = () => {
    setPhase("inside");
    if (!touchDevice) controls.current?.lock();
  };

  const setTarget = (k: "zoom" | "focus" | "closed", v: number) => {
    targets.current[k] = v;
    setUi((u) => ({ ...u, [k]: v }));
  };
  const toggleDemo = () => {
    targets.current.demo = !demo;
    setDemo(!demo);
  };

  const bagLenses = bag.map((s) => BY_SLUG.get(s)).filter((l) => !!l);
  const total = bagLenses.reduce((sum, l) => sum + dayRate(l), 0);
  const inside = phase === "inside";
  const camOnly = !!heldCam && !viewing;
  const busy = !!held || camOnly || driving;
  const showPause = inside && !busy && !viewing && !locked && !touchDevice && !noLock;
  const dragMode = touchDevice || noLock;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#101011] font-sans text-[#e7d7c1] select-none">
      {fonts && (
        <RoomScene
          active={inside}
          held={held}
          heldCam={heldCam}
          viewfinder={viewfinder}
          hidden={hidden}
          hovered={hovered}
          targets={targets}
          touch={touch}
          controls={controls}
          onHover={setHovered}
          onGrab={grab}
          onHoverCam={setHoverCam}
          onGrabCam={grabCam}
          onViewZoom={viewZoom}
          onLockChange={onLockChange}
          onLockError={() => setNoLock(true)}
          onReady={() => setSceneReady(true)}
          driving={driving}
          onHoverCar={setHoverCar}
          onEnterCar={enterCar}
        />
      )}

      {/* Crosshair and the tag for whatever it is pointing at */}
      {inside && !busy && !viewing && locked && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className={`h-2 w-2 rounded-full border border-black/40 transition ${hovered || hoverCam || hoverCar ? "scale-150 bg-[#d4af37]" : "bg-[#e7d7c1]"}`} />
        </div>
      )}
      {inside && !busy && !viewing && hovered && <HoverTag slot={hovered} />}
      {inside && !busy && !viewing && hoverCam && <CameraTag id={hoverCam} />}
      {inside && !busy && !viewing && hoverCar && <CarTag />}
      {inside && driving && <DriveHUD touch={dragMode} onExit={exitCar} />}

      {inside && heldCam && viewing && (
        <ViewfinderHUD
          state={heldCam}
          zoom={ui.zoom}
          closed={ui.closed}
          screenAspect={aspect}
          touch={dragMode}
          onExit={() => setViewfinder(false)}
        />
      )}

      {/* Top bar */}
      {inside && !viewing && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 sm:p-6">
          <div className="pointer-events-auto flex flex-col gap-1">
            <span className="font-display text-2xl leading-none text-[#e7d7c1] drop-shadow-[0_2px_6px_rgb(0_0_0/0.5)] sm:text-3xl">
              Lens Catalog
            </span>
            <Link href="/lenses" className="text-xs text-[#e7d7c1]/70 underline underline-offset-4 hover:text-[#e7d7c1]">
              Prefer a list? Browse all {LENSES.length} lenses
            </Link>
          </div>
          <button
            onClick={() => {
              setBagOpen((o) => !o);
              if (document.pointerLockElement) document.exitPointerLock();
            }}
            className="pointer-events-auto flex items-center gap-2 rounded-full border-2 border-[#e7d7c1]/30 bg-[#101011]/80 px-4 py-2 text-sm backdrop-blur hover:border-[#e7d7c1]/60"
          >
            <BagIcon />
            <span>Bag</span>
            <span className="rounded-full bg-[#c0392b] px-2 py-0.5 text-xs font-semibold">{bag.length}</span>
            {bag.length > 0 && <span className="text-[#e7d7c1]/70">${total}/day</span>}
          </button>
        </div>
      )}

      {inside && bagOpen && (
        <BagPanel
          lenses={bagLenses}
          total={total}
          onClose={() => setBagOpen(false)}
        />
      )}

      {/* Bottom hint */}
      {inside && !busy && !viewing && locked && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full bg-[#101011]/70 px-5 py-2 text-xs text-[#e7d7c1]/80 backdrop-blur">
            <span>
              <Key>W</Key>
              <Key>A</Key>
              <Key>S</Key>
              <Key>D</Key> walk
            </span>
            <span>
              <Key>Shift</Key> faster
            </span>
            <span>
              <Key>Ctrl</Key> crouch
            </span>
            <span>mouse to look</span>
            <span>
              <Key>E</Key> pick up
            </span>
            <span>
              <Key>Esc</Key> pause
            </span>
          </div>
        </div>
      )}

      {showPause && !bagOpen && (
        <button
          onClick={() => controls.current?.lock()}
          className="absolute inset-0 flex items-center justify-center bg-[#101011]/40"
        >
          <span className="rounded-2xl border-2 border-[#e7d7c1]/30 bg-[#101011]/85 px-6 py-4 text-center backdrop-blur">
            <span className="block font-display text-2xl">Paused</span>
            <span className="mt-1 block text-sm text-[#e7d7c1]/70">Click to keep walking</span>
          </span>
        </button>
      )}

      {inside && touchDevice && !busy && <TouchPad touch={touch} />}
      {inside && dragMode && !busy && !viewing && (
        <div className={`pointer-events-none absolute inset-x-0 flex justify-center ${touchDevice ? "bottom-56" : "bottom-6"}`}>
          <span className="rounded-full bg-[#101011]/70 px-5 py-2 text-xs text-[#e7d7c1]/80 backdrop-blur">
            {touchDevice ? (
              "Drag to look · tap a lens to pick it up"
            ) : (
              <>
                <Key>W</Key>
                <Key>A</Key>
                <Key>S</Key>
                <Key>D</Key> walk · <Key>Ctrl</Key> crouch · drag to look · click a lens to pick it up
              </>
            )}
          </span>
        </div>
      )}

      {held && (
        <InspectPanel
          slot={held.slot}
          inBag={bag.includes(held.slot.lens.slug)}
          ui={ui}
          demo={demo}
          onTarget={setTarget}
          onDemo={toggleDemo}
          onPutBack={release}
        />
      )}

      {heldCam && !viewing && (
        <CameraPanel
          state={heldCam}
          bag={bag}
          ui={ui}
          demo={demo}
          onTarget={setTarget}
          onDemo={toggleDemo}
          onLens={swapLens}
          onLook={() => setViewfinder(true)}
          onPutBack={releaseCam}
        />
      )}

      {phase !== "inside" && (
        <Intro progress={Math.round(progress)} ready={phase === "ready"} onEnter={enter} touch={touchDevice} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Intro({ progress, ready, onEnter, touch }: { progress: number; ready: boolean; onEnter: () => void; touch: boolean }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#040f0f]/[0.97] p-6">
      <div className="flex max-w-xl flex-col items-center text-center">
        <h1 className="text-5xl text-[#e7d7c1] sm:text-7xl">Lens Catalog</h1>
        <p className="mt-2 font-display text-xl text-[#c0392b] sm:text-2xl">a rental shop you can walk through</p>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#e7d7c1]/80">
          {LENSES.length} lenses on the shelves, from Sony G Masters to Sirui anamorphics. Cine glass and the cameras are in
          the back room, through the door on the right. Keep going through the next door into the 1000 m² warehouse — a RAM TRX
          is parked there. Sit in it with E and drive with WASD. Take a lens down, turn it in your hands, or pick up a Sony FX3
          or a RED Komodo and look through it.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-2 text-left text-sm text-[#e7d7c1]/80">
          {touch ? (
            <>
              <span>Drag</span>
              <span>look around</span>
              <span>Pad</span>
              <span>walk</span>
              <span>Tap a lens</span>
              <span>pick it up</span>
            </>
          ) : (
            <>
              <span>
                <Key>W</Key>
                <Key>A</Key>
                <Key>S</Key>
                <Key>D</Key>
              </span>
              <span>walk</span>
              <span>
                <Key>Ctrl</Key>
              </span>
              <span>crouch, stand up</span>
              <span>Mouse</span>
              <span>look around</span>
              <span>
                <Key>E</Key>
              </span>
              <span>pick up, put back</span>
              <span>
                <Key>R</Key>
              </span>
              <span>add to bag</span>
              <span>
                <Key>V</Key>
              </span>
              <span>look through a camera</span>
              <span>
                <Key>E</Key>
              </span>
              <span>sit in the RAM, then WASD to drive</span>
            </>
          )}
        </div>

        <div className="mt-10 h-14">
          {ready ? (
            <button
              onClick={onEnter}
              className="rounded-full bg-[#c0392b] px-8 py-3.5 font-display text-xl text-[#e7d7c1] shadow-[0_6px_0_#7d2219] transition hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_#7d2219]"
            >
              Enter the shop
            </button>
          ) : (
            <p className="text-sm text-[#e7d7c1]/70">stocking the shelves {progress}%</p>
          )}
        </div>
        <Link href="/lenses" className="mt-4 text-xs text-[#e7d7c1]/70 underline underline-offset-4 hover:text-[#e7d7c1]">
          or browse the plain list
        </Link>
      </div>
    </div>
  );
}

function HoverTag({ slot }: { slot: Slot }) {
  const l = slot.lens;
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 mt-6 -translate-x-1/2">
      <div className="min-w-56 rounded-xl border-2 border-[#d4af37]/60 bg-[#101011]/85 px-4 py-3 text-center backdrop-blur">
        <div className="text-[11px] text-[#d4af37]">{BRANDS[l.brand].name}</div>
        <div className="text-sm font-semibold text-[#e7d7c1]">{l.name}</div>
        <div className="mt-1 text-xs text-[#e7d7c1]/70">
          {focalLabel(l)} · {apertureLabel(l)} · ${dayRate(l)}/day
        </div>
        <div className="mt-2 text-[11px] text-[#e7d7c1]/80">
          <Key>E</Key> or click to pick up
        </div>
      </div>
    </div>
  );
}

function CarTag() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 mt-6 -translate-x-1/2">
      <div className="min-w-56 rounded-xl border-2 border-[#d4af37]/60 bg-[#101011]/85 px-4 py-3 text-center backdrop-blur">
        <div className="text-[11px] text-[#d4af37]">RAM</div>
        <div className="text-sm font-semibold text-[#e7d7c1]">1500 TRX</div>
        <div className="mt-1 text-xs text-[#e7d7c1]/70">Crew cab · warehouse runner</div>
        <div className="mt-2 text-[11px] text-[#e7d7c1]/80">
          <Key>E</Key> or click to sit and drive
        </div>
      </div>
    </div>
  );
}

function DriveHUD({ touch, onExit }: { touch: boolean; onExit: () => void }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full bg-[#101011]/75 px-5 py-2 text-xs text-[#e7d7c1]/85 backdrop-blur">
          {touch ? (
            <span>Pad to steer and throttle · get out with the button</span>
          ) : (
            <>
              <span>
                <Key>W</Key> gas <Key>S</Key> brake / reverse
              </span>
              <span>
                <Key>A</Key>
                <Key>D</Key> steer
              </span>
              <span>
                <Key>Shift</Key> faster
              </span>
              <span>mouse look</span>
              <span>
                <Key>E</Key> get out
              </span>
            </>
          )}
        </div>
      </div>
      {touch && (
        <button
          onClick={onExit}
          className="absolute right-4 top-20 rounded-full border-2 border-[#e7d7c1]/30 bg-[#101011]/80 px-4 py-2 text-sm backdrop-blur"
        >
          Get out
        </button>
      )}
    </>
  );
}

function CameraTag({ id }: { id: CameraId }) {
  const c = CAMERAS[id];
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 mt-6 -translate-x-1/2">
      <div className="min-w-56 rounded-xl border-2 border-[#d4af37]/60 bg-[#101011]/85 px-4 py-3 text-center backdrop-blur">
        <div className="text-[11px] text-[#d4af37]">{c.brand}</div>
        <div className="text-sm font-semibold text-[#e7d7c1]">{c.name}</div>
        <div className="mt-1 text-xs text-[#e7d7c1]/70">
          {MOUNTS[c.mount].name} · {c.sensor.label} · ${cameraRate(c)}/day
        </div>
        <div className="mt-2 text-[11px] text-[#e7d7c1]/80">
          <Key>E</Key> or click to pick up and try lenses on it
        </div>
      </div>
    </div>
  );
}

function CameraPanel({
  state,
  bag,
  ui,
  demo,
  onTarget,
  onDemo,
  onLens,
  onLook,
  onPutBack,
}: {
  state: HeldCamState;
  bag: string[];
  ui: { zoom: number; focus: number; closed: number };
  demo: boolean;
  onTarget: (k: "zoom" | "focus" | "closed", v: number) => void;
  onDemo: () => void;
  onLens: (l: Lens) => void;
  onLook: () => void;
  onPutBack: () => void;
}) {
  const cam = CAMERAS[state.id];
  const l = state.lens;
  const lensFit = fit(cam, l);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const options = useMemo(() => {
    const inBag = new Set(bag);
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return lensesFor(cam)
      .filter((x) => {
        const s = `${BRANDS[x.brand].name} ${x.name}`.toLowerCase();
        return words.every((w) => s.includes(w));
      })
      .sort((a, b) => (inBag.has(b.slug) ? 1 : 0) - (inBag.has(a.slug) ? 1 : 0))
      .slice(0, 80);
  }, [cam, bag, query]);

  const focal = focalAt(l, ui.zoom);
  const stop = +stopAt(l, ui.closed).toFixed(1);
  const crop = 43.27 / Math.hypot(cam.sensor.w, cam.sensor.h);
  const mountText = !lensFit
    ? ""
    : lensFit.adapter === 0
      ? `Native ${MOUNTS[cam.mount].name}`
      : `${MOUNTS[lensFit.mount].name} to ${MOUNTS[cam.mount].name} adapter, ${lensFit.adapter.toFixed(1)} mm`;

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center md:justify-start md:pl-6">
        <span className="rounded-full bg-[#101011]/70 px-4 py-1.5 text-xs text-[#e7d7c1]/80 backdrop-blur">
          Drag to turn it · scroll to bring it closer · <Key>V</Key> look through it · <Key>E</Key> put back
        </span>
      </div>
      <aside className="absolute bottom-16 right-3 top-20 flex w-[min(380px,calc(100vw-24px))] flex-col overflow-y-auto rounded-3xl bg-[#e7d7c1] p-5 text-[#101011] shadow-2xl md:bottom-6 md:right-6 md:top-24">
        <div className="text-xs font-semibold text-[#c0392b]">{cam.brand} · cinema camera</div>
        <h2 className="mt-1 font-display text-2xl leading-tight">{cam.name}</h2>

        <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-[#101011]/10 text-sm">
          {[
            ["Sensor", cam.sensor.label],
            ["Mount", MOUNTS[cam.mount].name],
            ["Records", cam.recording],
            ["Body weight", `${cam.weightG} g`],
            ["Price new", formatPrice(cam.priceUsd)],
            ["Rent", `$${cameraRate(cam)} / day`],
          ].map(([k, v]) => (
            <div key={k} className="bg-[#efe3cf] px-3 py-2">
              <dt className="text-[11px] text-[#101011]/60">{k}</dt>
              <dd className="font-medium leading-snug">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 rounded-xl border-2 border-[#101011]/15 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] text-[#101011]/60">Lens on the camera</div>
              <div className="truncate text-sm font-semibold">
                {BRANDS[l.brand].name} {l.name}
              </div>
              <div className="text-xs text-[#101011]/60">{mountText}</div>
            </div>
            <button
              onClick={() => setPicking((p) => !p)}
              className="shrink-0 rounded-full border-2 border-[#101011] px-3 py-1 text-xs font-semibold"
            >
              {picking ? "Close" : "Change"}
            </button>
          </div>
          {picking && (
            <div className="mt-3 flex flex-col gap-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${lensesFor(cam).length} lenses that fit`}
                className="rounded-lg border-2 border-[#101011]/20 bg-[#efe3cf] px-3 py-1.5 text-sm outline-none focus:border-[#c0392b]"
              />
              <ul className="flex max-h-56 flex-col divide-y divide-[#101011]/10 overflow-y-auto">
                {options.map((x) => {
                  const f = fit(cam, x);
                  return (
                    <li key={x.slug}>
                      <button
                        onClick={() => {
                          onLens(x);
                          setPicking(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 py-1.5 text-left text-sm hover:text-[#c0392b] ${x.slug === l.slug ? "font-semibold text-[#c0392b]" : ""}`}
                      >
                        <span className="min-w-0 truncate">
                          {BRANDS[x.brand].name} {x.name}
                        </span>
                        <span className="shrink-0 text-[11px] text-[#101011]/50">
                          {bag.includes(x.slug) ? "in bag" : f && f.adapter > 0 ? `${f.mount} adapter` : "native"}
                        </span>
                      </button>
                    </li>
                  );
                })}
                {options.length === 0 && <li className="py-2 text-sm text-[#101011]/60">Nothing that fits matches that.</li>}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 text-sm">
          <div className="text-xs text-[#101011]/60">
            {Math.round(focal)}mm on this sensor frames like {Math.round(focal * crop)}mm on full frame
            {l.squeeze ? `, ${l.squeeze}x squeeze` : ""}.
          </div>
          {l.focalMin !== l.focalMax && (
            <Slider label="Zoom" value={ui.zoom} display={`${Math.round(focal)}mm`} onChange={(v) => onTarget("zoom", v)} disabled={demo} />
          )}
          <Slider
            label="Focus"
            value={ui.focus}
            display={ui.focus > 0.98 ? "∞" : ui.focus < 0.02 ? "closest" : `${Math.round(ui.focus * 100)}%`}
            onChange={(v) => onTarget("focus", v)}
            disabled={demo}
          />
          <Slider
            label="Aperture"
            value={ui.closed}
            display={`${l.tStop ? "T" : "f/"}${stop}`}
            onChange={(v) => onTarget("closed", v)}
            disabled={demo}
          />
          <button onClick={onDemo} className="self-start text-xs font-semibold text-[#c0392b] underline underline-offset-4">
            {demo ? "Stop the animation" : "Play all three"}
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-6">
          <button
            onClick={onLook}
            className="rounded-full bg-[#c0392b] px-5 py-2.5 font-display text-lg text-[#e7d7c1] shadow-[0_4px_0_#7d2219] active:translate-y-0.5 active:shadow-[0_2px_0_#7d2219]"
          >
            Look through it
          </button>
          <div className="flex gap-2">
            <button onClick={onPutBack} className="flex-1 rounded-full bg-[#101011] px-4 py-2.5 text-sm font-semibold text-[#e7d7c1]">
              Put it back
            </button>
            {bag.includes(l.slug) ? (
              <button
                onClick={() => removeFromRental(l.slug)}
                className="flex-1 rounded-full border-2 border-[#101011]/20 px-4 py-2.5 text-sm font-semibold"
              >
                Lens in bag · remove
              </button>
            ) : (
              <button
                onClick={() => addToRental(l.slug)}
                className="flex-1 rounded-full border-2 border-[#101011]/20 px-4 py-2.5 text-sm font-semibold hover:border-[#101011]/50"
              >
                Bag this lens
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function timecode(seconds: number, fps: number) {
  const f = Math.floor((seconds % 1) * fps);
  const s = Math.floor(seconds);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
}

function ViewfinderHUD({
  state,
  zoom,
  closed,
  screenAspect,
  touch,
  onExit,
}: {
  state: HeldCamState;
  zoom: number;
  closed: number;
  screenAspect: number;
  touch: boolean;
  onExit: () => void;
}) {
  const cam = CAMERAS[state.id];
  const l = state.lens;
  const [recAt, setRecAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyR" || e.repeat) return;
      const t = performance.now();
      setNow(t);
      setRecAt((r) => (r === null ? t : null));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (recAt === null) return;
    const id = setInterval(() => setNow(performance.now()), 1000 / 24);
    return () => clearInterval(id);
  }, [recAt]);

  const rec = recAt !== null;
  const tc = timecode(rec ? Math.max(0, now - recAt) / 1000 : 0, 24);
  const focal = Math.round(focalAt(l, zoom));
  const stopN = stopAt(l, closed);
  const stop = `${l.tStop || cam.id === "komodo" ? "T" : "F"}${stopN.toFixed(1)}`;
  // Exposure follows the iris, softened so the picture never goes fully black or white.
  const brightness = Math.min(2, Math.max(0.22, Math.pow(2, 2 * Math.log2(2.8 / stopN) * 0.45)));

  const frame = frameAspect(cam, l);
  const box: React.CSSProperties =
    frame > screenAspect
      ? { left: 0, right: 0, top: `${((1 - screenAspect / frame) / 2) * 100}%`, bottom: `${((1 - screenAspect / frame) / 2) * 100}%` }
      : { top: 0, bottom: 0, left: `${((1 - frame / screenAspect) / 2) * 100}%`, right: `${((1 - frame / screenAspect) / 2) * 100}%` };

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-0" style={{ backdropFilter: `brightness(${brightness.toFixed(2)})` }} />
      {/* Matte outside the recorded frame */}
      <div className="absolute inset-0 bg-[#000]/85" style={{ clipPath: matte(box) }} />

      <div className="absolute font-mono text-[13px] text-[#fff] [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]" style={box}>
        {cam.id === "fx3" ? (
          <>
            <div className="absolute left-4 top-3 flex items-center gap-3">
              {rec ? (
                <span className="flex items-center gap-1.5 rounded bg-[#d0201a] px-2 py-0.5 font-semibold">● REC {tc}</span>
              ) : (
                <span className="rounded border border-[#fff]/80 px-2 py-0.5">STBY</span>
              )}
              <span>4K 23.98p</span>
              <span className="text-[#fff]/80">S-Cinetone</span>
            </div>
            <div className="absolute right-4 top-3 flex items-center gap-3">
              <span>{l.squeeze ? `${l.squeeze}x desqueeze` : "FF"}</span>
              <span className="inline-flex h-3.5 w-7 items-center rounded-sm border border-[#fff] p-px">
                <span className="h-full w-4/5 bg-[#fff]" />
              </span>
            </div>
            <div className="absolute left-1/2 top-1/2 h-16 w-24 -translate-x-1/2 -translate-y-1/2">
              {["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "left-0 bottom-0 border-l-2 border-b-2", "right-0 bottom-0 border-r-2 border-b-2"].map((c) => (
                <span key={c} className={`absolute h-3 w-3 border-[#fff] ${c}`} />
              ))}
            </div>
            <div className="absolute inset-x-4 bottom-3 flex items-center justify-center gap-6 text-sm">
              <span>1/48</span>
              <span>{stop}</span>
              <span>ISO {cam.iso}</span>
              <span>{focal}mm</span>
              <span>WB 5600K</span>
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-x-0 top-0 flex items-stretch justify-between bg-[#000]/75 text-[12px]">
              {[
                ["FPS", cam.fps],
                ["ISO", String(cam.iso)],
                ["SHUTTER", "180°"],
                ["IRIS", stop],
                ["WB", "5600K"],
                ["RES", l.squeeze ? `6K ANA ${l.squeeze}x` : "6K 17:9"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-1 flex-col items-center border-r border-[#fff]/15 px-2 py-1 last:border-r-0">
                  <span className="text-[9px] text-[#fff]/55">{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#fff]/80">+</div>
            <div className="absolute inset-[12%] border border-dashed border-[#fff]/25" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[#000]/75 px-3 py-1 text-[12px]">
              <span className={rec ? "font-semibold text-[#ff3b30]" : "text-[#fff]/70"}>{rec ? "● REC" : "STBY"}</span>
              <span className="truncate px-2 text-[#fff]/70">
                {BRANDS[l.brand].name} {l.name} · {focal}mm
              </span>
              <span>{tc}</span>
            </div>
          </>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-2 flex justify-center">
        <span className="pointer-events-auto flex items-center gap-3 rounded-full bg-[#101011]/75 px-4 py-1.5 font-sans text-xs text-[#e7d7c1]/85 backdrop-blur">
          {touch ? (
            <>
              <span>Drag to look · pad to walk</span>
              <button onClick={() => setRecAt((r) => (r === null ? performance.now() : null))} className="font-semibold text-[#ff6b5f]">
                {rec ? "Stop" : "Record"}
              </button>
              <button onClick={onExit} className="font-semibold underline underline-offset-2">
                Lower camera
              </button>
            </>
          ) : (
            <>
              <span>
                <Key>W</Key>
                <Key>A</Key>
                <Key>S</Key>
                <Key>D</Key> walk
              </span>
              {l.focalMin !== l.focalMax && <span>scroll to zoom</span>}
              <span>
                <Key>R</Key> record
              </span>
              <span>
                <Key>V</Key> lower camera
              </span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

/** Clip path that covers the screen except the given frame box (an even-odd hole). */
function matte(box: React.CSSProperties) {
  const v = (x: string | number | undefined) => (typeof x === "string" ? x : "0%");
  const t = v(box.top);
  const b = `calc(100% - ${v(box.bottom)})`;
  const l = v(box.left);
  const r = `calc(100% - ${v(box.right)})`;
  return `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${l} ${t}, ${l} ${b}, ${r} ${b}, ${r} ${t}, ${l} ${t})`;
}

function InspectPanel({
  slot,
  inBag,
  ui,
  demo,
  onTarget,
  onDemo,
  onPutBack,
}: {
  slot: Slot;
  inBag: boolean;
  ui: { zoom: number; focus: number; closed: number };
  demo: boolean;
  onTarget: (k: "zoom" | "focus" | "closed", v: number) => void;
  onDemo: () => void;
  onPutBack: () => void;
}) {
  const l = slot.lens;
  const zoom = l.focalMin !== l.focalMax;
  const focal = Math.round(l.focalMin * Math.pow(l.focalMax / l.focalMin, ui.zoom));
  const stop = +(l.apertureMax * Math.pow(l.apertureMin / l.apertureMax, ui.closed)).toFixed(1);
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center md:justify-start md:pl-6">
        <span className="rounded-full bg-[#101011]/70 px-4 py-1.5 text-xs text-[#e7d7c1]/80 backdrop-blur">
          Drag to turn it · scroll to bring it closer · <Key>E</Key> put back
        </span>
      </div>
      <aside className="absolute bottom-16 right-3 top-20 flex w-[min(360px,calc(100vw-24px))] flex-col overflow-y-auto rounded-3xl bg-[#e7d7c1] p-5 text-[#101011] shadow-2xl md:bottom-6 md:right-6 md:top-24">
        <div className="text-xs font-semibold text-[#c0392b]">
          {BRANDS[l.brand].name}
          {l.series ? ` · ${l.series}` : ""}
        </div>
        <h2 className="mt-1 font-display text-2xl leading-tight">{l.name}</h2>

        <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-[#101011]/10 text-sm">
          {[
            ["Focal length", focalLabel(l)],
            ["Aperture", apertureLabel(l)],
            ["Weight", `${l.weightG} g`],
            ["Mount", l.mounts.map((m) => MOUNTS[m].name).join(", ")],
            ["Price new", formatPrice(l.priceUsd)],
            ["Rent", `$${dayRate(l)} / day`],
          ].map(([k, v]) => (
            <div key={k} className="bg-[#efe3cf] px-3 py-2">
              <dt className="text-[11px] text-[#101011]/60">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-col gap-3 text-sm">
          {zoom && (
            <Slider label="Zoom" value={ui.zoom} display={`${focal}mm`} onChange={(v) => onTarget("zoom", v)} disabled={demo} />
          )}
          <Slider
            label="Focus"
            value={ui.focus}
            display={ui.focus > 0.98 ? "∞" : ui.focus < 0.02 ? "closest" : `${Math.round(ui.focus * 100)}%`}
            onChange={(v) => onTarget("focus", v)}
            disabled={demo}
          />
          <Slider
            label="Aperture"
            value={ui.closed}
            display={`${l.tStop ? "T" : "f/"}${stop}`}
            onChange={(v) => onTarget("closed", v)}
            disabled={demo}
          />
          <button onClick={onDemo} className="self-start text-xs font-semibold text-[#c0392b] underline underline-offset-4">
            {demo ? "Stop the animation" : "Play all three"}
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-6">
          {inBag ? (
            <button
              onClick={() => removeFromRental(l.slug)}
              className="rounded-full border-2 border-[#101011] px-5 py-2.5 text-sm font-semibold"
            >
              In your bag · remove
            </button>
          ) : (
            <button
              onClick={() => addToRental(l.slug)}
              className="rounded-full bg-[#c0392b] px-5 py-2.5 font-display text-lg text-[#e7d7c1] shadow-[0_4px_0_#7d2219] active:translate-y-0.5 active:shadow-[0_2px_0_#7d2219]"
            >
              Add to bag · ${dayRate(l)}/day
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={onPutBack} className="flex-1 rounded-full bg-[#101011] px-4 py-2.5 text-sm font-semibold text-[#e7d7c1]">
              {inBag ? "Done" : "Put it back"}
            </button>
            <Link
              href={`/lenses/${l.slug}`}
              className="flex-1 rounded-full border-2 border-[#101011]/20 px-4 py-2.5 text-center text-sm font-semibold hover:border-[#101011]/50"
            >
              Full specs
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

function BagPanel({
  lenses,
  total,
  onClose,
}: {
  lenses: { slug: string; brand: keyof typeof BRANDS; name: string }[];
  total: number;
  onClose: () => void;
}) {
  return (
    <aside className="absolute right-3 top-20 z-10 w-[min(360px,calc(100vw-24px))] rounded-3xl bg-[#e7d7c1] p-5 text-[#101011] shadow-2xl sm:right-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Your bag</h2>
        <button onClick={onClose} className="rounded-full px-2 text-xl leading-none hover:bg-[#101011]/10" aria-label="Close">
          ×
        </button>
      </div>
      {lenses.length === 0 ? (
        <p className="mt-3 text-sm text-[#101011]/70">Empty. Pick a lens off a shelf and add it.</p>
      ) : (
        <>
          <ul className="mt-3 flex max-h-72 flex-col divide-y divide-[#101011]/10 overflow-y-auto">
            {lenses.map((l) => {
              const lens = BY_SLUG.get(l.slug)!;
              return (
                <li key={l.slug} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {BRANDS[l.brand].name} {l.name}
                    </div>
                    <div className="text-xs text-[#101011]/60">${dayRate(lens)}/day</div>
                  </div>
                  <button
                    onClick={() => removeFromRental(l.slug)}
                    className="shrink-0 text-xs font-semibold text-[#c0392b] underline underline-offset-2"
                  >
                    Put back
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t-2 border-[#101011] pt-3">
            <span className="text-sm">Per day</span>
            <span className="font-display text-2xl">${total}</span>
          </div>
          <p className="mt-1 text-xs text-[#101011]/60">
            Estimated at about 2% of the new price per day. This is a demo, so nothing is charged.
          </p>
          <button onClick={clearRental} className="mt-3 text-xs font-semibold text-[#c0392b] underline underline-offset-4">
            Put everything back
          </button>
        </>
      )}
    </aside>
  );
}

function Slider({
  label,
  value,
  display,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  display: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1 ${disabled ? "opacity-50" : ""}`}>
      <span className="flex justify-between text-xs">
        <span className="font-semibold">{label}</span>
        <span className="font-mono">{display}</span>
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(+e.target.value)}
        style={{ "--fill": `${value * 100}%` } as React.CSSProperties}
      />
    </label>
  );
}

function TouchPad({ touch }: { touch: React.RefObject<{ x: number; y: number }> }) {
  const set = (x: number, y: number) => {
    touch.current = { x, y };
  };
  const btn = (label: string, x: number, y: number, cls: string) => (
    <button
      aria-label={label}
      className={`absolute flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#e7d7c1]/30 bg-[#101011]/70 text-xl backdrop-blur active:bg-[#c0392b] ${cls}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        set(x, y);
      }}
      onPointerUp={() => set(0, 0)}
      onPointerCancel={() => set(0, 0)}
    >
      {label}
    </button>
  );
  return (
    <div className="absolute bottom-6 left-6 h-44 w-44">
      {btn("↑", 0, 1, "left-1/2 top-0 -translate-x-1/2")}
      {btn("↓", 0, -1, "bottom-0 left-1/2 -translate-x-1/2")}
      {btn("←", -1, 0, "left-0 top-1/2 -translate-y-1/2")}
      {btn("→", 1, 0, "right-0 top-1/2 -translate-y-1/2")}
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-flex min-w-6 items-center justify-center rounded-md border border-current/40 px-1.5 py-0.5 font-sans text-[11px] font-semibold">
      {children}
    </kbd>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <path d="M4 7h12l-1 10H5L4 7Z" strokeLinejoin="round" />
      <path d="M7.5 7V5.5a2.5 2.5 0 0 1 5 0V7" />
    </svg>
  );
}
