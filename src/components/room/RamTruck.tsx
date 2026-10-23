"use client";

import { memo, useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RAM_START } from "./layout";
import { labelTexture, leatherBump, metalBump } from "./roomTextures";

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
  length: 5.91,
  width: 2.23,
  height: 2.05,
  wheelbase: 3.69,
  track: 1.98,
  wheelR: 0.52,
  /** Driver eye, local metres. Forward is −z, cabin left is −x. */
  seat: { x: -0.38, y: 1.46, z: 0.12 },
} as const;

type Mats = ReturnType<typeof useMats>;

function dashFace() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 160;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0e1013";
  ctx.fillRect(0, 0, 512, 160);
  ctx.fillStyle = "#1a1d22";
  ctx.fillRect(8, 8, 496, 144);
  const dial = (x: number, label: string, angle: number) => {
    ctx.beginPath();
    ctx.arc(x, 72, 46, 0, Math.PI * 2);
    ctx.fillStyle = "#07080a";
    ctx.fill();
    ctx.strokeStyle = "#6a7078";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, 72, 40, Math.PI * 0.75, Math.PI * 2.15);
    ctx.strokeStyle = "#c0392b";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, 72);
    ctx.lineTo(x + Math.cos(angle) * 32, 72 + Math.sin(angle) * 32);
    ctx.strokeStyle = "#e8e8ea";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#9aa0a8";
    ctx.font = "600 12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(label, x, 138);
  };
  dial(110, "RPM", -0.4);
  dial(256, "MPH", 0.55);
  ctx.fillStyle = "#0a0c0e";
  ctx.fillRect(360, 28, 120, 88);
  ctx.fillStyle = "#c9a227";
  ctx.font = "700 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("TRX", 420, 52);
  ctx.fillStyle = "#7a9a5a";
  ctx.font = "600 11px system-ui";
  ctx.fillText("DRIVE", 420, 74);
  ctx.fillStyle = "#8a9098";
  ctx.fillText("72°F", 420, 96);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function grilleTex() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0c0d10";
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = "#3c4046";
  ctx.lineWidth = 1.2;
  for (let y = 3; y < 124; y += 9) {
    for (let x = 4; x < 250; x += 11) {
      ctx.strokeRect(x, y, 8, 7);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function useMats() {
  return useMemo(() => {
    const bead = metalBump(false);
    const leather = leatherBump();
    const body = new THREE.MeshPhysicalMaterial({
      color: "#6a7078",
      metalness: 0.48,
      roughness: 0.34,
      clearcoat: 0.65,
      clearcoatRoughness: 0.2,
      bumpMap: bead,
      bumpScale: 0.12,
    });
    const red = new THREE.MeshPhysicalMaterial({
      color: "#b01012",
      metalness: 0.32,
      roughness: 0.3,
      clearcoat: 0.78,
      clearcoatRoughness: 0.14,
    });
    const black = new THREE.MeshStandardMaterial({ color: "#121214", roughness: 0.48, metalness: 0.25, bumpMap: bead, bumpScale: 0.25 });
    const gloss = new THREE.MeshStandardMaterial({ color: "#0a0a0c", roughness: 0.16, metalness: 0.45 });
    const rubber = new THREE.MeshStandardMaterial({ color: "#161618", roughness: 0.92 });
    const rim = new THREE.MeshStandardMaterial({ color: "#1c1d20", metalness: 0.9, roughness: 0.2 });
    const chrome = new THREE.MeshStandardMaterial({ color: "#c5c8cc", metalness: 1, roughness: 0.18 });
    const glass = new THREE.MeshStandardMaterial({
      color: "#c5d0d6",
      roughness: 0.04,
      metalness: 0.15,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
      fog: false,
    });
    const darkGlass = new THREE.MeshStandardMaterial({
      color: "#243038",
      roughness: 0.08,
      metalness: 0.22,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      fog: false,
    });
    const amber = new THREE.MeshStandardMaterial({ color: "#e89a18", emissive: "#c07010", emissiveIntensity: 0.85, roughness: 0.3 });
    const light = new THREE.MeshStandardMaterial({ color: "#eef3ff", emissive: "#dce8ff", emissiveIntensity: 1.8, roughness: 0.18 });
    const tail = new THREE.MeshStandardMaterial({ color: "#6a0e10", emissive: "#4a0808", emissiveIntensity: 0.7, roughness: 0.35 });
    const interior = new THREE.MeshStandardMaterial({ color: "#1a1c1e", roughness: 0.82 });
    const hide = new THREE.MeshStandardMaterial({ color: "#2a2422", roughness: 0.7, bumpMap: leather, bumpScale: 0.55 });
    const plastic = new THREE.MeshStandardMaterial({ color: "#151618", roughness: 0.52 });
    return { body, red, black, gloss, rubber, rim, chrome, glass, darkGlass, amber, light, tail, interior, hide, plastic };
  }, []);
}

function Wheel({ m, radius = RAM.wheelR }: { m: Mats; radius?: number }) {
  const w = 0.32;
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]} material={m.rubber} castShadow>
        <cylinderGeometry args={[radius, radius, w, 28]} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} material={m.rubber}>
        <torusGeometry args={[radius * 0.86, 0.045, 8, 24]} />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 0.12, 0, 0]} material={m.rim}>
            <cylinderGeometry args={[radius * 0.7, radius * 0.7, 0.08, 24]} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 0.15, 0, 0]} material={m.gloss}>
            <cylinderGeometry args={[radius * 0.24, radius * 0.24, 0.05, 16]} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 0.17, 0, 0]} material={m.chrome}>
            <cylinderGeometry args={[0.04, 0.04, 0.04, 12]} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} rotation={[(i / 8) * Math.PI * 2, 0, 0]} position={[side * 0.13, 0, 0]} material={m.rim}>
              <boxGeometry args={[0.05, 0.045, radius * 0.52]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Mirror({ m, side }: { m: Mats; side: 1 | -1 }) {
  return (
    <group position={[side * 1.08, 1.28, -0.88]} rotation={[0, side * 0.22, 0]}>
      <mesh position={[side * 0.06, -0.02, 0.06]} material={m.black}>
        <boxGeometry args={[0.12, 0.04, 0.18]} />
      </mesh>
      <RoundedBox args={[0.12, 0.2, 0.07]} radius={0.02} smoothness={3} position={[side * 0.16, 0.04, 0]} material={m.black} />
      <mesh position={[side * 0.16, 0.04, -0.038]} material={m.chrome}>
        <planeGeometry args={[0.09, 0.14]} />
      </mesh>
    </group>
  );
}

/** Crew-cab RAM TRX: grey paint, red stripe, open cabin you can sit in. */
export const RamTruck = memo(function RamTruck({ pose }: { pose: React.RefObject<VehiclePose> }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group[]>([]);
  const steerG = useRef<THREE.Group[]>([]);
  const wheel = useRef(0);
  const helm = useRef<THREE.Group>(null);
  const m = useMats();
  const ram = useMemo(() => labelTexture("RAM", "#f3f3f3", "wide"), []);
  const trx = useMemo(() => labelTexture("TRX", "#c81e1e", "wide"), []);
  const gauges = useMemo(() => dashFace(), []);
  const mesh = useMemo(() => grilleTex(), []);
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
    if (helm.current) helm.current.rotation.z = -v.steer * 7;
  });

  const setSpin = (i: number) => (el: THREE.Group | null) => {
    if (el) spin.current[i] = el;
  };
  const setSteer = (i: number) => (el: THREE.Group | null) => {
    if (el) steerG.current[i] = el;
  };

  return (
    <group ref={group}>
      {/* Chassis — narrower than the track so the tires read from the front. */}
      <RoundedBox args={[1.62, 0.28, 4.7]} radius={0.04} smoothness={3} position={[0, 0.5, -0.08]} material={m.body} castShadow />
      <mesh position={[0, 0.34, 0]} material={m.black}>
        <boxGeometry args={[1.2, 0.16, 4.4]} />
      </mesh>

      {/* Door skins — thin, so the cabin is hollow. */}
      {([-1, 1] as const).map((s) => (
        <group key={s}>
          <RoundedBox args={[0.09, 0.9, 2.05]} radius={0.03} smoothness={3} position={[s * 0.96, 1.1, -0.12]} material={m.body} castShadow />
          <mesh position={[s * 1.01, 1.14, -0.14]} material={m.black}>
            <boxGeometry args={[0.02, 0.012, 1.85]} />
          </mesh>
          {[-0.62, 0.28].map((z) => (
            <mesh key={z} position={[s * 1.01, 1.18, z]} material={m.black}>
              <boxGeometry args={[0.016, 0.42, 0.018]} />
            </mesh>
          ))}
          <RoundedBox args={[0.05, 0.04, 0.14]} radius={0.01} smoothness={2} position={[s * 1.02, 1.08, -0.42]} material={m.black} />
          <mesh position={[s * 1.02, 0.92, -1.05]} material={m.amber}>
            <boxGeometry args={[0.03, 0.06, 0.08]} />
          </mesh>
        </group>
      ))}

      {/* Cowl between hood and glass */}
      <RoundedBox args={[1.86, 0.16, 0.28]} radius={0.04} smoothness={3} position={[0, 1.18, -1.18]} material={m.body} />
      {/* Roof */}
      <RoundedBox args={[1.72, 0.07, 1.72]} radius={0.04} smoothness={4} position={[0, 1.9, -0.08]} material={m.body} />
      <mesh position={[0, 1.94, -0.08]} material={m.black}>
        <boxGeometry args={[1.52, 0.03, 1.52]} />
      </mesh>
      {/* Rear cab wall */}
      <RoundedBox args={[1.84, 0.72, 0.08]} radius={0.03} smoothness={3} position={[0, 1.02, 0.92]} material={m.body} />
      <RoundedBox args={[1.7, 0.12, 0.08]} radius={0.02} smoothness={3} position={[0, 1.84, 0.9]} material={m.body} />

      {/* Hood, sloped onto the grille */}
      <group position={[0, 1.02, -1.92]} rotation={[-0.14, 0, 0]}>
        <RoundedBox args={[1.86, 0.16, 1.48]} radius={0.05} smoothness={4} material={m.body} castShadow />
        <mesh position={[0, 0.09, 0.04]} material={m.red}>
          <boxGeometry args={[0.38, 0.02, 1.32]} />
        </mesh>
        <RoundedBox args={[0.42, 0.1, 0.42]} radius={0.03} smoothness={3} position={[0, 0.12, 0.38]} material={m.black} />
        <mesh position={[0, 0.18, 0.38]} material={m.red}>
          <boxGeometry args={[0.28, 0.04, 0.3]} />
        </mesh>
      </group>
      {/* Front fenders */}
      {([-1, 1] as const).map((s) => (
        <RoundedBox key={s} args={[0.28, 0.42, 1.35]} radius={0.08} smoothness={4} position={[s * 0.98, 0.82, -1.85]} material={m.body} />
      ))}

      {/* Bumper + grille */}
      <RoundedBox args={[2.12, 0.36, 0.38]} radius={0.05} smoothness={4} position={[0, 0.38, -2.72]} material={m.black} />
      <mesh position={[0, 0.22, -2.78]} material={m.chrome}>
        <boxGeometry args={[0.9, 0.04, 0.28]} />
      </mesh>
      <RoundedBox args={[1.72, 0.58, 0.12]} radius={0.03} smoothness={3} position={[0, 0.78, -2.58]} material={m.gloss} />
      <mesh position={[0, 0.72, -2.645]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.58, 0.48]} />
        <meshStandardMaterial map={mesh} roughness={0.45} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.02, -2.66]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.88, 0.18]} />
        <meshBasicMaterial map={ram} transparent toneMapped={false} />
      </mesh>
      {([-0.52, 0.52] as const).map((x) => (
        <mesh key={x} position={[x, 0.32, -2.9]} material={m.black}>
          <torusGeometry args={[0.045, 0.012, 6, 12]} />
        </mesh>
      ))}

      {/* Headlights wrap the corners */}
      {([-1, 1] as const).map((s) => (
        <group key={s} position={[s * 0.86, 0.84, -2.62]}>
          <RoundedBox args={[0.42, 0.14, 0.1]} radius={0.03} smoothness={3} material={m.chrome} />
          <RoundedBox args={[0.36, 0.09, 0.07]} radius={0.02} smoothness={3} position={[0, 0.01, -0.03]} material={m.light} />
          <mesh position={[s * 0.18, 0, 0.08]} rotation={[0, s * 0.7, 0]} material={m.light}>
            <boxGeometry args={[0.12, 0.08, 0.06]} />
          </mesh>
          <mesh position={[s * 0.22, -0.14, 0.04]} material={m.amber}>
            <boxGeometry args={[0.1, 0.07, 0.06]} />
          </mesh>
        </group>
      ))}
      {([-0.42, 0.42] as const).map((x) => (
        <mesh key={x} position={[x, 0.4, -2.88]} material={m.light}>
          <boxGeometry args={[0.16, 0.08, 0.05]} />
        </mesh>
      ))}

      {/* Bed */}
      <mesh position={[0, 0.88, 1.62]} material={m.black}>
        <boxGeometry args={[1.78, 0.05, 2.15]} />
      </mesh>
      {([-0.9, 0.9] as const).map((x) => (
        <RoundedBox key={x} args={[0.08, 0.5, 2.18]} radius={0.02} smoothness={3} position={[x, 1.12, 1.62]} material={m.body} />
      ))}
      <RoundedBox args={[1.82, 0.5, 0.08]} radius={0.02} smoothness={3} position={[0, 1.12, 2.68]} material={m.body} />
      <RoundedBox args={[1.82, 0.42, 0.1]} radius={0.02} smoothness={3} position={[0, 1.14, 0.52]} material={m.body} />
      {([-1, 1] as const).map((s) => (
        <RoundedBox key={s} args={[0.32, 0.18, 0.07]} radius={0.02} smoothness={3} position={[s * 0.72, 1.14, 2.74]} material={m.tail} />
      ))}

      {/* Running boards + flares */}
      {([-1, 1] as const).map((s) => (
        <RoundedBox key={s} args={[0.2, 0.06, 2.2]} radius={0.02} smoothness={3} position={[s * 1.08, 0.38, 0.05]} material={m.red} />
      ))}
      {(
        [
          [-tr - 0.04, -wb],
          [tr + 0.04, -wb],
          [-tr - 0.04, wb],
          [tr + 0.04, wb],
        ] as const
      ).map(([x, z], i) => (
        <RoundedBox key={i} args={[0.1, 0.2, 0.62]} radius={0.04} smoothness={3} position={[x, 0.92, z]} material={m.body} />
      ))}

      {/* Greenhouse */}
      <mesh position={[0, 1.52, -1.12]} rotation={[-0.52, 0, 0]} material={m.glass}>
        <planeGeometry args={[1.52, 0.62]} />
      </mesh>
      <mesh position={[0, 1.54, 0.88]} rotation={[0.06, 0, 0]} material={m.darkGlass}>
        <planeGeometry args={[1.48, 0.5]} />
      </mesh>
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * 0.99, 1.52, -0.12]} rotation={[0, (s * -Math.PI) / 2, 0]} material={m.darkGlass}>
          <planeGeometry args={[1.72, 0.5]} />
        </mesh>
      ))}
      {([-1, 1] as const).map((s) => (
        <group key={s}>
          <mesh position={[s * 0.84, 1.52, -1.08]} rotation={[0.48, 0, s * 0.14]} material={m.body}>
            <boxGeometry args={[0.07, 0.62, 0.08]} />
          </mesh>
          <mesh position={[s * 0.9, 1.56, 0.86]} rotation={[-0.08, 0, s * -0.08]} material={m.body}>
            <boxGeometry args={[0.07, 0.5, 0.08]} />
          </mesh>
        </group>
      ))}
      <Mirror m={m} side={-1} />
      <Mirror m={m} side={1} />

      {/* Cabin — built around the driver eye so first-person is a dash, not a grey wall. */}
      <mesh position={[0, 0.86, -0.08]} material={m.interior}>
        <boxGeometry args={[1.72, 0.05, 1.7]} />
      </mesh>
      <mesh position={[0, 1.84, -0.1]} material={m.plastic}>
        <boxGeometry args={[1.6, 0.04, 1.55]} />
      </mesh>
      <RoundedBox args={[0.5, 0.38, 0.48]} radius={0.05} smoothness={3} position={[-0.38, 1.02, 0.18]} material={m.hide} />
      <RoundedBox args={[0.48, 0.28, 0.16]} radius={0.04} smoothness={3} position={[-0.38, 1.28, 0.32]} material={m.hide} />
      <RoundedBox args={[0.5, 0.38, 0.48]} radius={0.05} smoothness={3} position={[0.4, 1.02, 0.18]} material={m.hide} />
      <RoundedBox args={[0.48, 0.28, 0.16]} radius={0.04} smoothness={3} position={[0.4, 1.28, 0.32]} material={m.hide} />
      {/* Dash cowling */}
      <RoundedBox args={[1.68, 0.28, 0.42]} radius={0.05} smoothness={4} position={[0, 1.08, -0.62]} material={m.plastic} />
      <mesh position={[0, 1.2, -0.78]} rotation={[-0.48, 0, 0]}>
        <planeGeometry args={[0.78, 0.22]} />
        <meshBasicMaterial map={gauges} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.32, -0.72]} material={m.black}>
        <boxGeometry args={[1.5, 0.04, 0.18]} />
      </mesh>
      <group ref={helm} position={[-0.38, 1.22, -0.42]}>
        <mesh rotation={[1.15, 0, 0]} material={m.plastic}>
          <cylinderGeometry args={[0.016, 0.02, 0.22, 8]} />
        </mesh>
        <mesh position={[0, 0.04, -0.1]} rotation={[0.62, 0, 0]} material={m.black}>
          <torusGeometry args={[0.16, 0.02, 8, 24]} />
        </mesh>
        <mesh position={[0, 0.04, -0.1]} rotation={[0.62, 0, 0]} material={m.plastic}>
          <cylinderGeometry args={[0.05, 0.05, 0.03, 12]} />
        </mesh>
      </group>
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * 0.9, 1.02, -0.12]} material={m.hide}>
          <boxGeometry args={[0.05, 0.32, 1.4]} />
        </mesh>
      ))}
      {/* Interior rear-view */}
      <mesh position={[0, 1.72, -0.92]} material={m.black}>
        <boxGeometry args={[0.28, 0.08, 0.04]} />
      </mesh>
      <mesh position={[1.0, 0.92, 0.95]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.38, 0.11]} />
        <meshBasicMaterial map={trx} transparent toneMapped={false} />
      </mesh>

      <mesh position={[0.7, 0.28, 2.74]} rotation={[Math.PI / 2, 0, 0]} material={m.chrome}>
        <cylinderGeometry args={[0.05, 0.055, 0.18, 12]} />
      </mesh>
      <mesh position={[0.56, 0.28, 2.74]} rotation={[Math.PI / 2, 0, 0]} material={m.chrome}>
        <cylinderGeometry args={[0.05, 0.055, 0.18, 12]} />
      </mesh>

      <group ref={setSteer(0)} position={[-tr, RAM.wheelR, -wb]}>
        <group ref={setSpin(0)}>
          <Wheel m={m} />
        </group>
      </group>
      <group ref={setSteer(1)} position={[tr, RAM.wheelR, -wb]}>
        <group ref={setSpin(1)}>
          <Wheel m={m} />
        </group>
      </group>
      <group position={[-tr, RAM.wheelR, wb]} ref={setSpin(2)}>
        <Wheel m={m} />
      </group>
      <group position={[tr, RAM.wheelR, wb]} ref={setSpin(3)}>
        <Wheel m={m} />
      </group>
    </group>
  );
});
