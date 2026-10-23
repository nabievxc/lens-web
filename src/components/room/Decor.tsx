"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { APPLE_BOXES, ARMCHAIR, CHAIR, CINE, DOOR, GATE, RAM_START, ROOM, SOFTBOXES, WALL, WARE, WARE_CRATES, WARE_DOCKS, WARE_PROPS } from "./layout";
import { clockFace, concrete, labelTexture, neonTexture, plaster, printTexture, screenTexture, signTexture, woodGrain, type PrintKind } from "./roomTextures";

/** A wall plane standing on the floor, facing local +z, with an optional door cut out at local x. */
export function Wall({
  pos,
  rot,
  width,
  height,
  material,
  door,
  skirting = "#1d1715",
  crown = "#efe5d4",
}: {
  pos: [number, number, number];
  rot: number;
  width: number;
  height: number;
  material: THREE.Material;
  door?: { x: number; w: number; h: number };
  skirting?: string;
  crown?: string;
}) {
  // [centre x, width, bottom y, height] for each plaster panel, and [centre x, width] for each skirting run.
  const panels: [number, number, number, number][] = [];
  const skirts: [number, number][] = [];
  if (door) {
    const a = door.x - door.w / 2;
    const b = door.x + door.w / 2;
    const L = -width / 2;
    const R = width / 2;
    panels.push([(L + a) / 2, a - L, 0, height], [(b + R) / 2, R - b, 0, height], [door.x, door.w, door.h, height - door.h]);
    skirts.push([(L + a) / 2, a - L], [(b + R) / 2, R - b]);
  } else {
    panels.push([0, width, 0, height]);
    skirts.push([0, width]);
  }
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {panels.map(([x, w, y, h], i) => (
        <mesh key={i} position={[x, y + h / 2, 0]} material={material} receiveShadow>
          <planeGeometry args={[w, h]} />
        </mesh>
      ))}
      {skirts.map(([x, w], i) => (
        <mesh key={i} position={[x, 0.06, 0.01]}>
          <boxGeometry args={[w, 0.12, 0.02]} />
          <meshStandardMaterial color={skirting} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, height - 0.05, 0.025]}>
        <boxGeometry args={[width, 0.1, 0.05]} />
        <meshStandardMaterial color={crown} roughness={0.8} />
      </mesh>
    </group>
  );
}

/** The passage through the shared wall: reveal, threshold and a walnut frame on both faces. */
export function Doorway() {
  const x0 = ROOM.halfX;
  const x1 = ROOM.halfX + WALL;
  const cx = (x0 + x1) / 2;
  const { z, width: w, height: h } = DOOR;
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ map: woodGrain([96, 60, 38], { vertical: true, seed: 3 }), roughness: 0.55 }), []);
  return (
    <group>
      <mesh position={[cx, 0.002, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WALL, w]} />
        <meshStandardMaterial color="#3a2a20" roughness={0.6} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[cx, h / 2, z + s * (w / 2)]} rotation={[0, s > 0 ? Math.PI : 0, 0]}>
          <planeGeometry args={[WALL, h]} />
          <meshStandardMaterial color="#e2d6c3" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[cx, h, z]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WALL, w]} />
        <meshStandardMaterial color="#e2d6c3" roughness={0.95} />
      </mesh>
      {[x0 - 0.012, x1 + 0.012].map((x) => (
        <group key={x} position={[x, 0, z]}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, h / 2, s * (w / 2 + 0.04)]} material={frame} castShadow>
              <boxGeometry args={[0.03, h + 0.08, 0.08]} />
            </mesh>
          ))}
          <mesh position={[0, h + 0.04, 0]} material={frame}>
            <boxGeometry args={[0.03, 0.08, w + 0.16]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Steel opening from the cine room into the warehouse. */
export function GarageDoorway() {
  const x0 = CINE.cx + CINE.halfX;
  const x1 = x0 + WALL;
  const cx = (x0 + x1) / 2;
  const { z, width: w, height: h } = GATE;
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a3d40", metalness: 0.7, roughness: 0.4 }), []);
  return (
    <group>
      <mesh position={[cx, 0.002, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WALL + 0.4, w + 0.4]} />
        <meshStandardMaterial color="#4a453c" roughness={0.7} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[cx, h / 2, z + s * (w / 2 + 0.06)]} material={steel}>
          <boxGeometry args={[WALL + 0.08, h + 0.12, 0.12]} />
        </mesh>
      ))}
      <mesh position={[cx, h + 0.06, z]} material={steel}>
        <boxGeometry args={[WALL + 0.08, 0.12, w + 0.24]} />
      </mesh>
      {/* Rolled-up door parked above the opening */}
      <mesh position={[cx, h + 0.28, z]} rotation={[Math.PI / 2, 0, 0]} material={steel}>
        <cylinderGeometry args={[0.14, 0.14, w + 0.1, 12]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Main room decoration                                                */
/* ------------------------------------------------------------------ */

export function Pendant({ position, drop }: { position: [number, number, number]; drop: number }) {
  return (
    <group position={position}>
      <mesh position={[0, -drop / 2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, drop, 6]} />
        <meshStandardMaterial color="#1d1715" />
      </mesh>
      <mesh position={[0, -drop - 0.1, 0]}>
        <cylinderGeometry args={[0.07, 0.26, 0.22, 32, 1, true]} />
        <meshStandardMaterial color="#c0392b" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -drop - 0.18, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={new THREE.Color(4, 3.1, 2)} toneMapped={false} />
      </mesh>
      <pointLight position={[0, -drop - 0.25, 0]} intensity={5} color="#ffd9a8" distance={0} decay={2} />
    </group>
  );
}

export function Skylight({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  const [w, d] = size;
  return (
    <group position={position}>
      <mesh position={[0, -0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshBasicMaterial color={new THREE.Color(1.9, 2.05, 2.25)} toneMapped={false} />
      </mesh>
      {/* Frame and mullions */}
      {[
        [0, -d / 2, w + 0.12, 0.08],
        [0, d / 2, w + 0.12, 0.08],
      ].map(([x, z, a, b], i) => (
        <mesh key={i} position={[x, -0.04, z]}>
          <boxGeometry args={[a, 0.08, b]} />
          <meshStandardMaterial color="#efe5d4" roughness={0.8} />
        </mesh>
      ))}
      {[-w / 2, 0, w / 2].map((x) => (
        <mesh key={x} position={[x, -0.04, 0]}>
          <boxGeometry args={[0.06, 0.08, d]} />
          <meshStandardMaterial color="#efe5d4" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function CeilingFan({ position }: { position: [number, number, number] }) {
  const rotor = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (rotor.current) rotor.current.rotation.y += dt * 1.6;
  });
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ map: woodGrain([120, 80, 50], { seed: 31 }), roughness: 0.6 }), []);
  return (
    <group position={position}>
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
        <meshStandardMaterial color="#2a2522" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.56, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.14, 24]} />
        <meshStandardMaterial color="#2a2522" metalness={0.7} roughness={0.35} />
      </mesh>
      <group ref={rotor} position={[0, -0.6, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]} material={wood}>
            <boxGeometry args={[0.13, 0.012, 1.4]} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, -0.69, 0]}>
        <sphereGeometry args={[0.07, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshBasicMaterial color={new THREE.Color(2.4, 2.1, 1.7)} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function FramedPrint({ kind, position, rotation = 0, size }: { kind: PrintKind; position: [number, number, number]; rotation?: number; size: [number, number] }) {
  const tex = useMemo(() => printTexture(kind), [kind]);
  const [w, h] = size;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0, 0.015]} castShadow>
        <boxGeometry args={[w + 0.08, h + 0.08, 0.03]} />
        <meshStandardMaterial color="#1b1612" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.031]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#f6efe4" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[w - 0.12, h - 0.12]} />
        <meshStandardMaterial map={tex} roughness={0.35} />
      </mesh>
    </group>
  );
}

/** Shows the visitor's local time. */
export function WallClock({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const face = useMemo(() => clockFace(), []);
  const hour = useRef<THREE.Group>(null);
  const minute = useRef<THREE.Group>(null);
  const second = useRef<THREE.Group>(null);
  useFrame(() => {
    const d = new Date();
    const s = d.getSeconds() + d.getMilliseconds() / 1000;
    const m = d.getMinutes() + s / 60;
    const h = (d.getHours() % 12) + m / 60;
    if (second.current) second.current.rotation.z = -(s / 60) * Math.PI * 2;
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2;
  });
  const hand = (ref: React.RefObject<THREE.Group | null>, len: number, w: number, color: string, z: number) => (
    <group ref={ref} position={[0, 0, z]}>
      <mesh position={[0, len / 2 - 0.02, 0]}>
        <boxGeometry args={[w, len, 0.004]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.04, 48]} />
        <meshStandardMaterial color="#1d1715" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.041]}>
        <circleGeometry args={[0.22, 48]} />
        <meshStandardMaterial map={face} roughness={0.6} />
      </mesh>
      {hand(hour, 0.12, 0.014, "#1b1612", 0.046)}
      {hand(minute, 0.18, 0.009, "#1b1612", 0.05)}
      {hand(second, 0.2, 0.004, "#c0392b", 0.054)}
    </group>
  );
}

export function Armchair() {
  const leather = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7a3b1d", roughness: 0.45, metalness: 0.05 }), []);
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ map: woodGrain([90, 58, 36], { seed: 41 }), roughness: 0.5 }), []);
  return (
    <group position={[ARMCHAIR.x, 0, ARMCHAIR.z]} rotation={[0, -2.5, 0]}>
      <mesh position={[0, 0.3, 0]} material={leather} castShadow receiveShadow>
        <boxGeometry args={[0.78, 0.2, 0.72]} />
      </mesh>
      <mesh position={[0, 0.66, -0.32]} rotation={[-0.15, 0, 0]} material={leather} castShadow>
        <boxGeometry args={[0.78, 0.6, 0.14]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.42, 0.47, 0]} material={leather} castShadow>
          <boxGeometry args={[0.12, 0.22, 0.72]} />
        </mesh>
      ))}
      {[
        [-0.34, -0.3],
        [0.34, -0.3],
        [-0.34, 0.3],
        [0.34, 0.3],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.1, z]} material={wood} castShadow>
          <cylinderGeometry args={[0.025, 0.018, 0.2, 10]} />
        </mesh>
      ))}
    </group>
  );
}

export function FloorLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.015, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.03, 32]} />
        <meshStandardMaterial color="#1d1715" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 1.6, 10]} />
        <meshStandardMaterial color="#b08d3a" metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.66, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.26, 32, 1, true]} />
        <meshStandardMaterial color="#efe0c4" roughness={0.9} side={THREE.DoubleSide} emissive="#ffcf8a" emissiveIntensity={0.55} />
      </mesh>
      <pointLight position={[0, 1.6, 0]} intensity={2.2} color="#ffcf8a" distance={5} decay={2} />
    </group>
  );
}

/** Cluster of bare filament bulbs hanging over the rental desk. */
export function EdisonCluster({ position, ceiling }: { position: [number, number, number]; ceiling: number }) {
  const bulbs = [
    [-0.45, 2.25, 0.05],
    [-0.15, 2.0, -0.08],
    [0.15, 2.35, 0.1],
    [0.42, 2.1, -0.04],
    [0.0, 2.55, 0.0],
  ];
  return (
    <group position={position}>
      {bulbs.map(([x, y, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, (ceiling + y) / 2, 0]}>
            <cylinderGeometry args={[0.004, 0.004, ceiling - y, 6]} />
            <meshStandardMaterial color="#141210" />
          </mesh>
          <mesh position={[0, y + 0.03, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.05, 12]} />
            <meshStandardMaterial color="#8a6a2a" metalness={1} roughness={0.3} />
          </mesh>
          <mesh position={[0, y - 0.04, 0]} scale={[1, 1.35, 1]}>
            <sphereGeometry args={[0.045, 20, 16]} />
            <meshBasicMaterial color={new THREE.Color(3.2, 1.9, 0.8)} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 2.0, 0]} intensity={3.5} color="#ffb768" distance={6} decay={2} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Cine room                                                           */
/* ------------------------------------------------------------------ */

export function CineRoom() {
  const { cx, cz, halfX: X, halfZ: Z, height: H } = CINE;
  const floor = useMemo(() => concrete(), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ map: plaster("#2f3a35"), roughness: 0.95 }), []);
  const neon = useMemo(() => neonTexture("Cine room", "cameras · anamorphic · cine primes"), []);
  const screen = useMemo(() => screenTexture(), []);
  const gateSign = useMemo(() => signTexture(["Warehouse"], { bg: "#1d1715", fg: "#e7d7c1", w: 768, h: 160 }), []);
  const left = cx - X;
  return (
    <group>
      <mesh position={[cx, 0, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[X * 2, Z * 2]} />
        <meshStandardMaterial map={floor} color="#8a857f" bumpMap={floor} bumpScale={0.6} roughness={0.38} metalness={0.05} />
      </mesh>
      <mesh position={[cx, H, cz]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[X * 2, Z * 2]} />
        <meshStandardMaterial color="#1c1e1d" roughness={0.9} />
      </mesh>

      {/* Exposed ductwork and lighting truss */}
      {[-1.2, 1.6].map((dz) => (
        <mesh key={dz} position={[cx, H - 0.35, cz + dz]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, X * 2, 24]} />
          <meshStandardMaterial color="#6d7270" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
      {[-1.6, 0.4].map((dz) => (
        <Truss key={dz} position={[cx, H - 0.9, cz + dz]} length={X * 2 - 0.4} ceiling={0.9} />
      ))}
      {[-2.8, -1.2, 0.4].map((dx) => (
        <TrackSpot key={dx} position={[cx + dx, H - 0.95, cz - 1.6]} aim={[cx + dx, 1.2, cz - Z]} />
      ))}
      {[0.35, 1.65].map((dx) => (
        <TrackSpot key={dx} position={[cx + dx, H - 0.95, cz + 0.4]} aim={[cx + dx, 0.95, cz + 0.4]} />
      ))}

      {/* Screening wall, shifted toward −z so the warehouse door fits on the +z side */}
      <group position={[cx + X - 0.02, 2.0, cz - 1.05]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[3.2, 1.9]} />
          <meshStandardMaterial color="#0b0b0b" roughness={0.6} />
        </mesh>
        <mesh>
          <planeGeometry args={[2.95, 1.58]} />
          <meshBasicMaterial map={screen} color={new THREE.Color(1.15, 1.15, 1.15)} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0, 1.4]} intensity={3.5} color="#9fb6d8" distance={6} decay={2} />
      </group>

      <Wall pos={[cx, 0, cz - Z]} rot={0} width={X * 2} height={H} material={wallMat} skirting="#111111" crown="#111111" />
      <Wall pos={[cx, 0, cz + Z]} rot={Math.PI} width={X * 2} height={H} material={wallMat} skirting="#111111" crown="#111111" />
      <Wall
        pos={[cx + X, 0, cz]}
        rot={-Math.PI / 2}
        width={Z * 2}
        height={H}
        material={wallMat}
        skirting="#111111"
        crown="#111111"
        door={{ x: GATE.z, w: GATE.width, h: GATE.height }}
      />
      <GarageDoorway />
      <mesh position={[cx + X - 0.01, GATE.height + 0.22, GATE.z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.7, 0.28]} />
        <meshStandardMaterial map={gateSign} roughness={0.7} />
      </mesh>
      <Wall
        pos={[left, 0, cz]}
        rot={Math.PI / 2}
        width={Z * 2}
        height={H}
        material={wallMat}
        skirting="#111111"
        crown="#111111"
        door={{ x: cz - DOOR.z, w: DOOR.width, h: DOOR.height }}
      />

      <mesh position={[cx - 0.6, 2.75, cz + Z - 0.03]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3.6, 0.9]} />
        <meshBasicMaterial map={neon} transparent toneMapped={false} color={new THREE.Color(3.5, 3.5, 3.5)} depthWrite={false} />
      </mesh>

      <FramedPrint kind="street" position={[cx + 2.3, 2.3, cz - Z + 0.01]} size={[1.5, 1.05]} />
      <FramedPrint kind="peaks" position={[left + 0.01, 2.7, cz + 2.0]} rotation={Math.PI / 2} size={[1.3, 0.9]} />

      <DirectorChair position={[CHAIR.x, 0, CHAIR.z]} />
      {SOFTBOXES.map((s) => (
        <Softbox key={s.x} position={[s.x, 0, s.z]} rot={s.rot} />
      ))}
      <AppleBoxes position={[APPLE_BOXES.x, 0, APPLE_BOXES.z]} />
      <DollyTrack position={[cx - 1.4, 0, cz + 2.4]} />
    </group>
  );
}

const DOCK_W = 12;
const DOCK_H = 5.4;

function DockBay({ x, z, rot }: { x: number; z: number; rot: number }) {
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2e3236", metalness: 0.55, roughness: 0.4 }), []);
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, DOCK_H / 2, -0.9]}>
        <planeGeometry args={[DOCK_W, DOCK_H]} />
        <meshBasicMaterial color="#0a1020" fog={false} />
      </mesh>
      <mesh position={[0, 0.55, -0.85]}>
        <planeGeometry args={[DOCK_W, 0.7]} />
        <meshBasicMaterial color="#c45a18" fog={false} />
      </mesh>
      {[
        [-3.2, 2.4],
        [-1.1, 1.8],
        [1.4, 2.1],
        [3.4, 1.6],
      ].map(([lx, ly]) => (
        <mesh key={`${lx}${ly}`} position={[lx, ly, -0.86]}>
          <planeGeometry args={[0.35, 0.7]} />
          <meshBasicMaterial color="#e8c878" />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (DOCK_W / 2 + 0.12), DOCK_H / 2, 0.04]} material={steel}>
          <boxGeometry args={[0.24, DOCK_H + 0.2, 0.28]} />
        </mesh>
      ))}
      <mesh position={[0, DOCK_H + 0.12, 0.04]} material={steel}>
        <boxGeometry args={[DOCK_W + 0.48, 0.24, 0.28]} />
      </mesh>
      <mesh position={[0, DOCK_H + 0.42, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={steel}>
        <cylinderGeometry args={[0.16, 0.16, DOCK_W + 0.2, 10]} />
      </mesh>
      <pointLight position={[0, 4.2, 2.2]} intensity={14} distance={22} decay={2} color="#d8a060" />
    </group>
  );
}

function TrafficCone({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 10]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.05, 0.14, 0.5, 10]} />
        <meshStandardMaterial color="#e24a12" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.075, 0.1, 0.08, 10]} />
        <meshStandardMaterial color="#f4f0e8" roughness={0.6} />
      </mesh>
    </group>
  );
}

function RoadCase({ x, z, h }: { x: number; z: number; h: number }) {
  const tex = useMemo(() => labelTexture("LENS", "#d4af37", "wide"), []);
  return (
    <group position={[x, h / 2, z]}>
      <mesh>
        <boxGeometry args={[1.1, h, 0.8]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.02, 0.41]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.7, 0.16]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function Forklift({ x, z }: { x: number; z: number }) {
  const body = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c9a227", roughness: 0.45, metalness: 0.2 }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1c1d20", roughness: 0.5 }), []);
  return (
    <group position={[x, 0, z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0.7, 0.1]} material={body}>
        <boxGeometry args={[1.15, 1.15, 1.7]} />
      </mesh>
      <mesh position={[0, 1.45, -0.15]} material={dark}>
        <boxGeometry args={[1.05, 0.45, 0.9]} />
      </mesh>
      <mesh position={[0, 0.95, -1.15]} material={dark}>
        <boxGeometry args={[0.08, 1.6, 0.08]} />
      </mesh>
      <mesh position={[0.22, 0.95, -1.15]} material={dark}>
        <boxGeometry args={[0.08, 1.6, 0.08]} />
      </mesh>
      <mesh position={[0.1, 0.18, -1.45]} material={dark}>
        <boxGeometry args={[0.7, 0.08, 0.5]} />
      </mesh>
      {([-0.42, 0.42] as const).map((s) => (
        <mesh key={s} position={[s, 0.22, 0.35]} rotation={[0, 0, Math.PI / 2]} material={dark}>
          <cylinderGeometry args={[0.22, 0.22, 0.18, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function StallMark({ x, z }: { x: number; z: number }) {
  const paint = "#f2efe6";
  const len = 7.2;
  const wid = 3.1;
  return (
    <group position={[x, 0.015, z]}>
      {([-wid / 2, wid / 2] as const).map((s) => (
        <mesh key={s} position={[0, 0, s]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[len, 0.08]} />
          <meshBasicMaterial color={paint} />
        </mesh>
      ))}
      {([-len / 2, len / 2] as const).map((s) => (
        <mesh key={s} position={[s, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, wid]} />
          <meshBasicMaterial color={paint} />
        </mesh>
      ))}
    </group>
  );
}

/** 400 × 250 m night loading hall with a RAM you can drive. */
export function Warehouse() {
  const { cx, cz, halfX: X, halfZ: Z, height: H } = WARE;
  const floor = useMemo(() => {
    const t = concrete();
    t.repeat.set(40, 25);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }, []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a3834", roughness: 0.92 }), []);
  const neon = useMemo(() => neonTexture("Warehouse", "NIGHT · 100 000 m² · RAM TRX"), []);
  const ticks = useMemo(
    () => [50, 100, 150, 200, 250, 300].map((n) => ({ n, tex: labelTexture(`${n} m`, "#d4af37", "wide") })),
    [],
  );
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8a6a3a", roughness: 0.75 }), []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a3d40", metalness: 0.55, roughness: 0.45 }), []);
  const left = cx - X;
  const right = cx + X;
  const back = cz - Z;
  const dockCuts = WARE_DOCKS.map((x) => ({ a: x - DOCK_W / 2, b: x + DOCK_W / 2 }));
  const wallSpans = useMemo(() => {
    const edges = [left, ...dockCuts.flatMap((d) => [d.a, d.b]), right];
    const spans: [number, number][] = [];
    for (let i = 0; i < edges.length; i += 2) spans.push([edges[i], edges[i + 1]]);
    return spans;
  }, [left, right]);
  const beams = useMemo(() => {
    const z: number[] = [];
    for (let v = cz - Z + 20; v < cz + Z - 10; v += 40) z.push(v);
    return z;
  }, [cz, Z]);
  const bays = useMemo(() => {
    const out: [number, number][] = [];
    for (let x = cx - 160; x <= cx + 160; x += 80) {
      for (let z = cz - 80; z <= cz + 80; z += 80) out.push([x, z]);
    }
    return out;
  }, [cx, cz]);
  const posts = useMemo(() => {
    const out: [number, number][] = [];
    for (let x = cx - 150; x <= cx + 150; x += 50) {
      for (const z of [cz - 90, cz + 90]) out.push([x, z]);
    }
    return out;
  }, [cx, cz]);
  return (
    <group>
      <mesh position={[cx, 0, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[X * 2, Z * 2]} />
        <meshStandardMaterial map={floor} color="#4a4640" roughness={0.62} />
      </mesh>
      <mesh position={[cx, H, cz]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[X * 2, Z * 2]} />
        <meshStandardMaterial color="#141618" roughness={0.9} />
      </mesh>

      {wallSpans.map(([a, b]) => (
        <Wall key={`${a}${b}`} pos={[(a + b) / 2, 0, back]} rot={0} width={b - a} height={H} material={wallMat} skirting="#1a1a1a" crown="#1a1a1a" />
      ))}
      {WARE_DOCKS.map((x) => (
        <mesh key={`lintel${x}`} position={[x, (H + DOCK_H) / 2, back]}>
          <planeGeometry args={[DOCK_W, H - DOCK_H]} />
          <meshStandardMaterial color="#3a3834" roughness={0.92} />
        </mesh>
      ))}
      {WARE_DOCKS.map((x) => (
        <DockBay key={x} x={x} z={back} rot={0} />
      ))}

      <Wall pos={[cx, 0, cz + Z]} rot={Math.PI} width={X * 2} height={H} material={wallMat} skirting="#1a1a1a" crown="#1a1a1a" />
      <Wall pos={[cx + X, 0, cz]} rot={-Math.PI / 2} width={Z * 2} height={H} material={wallMat} skirting="#1a1a1a" crown="#1a1a1a" />
      <Wall
        pos={[left, 0, cz]}
        rot={Math.PI / 2}
        width={Z * 2}
        height={H}
        material={wallMat}
        skirting="#1a1a1a"
        crown="#1a1a1a"
        door={{ x: cz - GATE.z, w: GATE.width, h: GATE.height }}
      />

      <hemisphereLight args={["#6a7a92", "#1a1612", 0.22]} />
      <directionalLight position={[cx, 80, cz - 40]} intensity={0.22} color="#8aa0c0" />
      <pointLight position={[left + 8, 5.5, 0]} intensity={28} color="#f0d2a0" distance={28} decay={2} />

      {beams.map((dz) => (
        <mesh key={dz} position={[cx, H - 0.45, dz]} rotation={[0, 0, Math.PI / 2]} material={steel}>
          <boxGeometry args={[0.4, X * 2, 0.4]} />
        </mesh>
      ))}
      {bays.map(([x, z]) => (
        <group key={`${x}${z}`}>
          <mesh position={[x, H - 1.2, z]} material={steel}>
            <boxGeometry args={[1.6, 0.12, 1.6]} />
          </mesh>
          <mesh position={[x, H - 1.28, z]}>
            <boxGeometry args={[1.0, 0.06, 1.0]} />
            <meshBasicMaterial color={new THREE.Color(0.7, 0.55, 0.32)} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {posts.map(([x, z]) => (
        <group key={`${x}${z}`}>
          <mesh position={[x, H / 2, z]} material={steel}>
            <boxGeometry args={[0.45, H, 0.45]} />
          </mesh>
          <mesh position={[x, 0.7, z]}>
            <boxGeometry args={[0.48, 0.35, 0.48]} />
            <meshStandardMaterial color="#c9a227" roughness={0.5} />
          </mesh>
        </group>
      ))}

      <mesh position={[left + 8, 3.4, GATE.z + 3.2]} rotation={[0, -0.35, 0]}>
        <planeGeometry args={[7.2, 1.2]} />
        <meshBasicMaterial map={neon} transparent toneMapped={false} color={new THREE.Color(3.5, 3.5, 3.5)} depthWrite={false} />
      </mesh>

      {[-8, 8].map((z) => (
        <mesh key={z} position={[cx, 0.012, cz + z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[X * 2 - 8, 0.18]} />
          <meshBasicMaterial color="#d4af37" />
        </mesh>
      ))}
      {ticks.map(({ n, tex }) => (
        <mesh key={n} position={[left + 20 + n, 0.02, cz]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[4.5, 1.1]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
      ))}
      {[40, 90, 140, 200].map((d) => (
        <mesh key={d} position={[left + d, 0.018, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[1.6, 0.7]} />
          <meshBasicMaterial color="#d4af37" />
        </mesh>
      ))}
      {WARE_CRATES.map((c, i) => (
        <mesh key={i} position={[c.x, c.h / 2, c.z]} material={wood}>
          <boxGeometry args={[c.hw * 2, c.h, c.hd * 2]} />
        </mesh>
      ))}
      {WARE_PROPS.slice(0, 3).map((p) => (
        <RoadCase key={`${p.x}${p.z}`} x={p.x} z={p.z} h={p.h} />
      ))}
      <Forklift x={WARE_PROPS[3].x} z={WARE_PROPS[3].z} />
      <StallMark x={RAM_START.x + 0.4} z={RAM_START.z} />
      {[
        [left + 6, 3.2],
        [left + 6.6, 3.8],
        [left + 7.2, -3.4],
        [left + 12, -3.6],
        [RAM_START.x - 1.2, -2.2],
        [RAM_START.x - 1.2, 2.2],
      ].map(([x, z]) => (
        <TrafficCone key={`${x}${z}`} position={[x, 0, z]} />
      ))}
    </group>
  );
}

function Truss({ position, length, ceiling }: { position: [number, number, number]; length: number; ceiling: number }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#151515", metalness: 0.7, roughness: 0.35 }), []);
  const rungs = Math.floor(length / 0.3);
  return (
    <group position={position}>
      {[
        [0.12, 0.12],
        [-0.12, 0.12],
        [0.12, -0.12],
        [-0.12, -0.12],
      ].map(([y, z]) => (
        <mesh key={`${y}${z}`} position={[0, y, z]} rotation={[0, 0, Math.PI / 2]} material={mat}>
          <cylinderGeometry args={[0.018, 0.018, length, 8]} />
        </mesh>
      ))}
      {Array.from({ length: rungs }, (_, i) => -length / 2 + (i + 0.5) * (length / rungs)).map((x) => (
        <mesh key={x} position={[x, 0, 0.12]} rotation={[0, 0, 0.8]} material={mat}>
          <cylinderGeometry args={[0.007, 0.007, 0.34, 6]} />
        </mesh>
      ))}
      {[-length / 2 + 0.3, length / 2 - 0.3].map((x) => (
        <mesh key={x} position={[x, ceiling / 2, 0]} material={mat}>
          <cylinderGeometry args={[0.008, 0.008, ceiling, 6]} />
        </mesh>
      ))}
    </group>
  );
}

function TrackSpot({ position, aim }: { position: [number, number, number]; aim: [number, number, number] }) {
  const light = useRef<THREE.SpotLight>(null);
  const can = useRef<THREE.Group>(null);
  const [ax, ay, az] = aim;
  useEffect(() => {
    const l = light.current;
    if (l) {
      l.target.position.set(ax, ay, az);
      l.target.updateMatrixWorld();
    }
    can.current?.lookAt(ax, ay, az);
  }, [ax, ay, az]);
  return (
    <group position={position}>
      <group ref={can}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.06]}>
          <cylinderGeometry args={[0.045, 0.06, 0.16, 20]} />
          <meshStandardMaterial color="#141414" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.141]}>
          <circleGeometry args={[0.042, 20]} />
          <meshBasicMaterial color={new THREE.Color(5, 4, 2.8)} toneMapped={false} />
        </mesh>
      </group>
      <spotLight ref={light} intensity={12} angle={0.5} penumbra={0.7} distance={8} decay={2} color="#ffd6a0" />
    </group>
  );
}

function DirectorChair({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, -2.4, 0]}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.26, 0, 0]}>
          {[-1, 1].map((t) => (
            <mesh key={t} position={[0, 0.3, 0]} rotation={[t * 0.42, 0, 0]} castShadow>
              <boxGeometry args={[0.03, 0.72, 0.03]} />
              <meshStandardMaterial color="#c7a26f" roughness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, 0.66, 0]}>
            <boxGeometry args={[0.03, 0.03, 0.46]} />
            <meshStandardMaterial color="#c7a26f" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.85, -0.2]}>
            <boxGeometry args={[0.03, 0.4, 0.03]} />
            <meshStandardMaterial color="#c7a26f" roughness={0.6} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.5, 0.015, 0.4]} />
        <meshStandardMaterial color="#1d1715" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.92, -0.2]} castShadow>
        <boxGeometry args={[0.52, 0.18, 0.015]} />
        <meshStandardMaterial color="#c0392b" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Softbox({ position, rot }: { position: [number, number, number]; rot: number }) {
  return (
    <group position={position} rotation={[0, rot, 0]}>
      {[0, 2.1, 4.2].map((a) => (
        <mesh key={a} position={[Math.sin(a) * 0.25, 0.3, Math.cos(a) * 0.25]} rotation={[-Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7]}>
          <cylinderGeometry args={[0.012, 0.012, 0.75, 8]} />
          <meshStandardMaterial color="#8c8f91" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 1.5, 8]} />
        <meshStandardMaterial color="#8c8f91" metalness={0.8} roughness={0.3} />
      </mesh>
      <group position={[0, 1.75, 0.05]} rotation={[0.25, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.7, 0.7, 0.3]} />
          <meshStandardMaterial color="#0f0f0f" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.151]}>
          <planeGeometry args={[0.66, 0.66]} />
          <meshBasicMaterial color={new THREE.Color(2.2, 2.1, 1.9)} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0, 0.5]} intensity={3} color="#fff4e2" distance={6} decay={2} />
      </group>
    </group>
  );
}

function AppleBoxes({ position }: { position: [number, number, number] }) {
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ map: woodGrain([176, 132, 86], { seed: 17 }), roughness: 0.75 }), []);
  return (
    <group position={position}>
      {[
        [0, 0.1, 0, 0.2],
        [0.02, 0.3, 0.01, -0.1],
        [-0.01, 0.45, 0, 0.35],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, r, 0]} material={wood} castShadow receiveShadow>
          <boxGeometry args={[0.5, i === 2 ? 0.1 : 0.2, 0.3]} />
        </mesh>
      ))}
      <Clapperboard position={[0, 0.5, 0]} />
    </group>
  );
}

function Clapperboard({ position }: { position: [number, number, number] }) {
  const stripes = Array.from({ length: 6 }, (_, i) => i);
  return (
    <group position={position} rotation={[0, 0.6, 0]}>
      <mesh position={[0, 0.006, 0]} castShadow>
        <boxGeometry args={[0.28, 0.012, 0.24]} />
        <meshStandardMaterial color="#141414" roughness={0.6} />
      </mesh>
      <group position={[0, 0.02, -0.12]} rotation={[0.35, 0, 0]}>
        {stripes.map((i) => (
          <mesh key={i} position={[-0.14 + (i + 0.5) * (0.28 / 6), 0, 0.02]}>
            <boxGeometry args={[0.28 / 6, 0.012, 0.04]} />
            <meshStandardMaterial color={i % 2 ? "#f2f2f2" : "#141414"} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function DollyTrack({ position }: { position: [number, number, number] }) {
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a9adb2", metalness: 0.9, roughness: 0.25 }), []);
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ map: woodGrain([120, 86, 56], { seed: 51 }), roughness: 0.8 }), []);
  const L = 2.6;
  return (
    <group position={position}>
      {[-0.31, 0.31].map((z) => (
        <mesh key={z} position={[0, 0.045, z]} rotation={[0, 0, Math.PI / 2]} material={steel} castShadow>
          <cylinderGeometry args={[0.02, 0.02, L, 12]} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => -L / 2 + 0.2 + i * ((L - 0.4) / 5)).map((x) => (
        <mesh key={x} position={[x, 0.012, 0]} material={wood} receiveShadow castShadow>
          <boxGeometry args={[0.09, 0.024, 0.8]} />
        </mesh>
      ))}
      {/* Dolly platform */}
      <group position={[0.4, 0.09, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.05, 0.7]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.3} />
        </mesh>
        {[-0.28, 0.28].map((x) =>
          [-0.31, 0.31].map((z) => (
            <mesh key={`${x}${z}`} position={[x, -0.03, z]} rotation={[Math.PI / 2, 0, 0]} material={steel}>
              <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}
