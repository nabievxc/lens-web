"use client";

import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RAM_START } from "./layout";
import { labelTexture } from "./roomTextures";

export type VehiclePose = {
  x: number;
  z: number;
  yaw: number;
  speed: number;
  steer: number;
};

export function defaultVehicle(): VehiclePose {
  return { x: RAM_START.x, z: RAM_START.z, yaw: RAM_START.yaw, speed: 0, steer: 0 };
}

export const RAM = {
  length: 5.92,
  width: 2.22,
  height: 2.04,
  wheelbase: 3.69,
  track: 1.78,
  wheelR: 0.47,
  /** Driver seat in local metres. Forward is −z, left is −x. */
  seat: { x: -0.46, y: 1.28, z: -0.18 },
} as const;

function useMats() {
  return useMemo(() => {
    const body = new THREE.MeshStandardMaterial({ color: "#2c2e31", metalness: 0.72, roughness: 0.32 });
    const red = new THREE.MeshStandardMaterial({ color: "#c81e1e", metalness: 0.45, roughness: 0.38 });
    const black = new THREE.MeshStandardMaterial({ color: "#121214", roughness: 0.55, metalness: 0.2 });
    const gloss = new THREE.MeshStandardMaterial({ color: "#0a0a0c", roughness: 0.18, metalness: 0.4 });
    const rubber = new THREE.MeshStandardMaterial({ color: "#1a1a1c", roughness: 0.92 });
    const rim = new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.85, roughness: 0.28 });
    const chrome = new THREE.MeshStandardMaterial({ color: "#c8ccd0", metalness: 1, roughness: 0.22 });
    const glass = new THREE.MeshStandardMaterial({ color: "#6a7c88", roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.38 });
    const darkGlass = new THREE.MeshStandardMaterial({ color: "#1b2228", roughness: 0.12, metalness: 0.5, transparent: true, opacity: 0.72 });
    const amber = new THREE.MeshStandardMaterial({ color: "#f0a020", emissive: "#c87810", emissiveIntensity: 0.7, roughness: 0.35 });
    const light = new THREE.MeshStandardMaterial({ color: "#e8f0ff", emissive: "#dce8ff", emissiveIntensity: 1.4, roughness: 0.2 });
    const tail = new THREE.MeshStandardMaterial({ color: "#7a1010", emissive: "#5a0808", emissiveIntensity: 0.6, roughness: 0.4 });
    const interior = new THREE.MeshStandardMaterial({ color: "#1a1c1e", roughness: 0.8 });
    const leather = new THREE.MeshStandardMaterial({ color: "#2a2422", roughness: 0.7 });
    return { body, red, black, gloss, rubber, rim, chrome, glass, darkGlass, amber, light, tail, interior, leather };
  }, []);
}

function Wheel({ radius = RAM.wheelR }: { radius?: number }) {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[radius, radius, 0.32, 20]} />
        <meshStandardMaterial color="#1a1a1c" roughness={0.92} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.62, radius * 0.62, 0.34, 16]} />
        <meshStandardMaterial color="#1c1c1e" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.36, 10]} />
        <meshStandardMaterial color="#c8ccd0" metalness={1} roughness={0.22} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} rotation={[0, (i / 8) * Math.PI * 2, Math.PI / 2]} position={[0, 0, 0]}>
          <boxGeometry args={[0.06, 0.33, 0.1]} />
          <meshStandardMaterial color="#141416" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/** Crew-cab RAM TRX in the photo: grey body, red hood, red boards, black wheels. */
export const RamTruck = memo(function RamTruck({ pose }: { pose: React.RefObject<VehiclePose> }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group[]>([]);
  const steerG = useRef<THREE.Group[]>([]);
  const wheel = useRef(0);
  const helm = useRef<THREE.Group>(null);
  const m = useMats();
  const ram = useMemo(() => labelTexture("RAM", "#f4f4f4", "wide"), []);
  const trx = useMemo(() => labelTexture("TRX", "#c81e1e", "wide"), []);
  const wb = RAM.wheelbase / 2;
  const tr = RAM.track / 2;

  useFrame((_, dt) => {
    const v = pose.current;
    const g = group.current;
    if (!g) return;
    g.position.set(v.x, 0, v.z);
    g.rotation.y = v.yaw;
    wheel.current += (v.speed / RAM.wheelR) * dt;
    for (const w of spin.current) if (w) w.rotation.x = wheel.current;
    for (const w of steerG.current) if (w) w.rotation.y = v.steer;
    if (helm.current) helm.current.rotation.z = -v.steer * 6;
  });

  const setSpin = (i: number) => (el: THREE.Group | null) => {
    if (el) spin.current[i] = el;
  };
  const setSteer = (i: number) => (el: THREE.Group | null) => {
    if (el) steerG.current[i] = el;
  };

  return (
    <group ref={group}>
      {/* Lower body / rocker */}
      <mesh position={[0, 0.62, -0.15]} material={m.body}>
        <boxGeometry args={[2.02, 0.42, 5.15]} />
      </mesh>
      {/* Cab */}
      <mesh position={[0, 1.22, -0.22]} material={m.body}>
        <boxGeometry args={[1.96, 0.82, 1.85]} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.78, -0.18]} material={m.body}>
        <boxGeometry args={[1.72, 0.16, 1.72]} />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 1.08, -1.72]} material={m.body}>
        <boxGeometry args={[1.92, 0.22, 1.28]} />
      </mesh>
      {/* Red hood graphic */}
      <mesh position={[0, 1.2, -1.72]} material={m.red}>
        <boxGeometry args={[0.72, 0.04, 1.18]} />
      </mesh>
      <mesh position={[0, 1.16, -1.28]} material={m.red}>
        <boxGeometry args={[0.55, 0.1, 0.28]} />
      </mesh>
      {/* Front bumper / fascia */}
      <mesh position={[0, 0.52, -2.72]} material={m.black}>
        <boxGeometry args={[2.08, 0.42, 0.38]} />
      </mesh>
      <mesh position={[0, 0.78, -2.58]} material={m.gloss}>
        <boxGeometry args={[1.55, 0.55, 0.12]} />
      </mesh>
      {/* Grille */}
      <mesh position={[0, 0.92, -2.655]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.95, 0.22]} />
        <meshBasicMaterial map={ram} transparent toneMapped={false} />
      </mesh>
      {[-0.42, -0.14, 0.14, 0.42].map((x) => (
        <mesh key={x} position={[x, 0.72, -2.66]} material={m.black}>
          <boxGeometry args={[0.22, 0.38, 0.04]} />
        </mesh>
      ))}
      {/* Headlights */}
      <mesh position={[-0.78, 0.88, -2.68]} material={m.light}>
        <boxGeometry args={[0.42, 0.14, 0.06]} />
      </mesh>
      <mesh position={[0.78, 0.88, -2.68]} material={m.light}>
        <boxGeometry args={[0.42, 0.14, 0.06]} />
      </mesh>
      <mesh position={[-0.92, 0.72, -2.66]} material={m.amber}>
        <boxGeometry args={[0.12, 0.1, 0.06]} />
      </mesh>
      <mesh position={[0.92, 0.72, -2.66]} material={m.amber}>
        <boxGeometry args={[0.12, 0.1, 0.06]} />
      </mesh>
      {/* Bed */}
      <mesh position={[0, 0.95, 1.55]} material={m.body}>
        <boxGeometry args={[1.92, 0.08, 2.35]} />
      </mesh>
      {[-0.92, 0.92].map((x) => (
        <mesh key={x} position={[x, 1.18, 1.55]} material={m.body}>
          <boxGeometry args={[0.08, 0.5, 2.35]} />
        </mesh>
      ))}
      <mesh position={[0, 1.18, 2.7]} material={m.body}>
        <boxGeometry args={[1.92, 0.5, 0.08]} />
      </mesh>
      <mesh position={[0, 1.22, 0.42]} material={m.body}>
        <boxGeometry args={[1.92, 0.42, 0.12]} />
      </mesh>
      {/* Tail lights */}
      <mesh position={[-0.78, 1.18, 2.75]} material={m.tail}>
        <boxGeometry args={[0.32, 0.18, 0.05]} />
      </mesh>
      <mesh position={[0.78, 1.18, 2.75]} material={m.tail}>
        <boxGeometry args={[0.32, 0.18, 0.05]} />
      </mesh>
      {/* Red running boards */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.08, 0.42, 0.15]} material={m.red}>
          <boxGeometry args={[0.16, 0.08, 2.35]} />
        </mesh>
      ))}
      {/* Fender flares */}
      {[
        [-1.05, 0.62, -wb],
        [1.05, 0.62, -wb],
        [-1.05, 0.62, wb],
        [1.05, 0.62, wb],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} material={m.black}>
          <boxGeometry args={[0.16, 0.42, 0.85]} />
        </mesh>
      ))}
      {/* Windows */}
      <mesh position={[0, 1.42, -1.12]} material={m.glass}>
        <boxGeometry args={[1.7, 0.42, 0.06]} />
      </mesh>
      <mesh position={[0, 1.42, 0.68]} material={m.darkGlass}>
        <boxGeometry args={[1.7, 0.42, 0.06]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.99, 1.4, -0.22]} material={m.darkGlass}>
          <boxGeometry args={[0.05, 0.4, 1.55]} />
        </mesh>
      ))}
      {/* Interior */}
      <mesh position={[0, 0.92, -0.2]} material={m.interior}>
        <boxGeometry args={[1.7, 0.08, 1.5]} />
      </mesh>
      <mesh position={[-0.46, 1.08, -0.18]} material={m.leather}>
        <boxGeometry args={[0.5, 0.38, 0.52]} />
      </mesh>
      <mesh position={[0.46, 1.08, -0.18]} material={m.leather}>
        <boxGeometry args={[0.5, 0.38, 0.52]} />
      </mesh>
      <mesh position={[0, 1.02, -0.72]} material={m.black}>
        <boxGeometry args={[1.55, 0.28, 0.28]} />
      </mesh>
      <group ref={helm} position={[-0.46, 1.18, -0.62]}>
        <mesh rotation={[0.7, 0, 0]} material={m.black}>
          <torusGeometry args={[0.16, 0.025, 8, 18]} />
        </mesh>
      </group>
      {/* Side TRX mark */}
      <mesh position={[1.02, 0.95, 0.9]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.38, 0.12]} />
        <meshBasicMaterial map={trx} transparent toneMapped={false} />
      </mesh>
      {/* Wheels: front steers */}
      <group ref={setSteer(0)} position={[-tr, RAM.wheelR, -wb]}>
        <group ref={setSpin(0)}>
          <Wheel />
        </group>
      </group>
      <group ref={setSteer(1)} position={[tr, RAM.wheelR, -wb]}>
        <group ref={setSpin(1)}>
          <Wheel />
        </group>
      </group>
      <group position={[-tr, RAM.wheelR, wb]} ref={setSpin(2)}>
        <Wheel />
      </group>
      <group position={[tr, RAM.wheelR, wb]} ref={setSpin(3)}>
        <Wheel />
      </group>
    </group>
  );
});
