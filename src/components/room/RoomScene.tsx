"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import type { Lens } from "@/types/lens";
import { LENSES as ALL_LENSES } from "@/data/lenses";
import { LensModel, type AnimState } from "../three/LensModel";
import type { SceneTargets } from "../three/LensScene";
import {
  APPLE_BOXES,
  ARMCHAIR,
  BOARD_TOPS,
  CAMERA_BAR,
  CHAIR,
  CINE,
  COUNTER,
  DOOR,
  EYE,
  GATE,
  ROOM,
  SOFTBOXES,
  START,
  TABLE,
  UNIT_DEPTH,
  UNIT_TOP,
  UNIT_WIDTH,
  WALL,
  WARE,
  WARE_CRATES,
  roomLayout,
  type Slot,
  type Unit,
} from "./layout";
import { CAMERAS, CAMERA_LIST, cameraRate, fit, focalAt, type CameraId } from "./cameras";
import { CameraWithLens, rigLength } from "./CameraModels";
import { RAM, RamTruck, defaultVehicle, type VehiclePose } from "./RamTruck";
import { Armchair, CeilingFan, CineRoom, Doorway, EdisonCluster, FloorLamp, FramedPrint, Pendant, Skylight, Wall, WallClock, Warehouse } from "./Decor";
import { buildShelfGeometry, outlineGeometry } from "./proxies";
import { neonTexture, plaster, posterTexture, railTexture, signTexture, woodFloor, woodGrain } from "./roomTextures";

export interface RoomControls {
  lock: () => void;
}

export interface HeldState {
  slot: Slot;
}

export interface HeldCamState {
  id: CameraId;
  lens: Lens;
}

interface Props {
  active: boolean;
  held: HeldState | null;
  heldCam: HeldCamState | null;
  /** Vertical field of view while looking through the held camera, or null when not. */
  viewfinder: number | null;
  hidden: Set<string>;
  targets: React.RefObject<SceneTargets>;
  touch: React.RefObject<{ x: number; y: number }>;
  controls: React.RefObject<RoomControls | null>;
  onHover: (slot: Slot | null) => void;
  onGrab: (slot: Slot) => void;
  onHoverCam: (id: CameraId | null) => void;
  onGrabCam: (id: CameraId) => void;
  /** Scroll while looking through a camera; positive zooms in. */
  onViewZoom: (delta: number) => void;
  onLockChange: (locked: boolean) => void;
  /** Pointer lock was refused (embedded browsers, some kiosks); the mouse then drags to look. */
  onLockError: () => void;
  onReady: () => void;
  driving: boolean;
  onHoverCar: (on: boolean) => void;
  onEnterCar: () => void;
}

const REACH = 3.5;
/**
 * Render order for the lens in your hands. Everything in it is flagged transparent so it
 * lands in the last render list, after the dim plane, which clears depth once it has drawn.
 */
const HELD_ORDER = 1000;
const BODY_RADIUS = 0.28;
const CROUCH_EYE = 1.0;
const BASE_FOV = 62;
/** How quickly the view catches up with the mouse, per second. Higher is snappier. */
const LOOK_EASE = 48;
/** Pointer-lock movement larger than this in one event is a browser glitch, in pixels. */
const MAX_MOUSE_STEP = 300;

/* ------------------------------------------------------------------ */
/* Materials shared by every shelf unit                                */
/* ------------------------------------------------------------------ */

function useShared() {
  return useMemo(() => {
    const walnut = new THREE.MeshStandardMaterial({ map: woodGrain([120, 78, 50]), roughness: 0.5, metalness: 0.02 });
    const walnutV = new THREE.MeshStandardMaterial({ map: woodGrain([110, 70, 45], { vertical: true, seed: 5 }), roughness: 0.5, metalness: 0.02 });
    const back = new THREE.MeshStandardMaterial({ map: plaster("#8a3026"), roughness: 0.9 });
    const plinth = new THREE.MeshStandardMaterial({ color: "#1d1715", roughness: 0.7 });
    const led = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.3, 1.5), toneMapped: false });
    const lensBody = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.35 });
    const lensGlass = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.08,
      metalness: 0.35,
      envMapIntensity: 1.4,
    });
    const outline = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.8, 0.5), side: THREE.BackSide, toneMapped: false });
    return { walnut, walnutV, back, plinth, led, lensBody, lensGlass, outline };
  }, []);
}
type Shared = ReturnType<typeof useShared>;

/* ------------------------------------------------------------------ */
/* Shelf unit                                                          */
/* ------------------------------------------------------------------ */

const ShelfUnit = memo(function ShelfUnit({ unit, slots, hidden, m }: { unit: Unit; slots: Slot[]; hidden: Set<string>; m: Shared }) {
  const visibleKey = slots
    .filter((s) => !hidden.has(s.lens.slug))
    .map((s) => s.lens.slug)
    .join("|");

  const geo = useMemo(() => {
    const keep = new Set(visibleKey.split("|"));
    return buildShelfGeometry(slots.filter((s) => keep.has(s.lens.slug)));
  }, [slots, visibleKey]);
  useEffect(() => () => {
    geo.body?.dispose();
    geo.glass?.dispose();
  }, [geo]);

  const rails = useMemo(
    () => BOARD_TOPS.map((_, b) => railTexture(slots.filter((s) => s.board === b), UNIT_WIDTH - 0.06)),
    [slots],
  );
  const sign = useMemo(
    () => signTexture(unit.brands.length ? unit.brands : ["Coming soon"], { bg: "#1d1715", fg: "#e7d7c1" }),
    [unit.brands],
  );
  useEffect(() => () => {
    rails.forEach((t) => t.dispose());
    sign.dispose();
  }, [rails, sign]);

  const W = UNIT_WIDTH;
  const D = UNIT_DEPTH;
  return (
    <group position={[unit.x, 0, unit.z]} rotation={[0, unit.rot, 0]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 - 0.015), UNIT_TOP / 2, 0]} material={m.walnutV} castShadow receiveShadow>
          <boxGeometry args={[0.03, UNIT_TOP, D]} />
        </mesh>
      ))}
      <mesh position={[0, UNIT_TOP / 2, -D / 2 + 0.008]} material={m.back} receiveShadow>
        <boxGeometry args={[W - 0.06, UNIT_TOP, 0.016]} />
      </mesh>
      <mesh position={[0, (BOARD_TOPS[0] - 0.03) / 2, 0.01]} material={m.plinth}>
        <boxGeometry args={[W - 0.06, BOARD_TOPS[0] - 0.03, D - 0.02]} />
      </mesh>
      {BOARD_TOPS.map((y, b) => (
        <group key={b}>
          <mesh position={[0, y - 0.015, 0]} material={m.walnut} castShadow receiveShadow>
            <boxGeometry args={[W - 0.06, 0.03, D - 0.02]} />
          </mesh>
          <mesh position={[0, y - 0.03, D / 2 + 0.002]}>
            <planeGeometry args={[W - 0.06, 0.05]} />
            <meshStandardMaterial map={rails[b]} roughness={0.6} />
          </mesh>
          {b > 0 && (
            <mesh position={[0, y - 0.034, D / 2 - 0.05]} material={m.led}>
              <boxGeometry args={[W - 0.12, 0.006, 0.012]} />
            </mesh>
          )}
        </group>
      ))}
      <mesh position={[0, UNIT_TOP - 0.02, 0.01]} material={m.walnut} castShadow>
        <boxGeometry args={[W, 0.04, D + 0.02]} />
      </mesh>
      <mesh position={[0, UNIT_TOP - 0.045, D / 2 - 0.05]} material={m.led}>
        <boxGeometry args={[W - 0.12, 0.006, 0.012]} />
      </mesh>
      <mesh position={[0, UNIT_TOP + 0.13, D / 2 - 0.02]}>
        <planeGeometry args={[W - 0.2, 0.22]} />
        <meshStandardMaterial map={sign} roughness={0.7} />
      </mesh>
      {geo.body && <mesh geometry={geo.body} material={m.lensBody} castShadow receiveShadow />}
      {geo.glass && <mesh geometry={geo.glass} material={m.lensGlass} />}
    </group>
  );
});

/* ------------------------------------------------------------------ */
/* Featured table in the middle of the room                            */
/* ------------------------------------------------------------------ */

const FeatureTable = memo(function FeatureTable({ slots, hidden, m }: { slots: Slot[]; hidden: Set<string>; m: Shared }) {
  const key = slots
    .filter((s) => !hidden.has(s.lens.slug))
    .map((s) => s.lens.slug)
    .join("|");
  const geo = useMemo(() => {
    const keep = new Set(key.split("|"));
    return buildShelfGeometry(slots.filter((s) => keep.has(s.lens.slug)));
  }, [slots, key]);
  const card = useMemo(() => signTexture(["Try these first"], { bg: "#e7d7c1", fg: "#c0392b", w: 512, h: 160 }), []);
  return (
    <group>
      <mesh position={[TABLE.x, TABLE.h - 0.025, TABLE.z]} material={m.walnut} castShadow receiveShadow>
        <boxGeometry args={[TABLE.w, 0.05, TABLE.d]} />
      </mesh>
      <mesh position={[TABLE.x, TABLE.h + 0.002, TABLE.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[TABLE.w - 0.2, TABLE.d - 0.2]} />
        <meshStandardMaterial color="#2b3a2f" roughness={0.95} />
      </mesh>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[TABLE.x + sx * (TABLE.w / 2 - 0.08), (TABLE.h - 0.05) / 2, TABLE.z + sz * (TABLE.d / 2 - 0.08)]} material={m.plinth} castShadow>
            <boxGeometry args={[0.06, TABLE.h - 0.05, 0.06]} />
          </mesh>
        )),
      )}
      <group position={[TABLE.x + TABLE.w / 2 - 0.28, TABLE.h + 0.06, TABLE.z + TABLE.d / 2 - 0.12]} rotation={[-0.35, 0, 0]}>
        <mesh>
          <planeGeometry args={[0.36, 0.11]} />
          <meshStandardMaterial map={card} roughness={0.7} />
        </mesh>
      </group>
      {geo.body && <mesh geometry={geo.body} material={m.lensBody} castShadow />}
      {geo.glass && <mesh geometry={geo.glass} material={m.lensGlass} />}
    </group>
  );
});

/* ------------------------------------------------------------------ */
/* Room shell and props                                                */
/* ------------------------------------------------------------------ */

const RoomShell = memo(function RoomShell() {
  const floor = useMemo(() => woodFloor(), []);
  const wall = useMemo(() => plaster("#e7d7c1"), []);
  const neon = useMemo(() => neonTexture("Lens Catalog", "rental shop"), []);
  const poster = useMemo(
    () =>
      posterTexture("How to rent", [
        "1. Walk up to a shelf.",
        "2. Point at a lens, press E.",
        "3. Turn it, zoom it, stop it down.",
        "4. Add it to your bag.",
        "",
        "Prices are per day.",
      ]),
    [],
  );
  const { halfX: X, halfZ: Z, height: H } = ROOM;
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ map: wall, roughness: 0.95 }), [wall]);
  const beam = useMemo(() => new THREE.MeshStandardMaterial({ map: woodGrain([84, 54, 34], { seed: 9 }), roughness: 0.7 }), []);
  const doorSign = useMemo(() => signTexture(["Cine room"], { bg: "#1d1715", fg: "#e7d7c1", w: 768, h: 160 }), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[X * 2, Z * 2]} />
        <meshStandardMaterial map={floor} bumpMap={floor} bumpScale={1.5} roughness={0.45} />
      </mesh>
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[X * 2, Z * 2]} />
        <meshStandardMaterial color="#efe5d4" roughness={0.95} />
      </mesh>
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, H - 0.11, 0]} material={beam}>
          <boxGeometry args={[0.18, 0.22, Z * 2]} />
        </mesh>
      ))}
      {[-2.4, 0, 2.4].map((z) => (
        <mesh key={z} position={[0, H - 0.08, z]} material={beam}>
          <boxGeometry args={[X * 2, 0.16, 0.14]} />
        </mesh>
      ))}
      <Skylight position={[-2.9, H, -1.2]} size={[1.2, 2.0]} />
      <Skylight position={[2.9, H, -1.2]} size={[1.2, 2.0]} />
      <CeilingFan position={[0, H, 1.0]} />

      <Wall pos={[0, 0, -Z]} rot={0} width={X * 2} height={H} material={wallMat} />
      <Wall pos={[0, 0, Z]} rot={Math.PI} width={X * 2} height={H} material={wallMat} />
      <Wall pos={[-X, 0, 0]} rot={Math.PI / 2} width={Z * 2} height={H} material={wallMat} />
      <Wall pos={[X, 0, 0]} rot={-Math.PI / 2} width={Z * 2} height={H} material={wallMat} door={{ x: DOOR.z, w: DOOR.width, h: DOOR.height }} />
      <Doorway />
      <mesh position={[X - 0.005, DOOR.height + 0.22, DOOR.z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 0.23]} />
        <meshStandardMaterial map={doorSign} roughness={0.7} />
      </mesh>

      {/* Neon over the back wall */}
      <mesh position={[0, 3.25, -Z + 0.03]}>
        <planeGeometry args={[3.6, 0.9]} />
        <meshBasicMaterial map={neon} transparent toneMapped={false} color={new THREE.Color(4, 4, 4)} depthWrite={false} />
      </mesh>

      {/* Entrance wall: door, window, poster */}
      <group position={[0, 0, Z - 0.02]} rotation={[0, Math.PI, 0]}>
        <mesh position={[-0.6, 1.08, 0]}>
          <boxGeometry args={[1.0, 2.16, 0.04]} />
          <meshStandardMaterial color="#2a1f1a" roughness={0.6} />
        </mesh>
        <mesh position={[-0.6, 1.45, 0.025]}>
          <planeGeometry args={[0.7, 0.9]} />
          <meshStandardMaterial color="#c9e2f5" emissive="#bcd8ef" emissiveIntensity={1.1} roughness={0.1} />
        </mesh>
        <mesh position={[-0.98, 1.0, 0.05]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.25} />
        </mesh>
        <group position={[2.6, 1.8, 0]}>
          <mesh>
            <boxGeometry args={[1.9, 1.3, 0.06]} />
            <meshStandardMaterial color="#2a1f1a" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <planeGeometry args={[1.76, 1.16]} />
            <meshStandardMaterial color="#d8ecfb" emissive="#cfe6f8" emissiveIntensity={1.4} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.04, 1.16, 0.02]} />
            <meshStandardMaterial color="#2a1f1a" />
          </mesh>
        </group>
        <mesh position={[-2.5, 1.55, 0.01]}>
          <planeGeometry args={[0.8, 1.07]} />
          <meshStandardMaterial map={poster} roughness={0.8} />
        </mesh>
      </group>

      {/* Rug under the table */}
      <mesh position={[TABLE.x, 0.003, TABLE.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.4, 2.3]} />
        <meshStandardMaterial color="#8a2f25" roughness={1} />
      </mesh>
      <mesh position={[TABLE.x, 0.004, TABLE.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[1.0, 1.05, 64]} />
        <meshStandardMaterial color="#d4af37" roughness={1} />
      </mesh>

      {/* Prints above the shelves and by the door */}
      <FramedPrint kind="dunes" position={[-2.9, 3.35, -Z + 0.01]} size={[1.4, 0.98]} />
      <FramedPrint kind="sea" position={[2.9, 3.35, -Z + 0.01]} size={[1.4, 0.98]} />
      <FramedPrint kind="bokeh" position={[-X + 0.01, 3.3, -1.5]} rotation={Math.PI / 2} size={[1.3, 0.9]} />
      <FramedPrint kind="peaks" position={[-X + 0.01, 3.3, 1.3]} rotation={Math.PI / 2} size={[1.3, 0.9]} />
      <FramedPrint kind="street" position={[X - 0.01, 2.0, 2.65]} rotation={-Math.PI / 2} size={[0.9, 0.63]} />
      <WallClock position={[0.6, 2.85, Z - 0.02]} rotation={Math.PI} />

      <Counter />
      <EdisonCluster position={[COUNTER.x, 0, COUNTER.z - 0.1]} ceiling={H} />
      <Armchair />
      <FloorLamp position={[3.75, 0, 2.2]} />
      {[[3.7, 3.15], [-1.25, 3.25], [-3.8, 2.05]].map(([x, z]) => (
        <Plant key={`${x}${z}`} position={[x, 0, z]} />
      ))}
      {[[-1.1, -0.7], [1.1, -0.7], [0, 1.9]].map(([x, z]) => (
        <Pendant key={`${x}${z}`} position={[x, H, z]} drop={H - 2.6} />
      ))}
    </group>
  );
});

const StaticCineRoom = memo(CineRoom);
const StaticWarehouse = memo(Warehouse);

function Counter() {
  const card = useMemo(() => signTexture(["Rental desk"], { bg: "#c0392b", fg: "#e7d7c1", w: 768, h: 192 }), []);
  const { x, z, w, d, h } = COUNTER;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, (h - 0.04) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h - 0.04, d]} />
        <meshStandardMaterial color="#9e2f24" roughness={0.75} />
      </mesh>
      <mesh position={[0, h - 0.02, 0]}>
        <boxGeometry args={[w + 0.06, 0.04, d + 0.06]} />
        <meshStandardMaterial color="#efe3cf" roughness={0.35} />
      </mesh>
      <mesh position={[0, h * 0.62, -d / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w * 0.7, w * 0.7 * 0.25]} />
        <meshStandardMaterial map={card} roughness={0.7} />
      </mesh>
      <mesh position={[0.6, h + 0.12, 0.05]}>
        <boxGeometry args={[0.34, 0.2, 0.26]} />
        <meshStandardMaterial color="#1d1715" roughness={0.5} />
      </mesh>
      <group position={[-0.5, h, -0.1]}>
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.05, 0.055, 0.024, 32]} />
          <meshStandardMaterial color="#1d1715" />
        </mesh>
        <mesh position={[0, 0.045, 0]}>
          <sphereGeometry args={[0.04, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  const leaves = useMemo(() => {
    let s = Math.abs(position[0] * 13 + position[2] * 7) + 1;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: 9 }, () => ({
      p: [(r() - 0.5) * 0.45, 0.75 + r() * 0.65, (r() - 0.5) * 0.45] as [number, number, number],
      s: 0.16 + r() * 0.12,
    }));
  }, [position]);
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.22, 0.17, 0.44, 32]} />
        <meshStandardMaterial color="#b8643f" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.012, 0.016, 0.6, 8]} />
        <meshStandardMaterial color="#4a3a22" />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={l.p} scale={[l.s, l.s * 0.8, l.s]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={i % 2 ? "#3f6b3a" : "#4f7d40"} roughness={0.8} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Player: walking, looking, picking                                   */
/* ------------------------------------------------------------------ */

const OBSTACLES = [
  { x: TABLE.x, z: TABLE.z, hw: TABLE.w / 2, hd: TABLE.d / 2 },
  { x: COUNTER.x, z: COUNTER.z, hw: COUNTER.w / 2, hd: COUNTER.d / 2 },
  { x: CAMERA_BAR.x, z: CAMERA_BAR.z, hw: CAMERA_BAR.w / 2, hd: CAMERA_BAR.d / 2 },
  { x: CHAIR.x, z: CHAIR.z, hw: 0.3, hd: 0.3 },
  ...SOFTBOXES.map((s) => ({ x: s.x, z: s.z, hw: 0.4, hd: 0.4 })),
  { x: APPLE_BOXES.x, z: APPLE_BOXES.z, hw: 0.3, hd: 0.2 },
  { x: ARMCHAIR.x, z: ARMCHAIR.z, hw: 0.45, hd: 0.45 },
  ...WARE_CRATES.map((c) => ({ x: c.x, z: c.z, hw: c.hw, hd: c.hd })),
];

/** Floor areas you can stand in: both rooms minus the shelf depth, joined by the doorway. */
const WALKABLE = (() => {
  const r = BODY_RADIUS;
  const main = { x0: -ROOM.halfX + UNIT_DEPTH + r, x1: ROOM.halfX - UNIT_DEPTH - r, z0: -ROOM.halfZ + UNIT_DEPTH + r, z1: ROOM.halfZ - r };
  const cine = { x0: CINE.cx - CINE.halfX + r, x1: CINE.cx + CINE.halfX - r, z0: CINE.cz - CINE.halfZ + UNIT_DEPTH + r, z1: CINE.cz + CINE.halfZ - r };
  const door = { x0: main.x1, x1: cine.x0, z0: DOOR.z - DOOR.width / 2 + r, z1: DOOR.z + DOOR.width / 2 - r };
  const gate = { x0: cine.x1, x1: WARE.cx - WARE.halfX + r, z0: GATE.z - GATE.width / 2 + r, z1: GATE.z + GATE.width / 2 - r };
  const ware = { x0: WARE.cx - WARE.halfX + r, x1: WARE.cx + WARE.halfX - r, z0: WARE.cz - WARE.halfZ + r, z1: WARE.cz + WARE.halfZ - r };
  return [main, door, cine, gate, ware];
})();

/** Wall slabs between the rooms, so you can't pick a lens through them. */
const WALL_BOXES = (() => {
  const x0 = ROOM.halfX;
  const x1 = ROOM.halfX + WALL;
  const a = DOOR.z - DOOR.width / 2;
  const b = DOOR.z + DOOR.width / 2;
  return [
    new THREE.Box3(new THREE.Vector3(x0, 0, -ROOM.halfZ), new THREE.Vector3(x1, ROOM.height, a)),
    new THREE.Box3(new THREE.Vector3(x0, 0, b), new THREE.Vector3(x1, ROOM.height, ROOM.halfZ)),
    new THREE.Box3(new THREE.Vector3(x0, DOOR.height, a), new THREE.Vector3(x1, ROOM.height, b)),
  ];
})();

const GATE_BOXES = (() => {
  const x0 = CINE.cx + CINE.halfX;
  const x1 = x0 + WALL;
  const a = GATE.z - GATE.width / 2;
  const b = GATE.z + GATE.width / 2;
  return [
    new THREE.Box3(new THREE.Vector3(x0, 0, CINE.cz - CINE.halfZ), new THREE.Vector3(x1, CINE.height, a)),
    new THREE.Box3(new THREE.Vector3(x0, 0, b), new THREE.Vector3(x1, CINE.height, CINE.cz + CINE.halfZ)),
    new THREE.Box3(new THREE.Vector3(x0, GATE.height, a), new THREE.Vector3(x1, CINE.height, b)),
  ];
})();

function pushOut(p: THREE.Vector3, o: { x: number; z: number; hw: number; hd: number }) {
  const cx = THREE.MathUtils.clamp(p.x, o.x - o.hw, o.x + o.hw);
  const cz = THREE.MathUtils.clamp(p.z, o.z - o.hd, o.z + o.hd);
  const dx = p.x - cx;
  const dz = p.z - cz;
  const d = Math.hypot(dx, dz);
  if (d < BODY_RADIUS) {
    if (d < 1e-5) {
      p.z = o.z + o.hd + BODY_RADIUS;
    } else {
      p.x = cx + (dx / d) * BODY_RADIUS;
      p.z = cz + (dz / d) * BODY_RADIUS;
    }
  }
}

function collide(p: THREE.Vector3, vehicle?: VehiclePose | null) {
  let bestX = p.x;
  let bestZ = p.z;
  let bestD = Infinity;
  for (const w of WALKABLE) {
    const x = THREE.MathUtils.clamp(p.x, w.x0, w.x1);
    const z = THREE.MathUtils.clamp(p.z, w.z0, w.z1);
    const d = (x - p.x) ** 2 + (z - p.z) ** 2;
    if (d < bestD) {
      bestD = d;
      bestX = x;
      bestZ = z;
    }
  }
  p.x = bestX;
  p.z = bestZ;
  for (const o of OBSTACLES) pushOut(p, o);
  if (vehicle) {
    const c = Math.cos(vehicle.yaw);
    const s = Math.sin(vehicle.yaw);
    const dx = p.x - vehicle.x;
    const dz = p.z - vehicle.z;
    const lx = c * dx - s * dz;
    const lz = s * dx + c * dz;
    const hw = RAM.width / 2 + 0.08;
    const hd = RAM.length / 2 + 0.08;
    if (Math.abs(lx) < hw + BODY_RADIUS && Math.abs(lz) < hd + BODY_RADIUS) {
      const ox = hw + BODY_RADIUS - Math.abs(lx);
      const oz = hd + BODY_RADIUS - Math.abs(lz);
      if (ox < oz) {
        const nlx = Math.sign(lx || 1) * (hw + BODY_RADIUS);
        p.x = vehicle.x + c * nlx + s * lz;
        p.z = vehicle.z - s * nlx + c * lz;
      } else {
        const nlz = Math.sign(lz || 1) * (hd + BODY_RADIUS);
        p.x = vehicle.x + c * lx + s * nlz;
        p.z = vehicle.z - s * lx + c * nlz;
      }
    }
  }
}

function collideVehicle(v: VehiclePose) {
  const pad = 3.15;
  v.x = THREE.MathUtils.clamp(v.x, WARE.cx - WARE.halfX + pad, WARE.cx + WARE.halfX - pad);
  v.z = THREE.MathUtils.clamp(v.z, WARE.cz - WARE.halfZ + pad, WARE.cz + WARE.halfZ - pad);
  VEH_TMP.set(v.x, 0, v.z);
  const r = 1.35;
  for (const c of WARE_CRATES) {
    const cx = THREE.MathUtils.clamp(VEH_TMP.x, c.x - c.hw, c.x + c.hw);
    const cz = THREE.MathUtils.clamp(VEH_TMP.z, c.z - c.hd, c.z + c.hd);
    const dx = VEH_TMP.x - cx;
    const dz = VEH_TMP.z - cz;
    const d = Math.hypot(dx, dz);
    if (d < r) {
      if (d < 1e-5) VEH_TMP.z = c.z + c.hd + r;
      else {
        VEH_TMP.x = cx + (dx / d) * r;
        VEH_TMP.z = cz + (dz / d) * r;
      }
    }
  }
  v.x = VEH_TMP.x;
  v.z = VEH_TMP.z;
}

interface PickBox {
  slot: Slot;
  box: THREE.Box3;
}

type Target = { kind: "lens"; slot: Slot } | { kind: "cam"; id: CameraId } | { kind: "car" };

const CAR_HIT = new THREE.Box3();
const VEH_TMP = new THREE.Vector3();

/** Pick boxes around the cameras on the display table. */
const CAM_BOXES = CAMERA_LIST.map((c) => {
  const [x, y, z] = c.display;
  return { id: c.id, box: new THREE.Box3(new THREE.Vector3(x - 0.17, y, z - 0.17), new THREE.Vector3(x + 0.17, y + 0.24, z + 0.17)) };
});

function pick(ray: THREE.Ray, boxes: PickBox[], hidden: Set<string>, hiddenCam: CameraId | null, vehicle: VehiclePose, hideCar: boolean): Target | null {
  let best: Target | null = null;
  let bestD = REACH;
  const hit = new THREE.Vector3();
  for (const w of WALL_BOXES) {
    if (ray.intersectBox(w, hit)) bestD = Math.min(bestD, hit.distanceTo(ray.origin));
  }
  for (const w of GATE_BOXES) {
    if (ray.intersectBox(w, hit)) bestD = Math.min(bestD, hit.distanceTo(ray.origin));
  }
  for (const b of boxes) {
    if (hidden.has(b.slot.lens.slug)) continue;
    if (!ray.intersectBox(b.box, hit)) continue;
    const d = hit.distanceTo(ray.origin);
    if (d < bestD) {
      bestD = d;
      best = { kind: "lens", slot: b.slot };
    }
  }
  for (const c of CAM_BOXES) {
    if (c.id === hiddenCam || !ray.intersectBox(c.box, hit)) continue;
    const d = hit.distanceTo(ray.origin);
    if (d < bestD) {
      bestD = d;
      best = { kind: "cam", id: c.id };
    }
  }
  if (!hideCar) {
    CAR_HIT.min.set(vehicle.x - 3, 0, vehicle.z - 3);
    CAR_HIT.max.set(vehicle.x + 3, 2.15, vehicle.z + 3);
    if (ray.intersectBox(CAR_HIT, hit)) {
      const d = hit.distanceTo(ray.origin);
      if (d < bestD) best = { kind: "car" };
    }
  }
  return best;
}

const sameTarget = (a: Target | null, b: Target | null) => {
  if (a === b) return true;
  if (!a || !b || a.kind !== b.kind) return false;
  if (a.kind === "lens") return b.kind === "lens" && a.slot === b.slot;
  if (a.kind === "cam") return b.kind === "cam" && a.id === b.id;
  return true;
};

interface HeldView {
  yaw: number;
  pitch: number;
  dist: number;
}

function Player({
  active,
  held,
  hidden,
  hiddenCam,
  viewfinder,
  boxes,
  touch,
  controls,
  heldView,
  driving,
  vehicle,
  onHover,
  onGrab,
  onHoverCam,
  onGrabCam,
  onHoverCar,
  onEnterCar,
  onViewZoom,
  onLockChange,
  onLockError,
}: Pick<
  Props,
  | "active"
  | "hidden"
  | "viewfinder"
  | "touch"
  | "controls"
  | "driving"
  | "onHover"
  | "onGrab"
  | "onHoverCam"
  | "onGrabCam"
  | "onHoverCar"
  | "onEnterCar"
  | "onViewZoom"
  | "onLockChange"
  | "onLockError"
> & {
  /** Something is in your hands and the mouse turns it rather than your head. */
  held: boolean;
  hiddenCam: CameraId | null;
  boxes: PickBox[];
  heldView: React.RefObject<HeldView>;
  vehicle: React.RefObject<VehiclePose>;
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const keys = useRef(new Set<string>());
  const look = useRef({ yaw: START.yaw as number, pitch: -0.06 as number });
  const hover = useRef<Target | null>(null);
  const walk = useRef(0);
  const crouch = useRef(false);
  const fallbackRef = useRef(false);
  const viewing = viewfinder !== null;
  const live = useRef({
    active,
    held,
    viewing,
    driving,
    hidden,
    hiddenCam,
    onHover,
    onGrab,
    onHoverCam,
    onGrabCam,
    onHoverCar,
    onEnterCar,
    onViewZoom,
    onLockChange,
    onLockError,
  });
  live.current = {
    active,
    held,
    viewing,
    driving,
    hidden,
    hiddenCam,
    onHover,
    onGrab,
    onHoverCam,
    onGrabCam,
    onHoverCar,
    onEnterCar,
    onViewZoom,
    onLockChange,
    onLockError,
  };
  const fovGoal = useRef(BASE_FOV);
  fovGoal.current = viewfinder ?? (driving ? 75 : BASE_FOV);
  const hoverSetter = useRef<(t: Target | null) => void>(() => {});

  useEffect(() => {
    camera.position.set(START.x, EYE, START.z);
  }, [camera]);

  useEffect(() => {
    const el = gl.domElement;
    const isLocked = () => document.pointerLockElement === el;
    controls.current = {
      lock: () => {
        if (fallbackRef.current) return;
        const plain = () => {
          try {
            const p = el.requestPointerLock() as unknown;
            if (p instanceof Promise) p.catch(() => {});
          } catch {}
        };
        // Raw mouse input skips the OS pointer acceleration, so turning tracks the hand evenly.
        try {
          const p = el.requestPointerLock({ unadjustedMovement: true }) as unknown;
          if (p instanceof Promise) p.catch((err: unknown) => (err instanceof DOMException && err.name === "NotSupportedError" ? plain() : undefined));
        } catch {
          plain();
        }
      },
    };

    const canPick = () => live.current.active && !live.current.held && !live.current.viewing && !live.current.driving;
    const setHover = (t: Target | null) => {
      if (sameTarget(hover.current, t)) return;
      const was = hover.current;
      hover.current = t;
      if (t?.kind === "lens" || was?.kind === "lens") live.current.onHover(t?.kind === "lens" ? t.slot : null);
      if (t?.kind === "cam" || was?.kind === "cam") live.current.onHoverCam(t?.kind === "cam" ? t.id : null);
      if (t?.kind === "car" || was?.kind === "car") live.current.onHoverCar(t?.kind === "car");
    };
    hoverSetter.current = setHover;
    const grab = (t: Target) => {
      setHover(null);
      if (t.kind === "lens") live.current.onGrab(t.slot);
      else if (t.kind === "cam") live.current.onGrabCam(t.id);
      else live.current.onEnterCar();
    };
    const pickAt = (r: THREE.Ray) => pick(r, boxes, live.current.hidden, live.current.hiddenCam, vehicle.current, live.current.driving);

    const onKeyDown = (e: KeyboardEvent) => {
      if (live.current.active && (e.ctrlKey || e.metaKey) && /^Key[WASDE]$/.test(e.code)) e.preventDefault();
      if (e.ctrlKey && /^Key/.test(e.code)) return;
      keys.current.add(e.code);
      // A toggle rather than a hold: holding Ctrl while pressing W would close the tab.
      if (
        (e.code === "ControlLeft" || e.code === "ControlRight" || e.code === "KeyC") &&
        !e.repeat &&
        live.current.active &&
        !live.current.held &&
        !live.current.driving
      ) {
        crouch.current = !crouch.current;
      }
      if (e.code === "KeyE" && !e.repeat && canPick()) {
        if (hover.current) grab(hover.current);
        else if (Math.hypot(camera.position.x - vehicle.current.x, camera.position.z - vehicle.current.z) < 4.2) {
          live.current.onEnterCar();
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    const onBlur = () => keys.current.clear();
    const onLock = () => live.current.onLockChange(isLocked());
    const onLockFail = () => {
      fallbackRef.current = true;
      live.current.onLockError();
    };
    const pointerRay = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const rc = new THREE.Raycaster();
      rc.setFromCamera(ndc, camera);
      return rc.ray;
    };
    // Slower look when zoomed in through a long lens.
    const sens = () => camera.fov / BASE_FOV;
    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked() || live.current.held) return;
      // Chrome on Windows sometimes reports one huge bogus jump while the pointer is locked.
      if (Math.abs(e.movementX) > MAX_MOUSE_STEP || Math.abs(e.movementY) > MAX_MOUSE_STEP) return;
      look.current.yaw -= e.movementX * 0.0022 * sens();
      look.current.pitch = THREE.MathUtils.clamp(look.current.pitch - e.movementY * 0.0022 * sens(), -1.35, 1.35);
    };

    let drag: { x: number; y: number; moved: number; type: string } | null = null;
    const capture = (id: number) => {
      try {
        el.setPointerCapture(id);
      } catch {}
    };
    const onDown = (e: PointerEvent) => {
      const { active: on, held: h } = live.current;
      if (!on) return;
      if (h) {
        drag = { x: e.clientX, y: e.clientY, moved: 0, type: e.pointerType };
        capture(e.pointerId);
        return;
      }
      if (e.pointerType === "mouse" && !fallbackRef.current) {
        if (isLocked()) {
          if (e.button === 0 && hover.current && canPick()) grab(hover.current);
        } else {
          controls.current?.lock();
        }
        return;
      }
      drag = { x: e.clientX, y: e.clientY, moved: 0, type: e.pointerType };
      capture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) {
        if (fallbackRef.current && e.pointerType === "mouse" && canPick()) {
          setHover(pickAt(pointerRay(e)));
        }
        return;
      }
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      if (live.current.held) {
        heldView.current.yaw += dx * 0.009;
        heldView.current.pitch = THREE.MathUtils.clamp(heldView.current.pitch + dy * 0.009, -1.5, 1.5);
      } else {
        look.current.yaw += dx * 0.005 * sens();
        look.current.pitch = THREE.MathUtils.clamp(look.current.pitch + dy * 0.005 * sens(), -1.35, 1.35);
      }
    };
    const onUp = (e: PointerEvent) => {
      const d = drag;
      drag = null;
      if (!d || d.moved > 8 || !canPick()) return;
      const t = pickAt(pointerRay(e));
      if (t) grab(t);
    };
    const onWheel = (e: WheelEvent) => {
      if (live.current.viewing) {
        e.preventDefault();
        live.current.onViewZoom(-e.deltaY * 0.0012);
        return;
      }
      if (!live.current.held) return;
      e.preventDefault();
      const v = heldView.current;
      v.dist = THREE.MathUtils.clamp(v.dist * (1 + e.deltaY * 0.001), 0.12, 1.4);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("pointerlockchange", onLock);
    document.addEventListener("pointerlockerror", onLockFail);
    document.addEventListener("mousemove", onMouseMove);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("pointerlockchange", onLock);
      document.removeEventListener("pointerlockerror", onLockFail);
      document.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [gl, camera, boxes, controls, heldView, vehicle]);

  const fwd = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const want = useMemo(() => new THREE.Vector3(), []);
  const vel = useRef(new THREE.Vector3());
  const smooth = useRef({ yaw: START.yaw as number, pitch: -0.06 as number });
  const ray = useMemo(() => new THREE.Ray(), []);
  const wasDriving = useRef(false);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const { active: on, held: h, hidden: hid, driving: inCar } = live.current;
    const car = vehicle.current;

    if (inCar && on) {
      const keys2 = keys.current;
      const t = touch.current;
      const throttle = (keys2.has("KeyW") || keys2.has("ArrowUp") ? 1 : 0) + (t?.y ?? 0);
      const reverse = keys2.has("KeyS") || keys2.has("ArrowDown") ? 1 : 0;
      const steerIn = (keys2.has("KeyA") || keys2.has("ArrowLeft") ? 1 : 0) - (keys2.has("KeyD") || keys2.has("ArrowRight") ? 1 : 0) - (t?.x ?? 0);
      const boost = keys2.has("ShiftLeft") || keys2.has("ShiftRight") ? 1.45 : 1;
      const steerMax = 0.62 * (1 - Math.min(0.55, Math.abs(car.speed) / 22));
      car.steer = THREE.MathUtils.damp(car.steer, THREE.MathUtils.clamp(steerIn, -1, 1) * steerMax, 8, dt);
      if (throttle > 0) car.speed += 9 * boost * Math.min(1, throttle) * dt;
      else if (reverse && car.speed > 0.2) car.speed -= 16 * dt;
      else if (reverse) car.speed -= 7 * dt;
      car.speed -= car.speed * 1.6 * dt;
      car.speed = THREE.MathUtils.clamp(car.speed, -6, 16 * boost);
      if (Math.abs(car.speed) < 0.02 && throttle <= 0 && !reverse) car.speed = 0;
      car.yaw += (car.speed / RAM.wheelbase) * Math.tan(car.steer) * dt;
      car.x += -Math.sin(car.yaw) * car.speed * dt;
      car.z += -Math.cos(car.yaw) * car.speed * dt;
      collideVehicle(car);

      if (!wasDriving.current) {
        look.current.yaw = car.yaw;
        look.current.pitch = -0.04;
        smooth.current.yaw = car.yaw;
        smooth.current.pitch = -0.04;
      }
      wasDriving.current = true;
      vel.current.set(0, 0, 0);

      const sm = smooth.current;
      const k = 1 - Math.exp(-dt * LOOK_EASE);
      sm.yaw += (look.current.yaw - sm.yaw) * k;
      sm.pitch += (look.current.pitch - sm.pitch) * k;
      let rel = sm.yaw - car.yaw;
      rel = Math.atan2(Math.sin(rel), Math.cos(rel));
      rel = THREE.MathUtils.clamp(rel, -0.95, 0.95);
      look.current.yaw = car.yaw + rel;
      sm.yaw = car.yaw + rel;
      sm.pitch = THREE.MathUtils.clamp(sm.pitch, -0.38, 0.42);
      look.current.pitch = sm.pitch;
      camera.rotation.set(sm.pitch, car.yaw + rel, 0, "YXZ");
      const c = Math.cos(car.yaw);
      const s = Math.sin(car.yaw);
      camera.position.set(car.x + c * RAM.seat.x + s * RAM.seat.z, RAM.seat.y, car.z - s * RAM.seat.x + c * RAM.seat.z);
      if (hover.current) hoverSetter.current(null);
      return;
    }

    if (wasDriving.current) {
      wasDriving.current = false;
      car.speed = 0;
      car.steer = 0;
      const c = Math.cos(car.yaw);
      const s = Math.sin(car.yaw);
      camera.position.set(car.x - c * 1.75, EYE, car.z + s * 1.75);
      collide(camera.position, car);
      look.current.yaw = car.yaw;
      look.current.pitch = -0.06;
      smooth.current.yaw = car.yaw;
      smooth.current.pitch = -0.06;
    }

    // The view eases towards where the mouse points, which irons out jittery mouse input.
    const sm = smooth.current;
    const k = 1 - Math.exp(-dt * LOOK_EASE);
    sm.yaw += (look.current.yaw - sm.yaw) * k;
    sm.pitch += (look.current.pitch - sm.pitch) * k;
    const { yaw, pitch } = sm;
    camera.rotation.set(pitch, yaw, 0, "YXZ");

    const v = vel.current;
    want.set(0, 0, 0);
    let speed = 0;
    if (on && !h) {
      const keys2 = keys.current;
      const t = touch.current;
      const f = (keys2.has("KeyW") || keys2.has("ArrowUp") ? 1 : 0) - (keys2.has("KeyS") || keys2.has("ArrowDown") ? 1 : 0) + (t?.y ?? 0);
      const s = (keys2.has("KeyD") || keys2.has("ArrowRight") ? 1 : 0) - (keys2.has("KeyA") || keys2.has("ArrowLeft") ? 1 : 0) + (t?.x ?? 0);
      if (f || s) {
        speed = keys2.has("ShiftLeft") || keys2.has("ShiftRight") ? 3.6 : 2.2;
        fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw));
        right.set(Math.cos(yaw), 0, -Math.sin(yaw));
        want.copy(fwd.multiplyScalar(f).add(right.multiplyScalar(s)));
        if (want.lengthSq() > 1) want.normalize();
        want.multiplyScalar(speed);
      }
    }
    // Ease into and out of a walk instead of starting and stopping dead.
    v.lerp(want, 1 - Math.exp(-dt * (want.lengthSq() > 0 ? 9 : 12)));
    const pace = v.length();
    const moving = pace > 0.15;
    if (pace > 0.001) {
      camera.position.addScaledVector(v, dt);
      collide(camera.position, car);
      walk.current += dt * pace * 3.2;
    }
    const eye = crouch.current ? CROUCH_EYE : EYE;
    const bob = moving ? Math.sin(walk.current) * (live.current.viewing ? 0.008 : 0.022) : 0;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, eye + bob, 1 - Math.exp(-dt * 12));

    if (Math.abs(camera.fov - fovGoal.current) > 0.01) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, fovGoal.current, 1 - Math.exp(-dt * 10));
      camera.updateProjectionMatrix();
    }

    const picking = on && !h && !live.current.viewing;
    if (picking && document.pointerLockElement === gl.domElement) {
      camera.getWorldDirection(ray.direction);
      ray.origin.copy(camera.position);
      hoverSetter.current(pick(ray, boxes, hid, live.current.hiddenCam, car, false));
    } else if (hover.current && !picking) {
      hoverSetter.current(null);
    }
  });

  return null;
}

/* ------------------------------------------------------------------ */
/* Hover outline and the lens in your hands                            */
/* ------------------------------------------------------------------ */

function HoverOutline({ slot, units, m }: { slot: Slot | null; units: Unit[]; m: Shared }) {
  const geo = useMemo(() => (slot ? outlineGeometry(slot) : null), [slot]);
  useEffect(() => () => geo?.dispose(), [geo]);
  if (!slot || !geo) return null;
  const u = slot.unit >= 0 ? units[slot.unit] : null;
  return (
    <group position={u ? [u.x, 0, u.z] : [0, 0, 0]} rotation={[0, u?.rot ?? 0, 0]}>
      <mesh geometry={geo} material={m.outline} />
    </group>
  );
}

function HeldLens({
  slot,
  targets,
  view,
}: {
  slot: Slot;
  targets: React.RefObject<SceneTargets>;
  view: React.RefObject<HeldView>;
}) {
  const lens: Lens = slot.lens;
  const camera = useThree((s) => s.camera);
  const group = useRef<THREE.Group>(null);
  const dim = useRef<THREE.Mesh>(null);
  const key = useRef<THREE.PointLight>(null);
  const anim = useRef<AnimState>({ zoom: 0, focus: 1, closed: 0 });
  const start = useRef<number | null>(null);
  const size = Math.max(lens.lengthMm + lens.extensionMm * 0.5, lens.diameterMm * 1.2) / 1000;

  useEffect(() => {
    view.current.yaw = 0.75;
    view.current.pitch = 0.28;
    view.current.dist = THREE.MathUtils.clamp(size * 2.3 + 0.12, 0.25, 1.2);
    start.current = null;
  }, [slot, size, view]);
  useLayoutEffect(() => {
    if (group.current) markHeld(group.current);
  }, [slot]);

  useEffect(() => {
    const d = dim.current;
    if (d) d.onAfterRender = (renderer) => renderer.clearDepth();
  }, []);

  const tmp = useMemo(
    () => ({
      from: new THREE.Vector3(...slot.world),
      to: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      side: new THREE.Vector3(),
      upright: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
      target: new THREE.Quaternion(),
      spin: new THREE.Quaternion(),
      e: new THREE.Euler(0, 0, 0, "YXZ"),
    }),
    [slot],
  );

  useFrame((state, dt) => {
    stepAnim(anim.current, targets.current, state.clock.elapsedTime, dt);
    const g = group.current;
    if (!g) return;
    if (start.current === null) start.current = state.clock.elapsedTime;
    const p = Math.min(1, (state.clock.elapsedTime - start.current) / 0.6);
    const ease = 1 - Math.pow(1 - p, 3);
    const v = view.current;
    camera.getWorldDirection(tmp.fwd);
    tmp.to.copy(camera.position).addScaledVector(tmp.fwd, v.dist);
    // Keep the lens clear of the spec panel on wide screens.
    const aspect = (camera as THREE.PerspectiveCamera).aspect;
    if (aspect > 1.2) tmp.to.add(tmp.side.set(-v.dist * 0.16, 0, 0).applyQuaternion(camera.quaternion));
    g.position.lerpVectors(tmp.from, tmp.to, ease);
    tmp.e.set(v.pitch, v.yaw, 0, "YXZ");
    tmp.spin.setFromEuler(tmp.e);
    tmp.target.copy(camera.quaternion).multiply(tmp.spin);
    g.quaternion.slerpQuaternions(tmp.upright, tmp.target, ease);

    if (dim.current) {
      dim.current.position.copy(camera.position).addScaledVector(tmp.fwd, 0.05);
      dim.current.quaternion.copy(camera.quaternion);
      const mat = dim.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.45 * ease;
    }
    if (key.current) {
      key.current.position.copy(camera.position).add(new THREE.Vector3(0.4, 0.5, 0.1).applyQuaternion(camera.quaternion));
    }
  });

  return (
    <>
      <mesh
        ref={dim}
        renderOrder={HELD_ORDER - 1}
        frustumCulled={false}
      >
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          color="#0c0a09"
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight ref={key} intensity={2.5} color="#fff1e0" distance={0} decay={2} />
      <group ref={group}>
        <group rotation={[Math.PI / 2, 0, 0]} scale={0.001}>
          <group position={[0, -lens.lengthMm / 2, 0]}>
            <LensModel lens={lens} mountId={lens.mounts[0]} anim={anim} showHood={false} />
          </group>
        </group>
      </group>
    </>
  );
}

/**
 * Flags everything under `root` to draw after the dim plane. Done when parts mount, before their
 * first frame, so each material compiles once as transparent instead of once each way.
 */
function markHeld(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || mesh.renderOrder === HELD_ORDER) return;
    mesh.renderOrder = HELD_ORDER;
    mesh.castShadow = false;
    for (const mat of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      if (!mat.transparent) {
        mat.transparent = true;
        mat.needsUpdate = true;
      }
    }
  });
}

function stepAnim(a: AnimState, t: SceneTargets | null, time: number, dt: number) {
  if (!t) return;
  let { zoom, focus, closed } = t;
  if (t.demo) {
    zoom = 0.5 - 0.5 * Math.cos(time * 0.7);
    focus = 0.5 - 0.5 * Math.cos(time * 1.1);
    closed = 0.5 - 0.5 * Math.cos(time * 0.55);
  }
  const k = 1 - Math.exp(-dt * 6);
  a.zoom += (zoom - a.zoom) * k;
  a.focus += (focus - a.focus) * k;
  a.closed += (closed - a.closed) * k;
}

/* ------------------------------------------------------------------ */
/* Camera bar in the cine room                                         */
/* ------------------------------------------------------------------ */

/** Cameras sit three-quarters on to the doorway. */
const DISPLAY_YAW = -0.97;
const TURNTABLE_MM = 16;

/** Height of the mount centre above the table so neither body nor lens goes through it, in mm. */
function displayLift(id: CameraId, lens: Lens | null) {
  return Math.max(id === "fx3" ? 37.5 : 37.7, lens ? lens.diameterMm / 2 + 1 : 0) + TURNTABLE_MM;
}

function displayLens(id: CameraId) {
  const cam = CAMERAS[id];
  return cam.defaultLens.map((s) => ALL_LENSES.find((l) => l.slug === s)).find((l) => l && fit(cam, l)) ?? null;
}

const CameraBar = memo(function CameraBar({ m, heldId }: { m: Shared; heldId: CameraId | null }) {
  const B = CAMERA_BAR;
  const still = useRef<AnimState>({ zoom: 0, focus: 1, closed: 0 });
  const cards = useMemo(
    () =>
      CAMERA_LIST.map((c) => ({
        name: signTexture([`${c.brand} ${c.name}`], { bg: "#141211", fg: "#efe6d8", w: 512, h: 112 }),
        rate: signTexture([`${c.mount} mount`, `$${cameraRate(c)}/day`], { bg: "#c0392b", fg: "#efe6d8", w: 512, h: 72 }),
      })),
    [],
  );
  return (
    <group>
      <group position={[B.x, 0, B.z]}>
        <mesh position={[0, B.h - 0.025, 0]} material={m.walnut} castShadow receiveShadow>
          <boxGeometry args={[B.w, 0.05, B.d]} />
        </mesh>
        <mesh position={[0, (B.h - 0.05) / 2 + 0.04, 0]} material={m.plinth} castShadow receiveShadow>
          <boxGeometry args={[B.w - 0.16, B.h - 0.13, B.d - 0.16]} />
        </mesh>
        <mesh position={[0, 0.02, 0]} material={m.plinth}>
          <boxGeometry args={[B.w - 0.2, 0.04, B.d - 0.2]} />
        </mesh>
        <mesh position={[0, 0.08, B.d / 2 - 0.08 + 0.002]} material={m.led}>
          <boxGeometry args={[B.w - 0.2, 0.012, 0.004]} />
        </mesh>
      </group>
      {CAMERA_LIST.map((c, i) => {
        const lens = displayLens(c.id);
        const lift = displayLift(c.id, lens) / 1000;
        const [x, y, z] = c.display;
        return (
          <group key={c.id}>
            <mesh position={[x, y + TURNTABLE_MM / 2000, z]} material={m.plinth} castShadow receiveShadow>
              <cylinderGeometry args={[0.15, 0.16, TURNTABLE_MM / 1000, 48]} />
            </mesh>
            <group position={[x, y + 0.05, z + B.d / 2 - 0.1]} rotation={[-0.75, 0, 0]}>
              <mesh position={[0, 0.0225, 0]}>
                <planeGeometry args={[0.32, 0.07]} />
                <meshBasicMaterial map={cards[i].name} toneMapped={false} />
              </mesh>
              <mesh position={[0, -0.0225, 0]}>
                <planeGeometry args={[0.32, 0.045]} />
                <meshBasicMaterial map={cards[i].rate} toneMapped={false} />
              </mesh>
            </group>
            {heldId !== c.id && (
              <group position={[x, y + lift, z]} rotation={[0, DISPLAY_YAW, 0]} scale={0.001}>
                <CameraWithLens cam={c} lens={lens} lensFit={lens ? fit(c, lens) : null} anim={still} />
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
});

function HeldCamera({
  state,
  targets,
  view,
  viewing,
}: {
  state: HeldCamState;
  targets: React.RefObject<SceneTargets>;
  view: React.RefObject<HeldView>;
  viewing: boolean;
}) {
  const cam = CAMERAS[state.id];
  const lens = state.lens;
  const lensFit = fit(cam, lens);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const group = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);
  const dim = useRef<THREE.Mesh>(null);
  const key = useRef<THREE.PointLight>(null);
  const anim = useRef<AnimState>({ zoom: 0, focus: 1, closed: 0 });
  const start = useRef<number | null>(null);
  const frame = useRef(0);
  const reach = rigLength(cam, lens, lensFit);
  const size = Math.max(cam.size[0], cam.size[2] + reach) / 1000;

  const lcd = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(320, 180);
    return { rt, cam: new THREE.PerspectiveCamera(40, 16 / 9, 0.02, 40) };
  }, []);
  useEffect(() => () => lcd.rt.dispose(), [lcd]);

  useEffect(() => {
    // Seen from behind, so the screen faces you: the FX3's on the back, the Komodo's on top.
    view.current.yaw = Math.PI - (state.id === "fx3" ? 0.55 : 0.5);
    view.current.pitch = state.id === "fx3" ? -0.25 : -1.0;
    start.current = null;
  }, [state.id, view]);
  // A new lens only changes how far away the rig sits; the way you were turning it stays.
  useEffect(() => {
    view.current.dist = THREE.MathUtils.clamp(size * 1.5 + 0.08, 0.3, 1.0);
  }, [size, view]);
  useLayoutEffect(() => {
    if (group.current) markHeld(group.current);
  }, [lens]);

  useEffect(() => {
    const d = dim.current;
    if (d) d.onAfterRender = (renderer) => renderer.clearDepth();
  }, []);

  const tmp = useMemo(() => {
    const [x, y, z] = cam.display;
    return {
      from: new THREE.Vector3(x, y + displayLift(cam.id, displayLens(cam.id)) / 1000, z),
      to: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      side: new THREE.Vector3(),
      upright: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, DISPLAY_YAW, 0)),
      target: new THREE.Quaternion(),
      spin: new THREE.Quaternion(),
      e: new THREE.Euler(0, 0, 0, "YXZ"),
      flip: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI),
      front: new THREE.Vector3(),
    };
  }, [cam]);

  useFrame((state3, dt) => {
    stepAnim(anim.current, targets.current, state3.clock.elapsedTime, dt);
    const g = group.current;
    if (!g) return;
    if (start.current === null) start.current = state3.clock.elapsedTime;
    const p = Math.min(1, (state3.clock.elapsedTime - start.current) / 0.6);
    const ease = 1 - Math.pow(1 - p, 3);
    const v = view.current;
    camera.getWorldDirection(tmp.fwd);
    tmp.to.copy(camera.position).addScaledVector(tmp.fwd, v.dist);
    const aspect = (camera as THREE.PerspectiveCamera).aspect;
    if (aspect > 1.2) tmp.to.add(tmp.side.set(-v.dist * 0.18, 0, 0).applyQuaternion(camera.quaternion));
    g.position.lerpVectors(tmp.from, tmp.to, ease);
    tmp.e.set(v.pitch, v.yaw, 0, "YXZ");
    tmp.spin.setFromEuler(tmp.e);
    tmp.target.copy(camera.quaternion).multiply(tmp.spin);
    g.quaternion.slerpQuaternions(tmp.upright, tmp.target, ease);
    g.visible = !viewing;
    // Keep the rig centred in your hands, gliding when a longer or shorter lens goes on.
    const r = rig.current;
    if (r) {
      const centre = (cam.size[2] - reach) / 2000;
      r.position.z = start.current === state3.clock.elapsedTime ? centre : THREE.MathUtils.lerp(r.position.z, centre, 1 - Math.exp(-dt * 8));
    }

    const d = dim.current;
    if (d) {
      d.position.copy(camera.position).addScaledVector(tmp.fwd, 0.05);
      d.quaternion.copy(camera.quaternion);
      (d.material as THREE.MeshBasicMaterial).opacity = 0.45 * ease;
      d.visible = !viewing;
    }
    if (key.current) {
      key.current.position.copy(camera.position).add(new THREE.Vector3(0.4, 0.5, 0.1).applyQuaternion(camera.quaternion));
    }

    // Live picture on the camera's own screen, rendered from the front of the lens.
    frame.current += 1;
    if (viewing || frame.current % 4) return;
    g.updateMatrixWorld();
    const f = focalAt(lens, anim.current.zoom);
    lcd.cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(cam.sensor.h / (2 * f)));
    lcd.cam.aspect = (cam.sensor.w * (lens.squeeze ?? 1)) / cam.sensor.h;
    lcd.cam.updateProjectionMatrix();
    g.localToWorld(tmp.front.set(0, 0, (r?.position.z ?? 0) + reach / 1000 + 0.01));
    lcd.cam.position.copy(tmp.front);
    lcd.cam.quaternion.copy(g.quaternion).multiply(tmp.flip);
    g.visible = false;
    if (d) d.visible = false;
    const autoShadow = gl.shadowMap.autoUpdate;
    gl.shadowMap.autoUpdate = false;
    const prev = gl.getRenderTarget();
    gl.setRenderTarget(lcd.rt);
    gl.clear();
    gl.render(scene, lcd.cam);
    gl.setRenderTarget(prev);
    gl.shadowMap.autoUpdate = autoShadow;
    g.visible = true;
    if (d) d.visible = true;
  });

  return (
    <>
      <mesh ref={dim} renderOrder={HELD_ORDER - 1} frustumCulled={false}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#0c0a09" transparent opacity={0} depthTest={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight ref={key} intensity={2.5} color="#fff1e0" distance={0} decay={2} />
      <group ref={group}>
        <group ref={rig} scale={0.001}>
          <CameraWithLens cam={cam} lens={lens} lensFit={lensFit} anim={anim} screen={lcd.rt.texture} />
        </group>
      </group>
    </>
  );
}

/** Soft overhead key that gives the shelves, lenses and furniture their contact shadows. */
function KeyLight() {
  const light = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    const l = light.current;
    if (!l) return;
    target.position.set(4, 0, 0);
    target.updateMatrixWorld();
    l.target = target;
    const cam = l.shadow.camera;
    cam.left = -9.5;
    cam.right = 9.5;
    cam.top = 9.5;
    cam.bottom = -9.5;
    cam.near = 1;
    cam.far = 24;
    cam.updateProjectionMatrix();  }, [target]);
  return (
    <directionalLight
      ref={light}
      position={[5, 9, 1.8]}
      intensity={1.9}
      color="#fff2e2"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-radius={4}
    />
  );
}

/**
 * Nothing that casts a shadow moves on its own, so the shadow map is drawn once and
 * again only when a lens or camera leaves or returns to the shelves, not every frame.
 */
function StaticShadows({ hidden, heldCam }: { hidden: Set<string>; heldCam: CameraId | null }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
  }, [gl, hidden, heldCam]);
  return null;
}

/** Drop to 1× pixels if the room can't hold ~45 fps, so turning stays smooth on weaker GPUs. */
function DropDprWhenSlow() {
  const setDpr = useThree((s) => s.setDpr);
  const acc = useRef({ t: 0, n: 0, low: false });
  useFrame((_, dt) => {
    const a = acc.current;
    a.t += dt;
    a.n += 1;
    if (a.t < 0.7) return;
    const fps = a.n / a.t;
    a.t = 0;
    a.n = 0;
    if (!a.low && fps < 42) {
      a.low = true;
      setDpr(1);
    }
  });
  return null;
}

function Ready({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    frames.current += 1;
    if (!done.current && frames.current > 3) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

/* ------------------------------------------------------------------ */

function Scene(props: Props & { hovered: Slot | null }) {
  const { units, slots, table } = roomLayout();
  const m = useShared();
  const heldView = useRef<HeldView>({ yaw: 0.75, pitch: 0.28, dist: 0.5 });
  const vehicle = useRef<VehiclePose>(defaultVehicle());
  const byUnit = useMemo(() => units.map((u) => slots.filter((s) => s.unit === u.id)), [units, slots]);
  const boxes = useMemo<PickBox[]>(
    () =>
      [...slots, ...table].map((slot) => {
        const c = new THREE.Vector3(...slot.world);
        const h = new THREE.Vector3(...slot.half).addScalar(0.008);
        return { slot, box: new THREE.Box3(c.clone().sub(h), c.clone().add(h)) };
      }),
    [slots, table],
  );

  return (
    <>
      <hemisphereLight args={["#fff1dc", "#6a4630", 1.05]} />
      <ambientLight intensity={0.22} color="#ffe9cf" />
      <KeyLight />
      <StaticShadows hidden={props.hidden} heldCam={props.heldCam?.id ?? null} />

      <RoomShell />
      <StaticCineRoom />
      <StaticWarehouse />
      <RamTruck pose={vehicle} />
      {units.map((u, i) => (
        <ShelfUnit key={u.id} unit={u} slots={byUnit[i]} hidden={props.hidden} m={m} />
      ))}
      <FeatureTable slots={table} hidden={props.hidden} m={m} />
      <CameraBar m={m} heldId={props.heldCam?.id ?? null} />
      {!props.held && !props.heldCam && <HoverOutline slot={props.hovered} units={units} m={m} />}
      {props.held && <HeldLens key={props.held.slot.lens.slug} slot={props.held.slot} targets={props.targets} view={heldView} />}
      {props.heldCam && (
        <HeldCamera key={props.heldCam.id} state={props.heldCam} targets={props.targets} view={heldView} viewing={props.viewfinder !== null} />
      )}

      <Player
        active={props.active}
        held={!!props.held || (!!props.heldCam && props.viewfinder === null)}
        hidden={props.hidden}
        hiddenCam={props.heldCam?.id ?? null}
        viewfinder={props.viewfinder}
        boxes={boxes}
        touch={props.touch}
        controls={props.controls}
        heldView={heldView}
        driving={props.driving}
        vehicle={vehicle}
        onHover={props.onHover}
        onGrab={props.onGrab}
        onHoverCam={props.onHoverCam}
        onGrabCam={props.onGrabCam}
        onHoverCar={props.onHoverCar}
        onEnterCar={props.onEnterCar}
        onViewZoom={props.onViewZoom}
        onLockChange={props.onLockChange}
        onLockError={props.onLockError}
      />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffe2bd" position={[0, 4, 0]} rotation-x={Math.PI / 2} scale={[10, 6, 1]} />
        <Lightformer form="rect" intensity={3} color="#e4f0ff" position={[2.5, 1.7, 5]} rotation-y={Math.PI} scale={[2.2, 1.5, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#c0392b" position={[0, 1.2, -5]} scale={[10, 2.4, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#e7d7c1" position={[-6, 1.5, 0]} rotation-y={Math.PI / 2} scale={[9, 3, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#e7d7c1" position={[6, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[9, 3, 1]} />
      </Environment>

      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom mipmapBlur luminanceThreshold={1.1} luminanceSmoothing={0.3} intensity={0.28} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.35} darkness={0.28} />
      </EffectComposer>
      <DropDprWhenSlow />
      <Ready onReady={props.onReady} />
    </>
  );
}

export default function RoomScene(props: Props & { hovered: Slot | null }) {
  return (
    <Canvas
      dpr={[1, 1.25]}
      shadows
      performance={{ min: 0.5 }}
      camera={{ fov: 62, near: 0.05, far: 520, position: [START.x, EYE, START.z] }}
      gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}
      className="!fixed inset-0 touch-none"
    >
      <color attach="background" args={["#101011"]} />
      <fog attach="fog" args={["#3e3b36", 70, 420]} />
      <Scene {...props} />
    </Canvas>
  );
}
