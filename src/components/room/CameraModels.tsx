"use client";

import { memo, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Lens } from "@/types/lens";
import { LensModel, type AnimState } from "../three/LensModel";
import type { CameraBody, Fit } from "./cameras";
import { labelTexture, leatherBump, metalBump } from "./roomTextures";

/*
 * Camera bodies in millimetres. The origin is the centre of the lens mount face, the lens points
 * along +z and the body sits behind it in -z, so a lens can be dropped on at the origin.
 * Seen from behind (the operator's view), camera right is -x and camera left is +x.
 */

type V3 = [number, number, number];

let bumps: { leather: THREE.Texture; bead: THREE.Texture; brushed: THREE.Texture } | null = null;
function bumpMaps() {
  bumps ??= { leather: leatherBump(), bead: metalBump(false), brushed: metalBump(true) };
  return bumps;
}

function useBodyMats() {
  return useMemo(() => {
    const b = bumpMaps();
    return {
      // Sony's magnesium shell: matte, finely textured paint.
      shell: new THREE.MeshPhysicalMaterial({ color: "#1d1e20", roughness: 0.62, metalness: 0.15, bumpMap: b.bead, bumpScale: 0.6, clearcoat: 0.08 }),
      leather: new THREE.MeshStandardMaterial({ color: "#151516", roughness: 0.88, bumpMap: b.leather, bumpScale: 2.2 }),
      rubber: new THREE.MeshStandardMaterial({ color: "#121213", roughness: 0.93 }),
      // RED's black anodised aluminium.
      anodised: new THREE.MeshPhysicalMaterial({ color: "#18181a", roughness: 0.42, metalness: 0.7, bumpMap: b.bead, bumpScale: 0.35, clearcoat: 0.2, clearcoatRoughness: 0.5 }),
      anodisedDark: new THREE.MeshStandardMaterial({ color: "#0e0e0f", roughness: 0.55, metalness: 0.6, bumpMap: b.brushed, bumpScale: 0.4 }),
      steel: new THREE.MeshStandardMaterial({ color: "#d4d6da", roughness: 0.18, metalness: 1, bumpMap: b.brushed, bumpScale: 0.25 }),
      chrome: new THREE.MeshStandardMaterial({ color: "#eeeeee", roughness: 0.08, metalness: 1 }),
      brass: new THREE.MeshStandardMaterial({ color: "#c9a548", roughness: 0.3, metalness: 1 }),
      red: new THREE.MeshPhysicalMaterial({ color: "#d0201a", roughness: 0.3, clearcoat: 0.6, emissive: "#3a0402", emissiveIntensity: 0.6 }),
      tally: new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.25, 0.15), toneMapped: false }),
      white: new THREE.MeshStandardMaterial({ color: "#e8e8e8", roughness: 0.5 }),
      hole: new THREE.MeshStandardMaterial({ color: "#050505", roughness: 0.95 }),
      throat: new THREE.MeshStandardMaterial({ color: "#050505", roughness: 0.95, side: THREE.DoubleSide }),
      sensor: new THREE.MeshPhysicalMaterial({ color: "#223047", roughness: 0.05, metalness: 0.5, iridescence: 1, iridescenceIOR: 1.9, clearcoat: 1 }),
      glassOff: new THREE.MeshPhysicalMaterial({ color: "#060708", roughness: 0.05, metalness: 0.2, clearcoat: 1 }),
      battery: new THREE.MeshStandardMaterial({ color: "#1f2022", roughness: 0.7, metalness: 0.1 }),
    };
  }, []);
}
type BodyMats = ReturnType<typeof useBodyMats>;

/* ------------------------------------------------------------------ */
/* Small parts                                                         */
/* ------------------------------------------------------------------ */

function Screen({ size, texture, m }: { size: [number, number]; texture?: THREE.Texture | null; m: BodyMats }) {
  return (
    <group>
      {texture ? (
        <mesh>
          <planeGeometry args={size} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      ) : (
        <mesh material={m.glassOff}>
          <planeGeometry args={size} />
        </mesh>
      )}
      {/* Cover glass: a faint reflective layer over the picture */}
      <mesh position={[0, 0, 0.15]}>
        <planeGeometry args={size} />
        <meshPhysicalMaterial color="#000" transparent opacity={0.12} roughness={0.04} metalness={0} clearcoat={1} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Label({ text, size, color, position, rotation, font }: { text: string; size: [number, number]; color: string; position: V3; rotation?: V3; font: "sans" | "wide" }) {
  const tex = useMemo(() => labelTexture(text, color, font), [text, color, font]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

/** Rotation that turns a cylinder's +y axis to point along the given axis. */
type Axis = "x" | "y" | "z" | "-x" | "-y" | "-z";
const AXIS: Record<Axis, V3> = {
  x: [0, 0, -Math.PI / 2],
  y: [0, 0, 0],
  z: [Math.PI / 2, 0, 0],
  "-x": [0, 0, Math.PI / 2],
  "-y": [Math.PI, 0, 0],
  "-z": [-Math.PI / 2, 0, 0],
};

/** A round button or dial standing out of a face along `axis`, with an optional metal bezel. */
function Button({ at, axis, r, h, mat, bezel, m, seg = 32 }: { at: V3; axis: Axis; r: number; h: number; mat: THREE.Material; bezel?: boolean; m: BodyMats; seg?: number }) {
  return (
    <group position={at} rotation={AXIS[axis]}>
      <mesh material={mat} position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r * 0.96, r, h, seg]} />
      </mesh>
      {bezel && (
        <mesh material={m.steel} position={[0, 0.3, 0]}>
          <cylinderGeometry args={[r + 1.1, r + 1.1, 0.6, seg, 1, true]} />
        </mesh>
      )}
    </group>
  );
}

/** Knurled dial: a cylinder ringed with fine ridges. */
function Dial({ at, axis, r, h, m }: { at: V3; axis: Axis; r: number; h: number; m: BodyMats }) {
  const ridges = Math.round(r * 4.5);
  return (
    <group position={at} rotation={AXIS[axis]}>
      <mesh material={m.anodisedDark}>
        <cylinderGeometry args={[r - 0.4, r - 0.4, h, 48]} />
      </mesh>
      {Array.from({ length: ridges }, (_, i) => {
        const a = (i / ridges) * Math.PI * 2;
        return (
          <mesh key={i} material={m.anodisedDark} position={[Math.cos(a) * (r - 0.3), 0, Math.sin(a) * (r - 0.3)]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.8, h * 0.92, 0.7]} />
          </mesh>
        );
      })}
    </group>
  );
}

/** 1/4"-20 threaded mounting hole, flush with a face whose normal is `axis`. */
function Thread({ at, axis, m, r = 3.2 }: { at: V3; axis: Axis; m: BodyMats; r?: number }) {
  return (
    <group position={at} rotation={AXIS[axis]}>
      <mesh material={m.hole}>
        <cylinderGeometry args={[r, r, 0.5, 24]} />
      </mesh>
      <mesh material={m.steel} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[r + 0.9, r + 0.9, 0.4, 24, 1, true]} />
      </mesh>
    </group>
  );
}

/** Open mount throat with the sensor at the bottom, seen when no lens is on. */
function Throat({ r, depth, m }: { r: number; depth: number; m: BodyMats }) {
  return (
    <group>
      <mesh position={[0, 0, -depth / 2]} rotation={[Math.PI / 2, 0, 0]} material={m.throat}>
        <cylinderGeometry args={[r, r, depth, 48, 1, true]} />
      </mesh>
      <mesh position={[0, 0, -depth + 0.5]} material={m.sensor}>
        <planeGeometry args={[r * 1.3, r * 0.9]} />
      </mesh>
    </group>
  );
}

/** Stainless bayonet: outer flange, mounting face and the inner tabs a lens locks behind. */
function Bayonet({ rIn, rOut, z, tabs, m }: { rIn: number; rOut: number; z: number; tabs: number; m: BodyMats }) {
  const gap = (Math.PI * 2) / tabs;
  return (
    <group position={[0, 0, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1.2]} material={m.steel}>
        <cylinderGeometry args={[rOut, rOut, 2.4, 96, 1, true]} />
      </mesh>
      <mesh material={m.steel}>
        <ringGeometry args={[rIn, rOut, 96]} />
      </mesh>
      {Array.from({ length: tabs }, (_, i) => (
        <mesh key={i} position={[0, 0, -1]} material={m.steel}>
          <ringGeometry args={[rIn - 2.4, rIn + 0.2, 24, 1, i * gap + 0.25, gap * 0.62]} />
        </mesh>
      ))}
      {/* Machined screws in the flange */}
      {Array.from({ length: 4 }, (_, i) => {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        const rr = (rIn + rOut) / 2;
        return (
          <mesh key={`s${i}`} position={[Math.cos(a) * rr, Math.sin(a) * rr, 0.15]} rotation={[Math.PI / 2, 0, 0]} material={m.chrome}>
            <cylinderGeometry args={[1, 1, 0.3, 12]} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Fins of a heat sink: thin plates running along z. */
function Fins({ x0, x1, count, y, h, z0, z1, m }: { x0: number; x1: number; count: number; y: number; h: number; z0: number; z1: number; m: BodyMats }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[x0 + ((x1 - x0) * i) / (count - 1), y + h / 2, (z0 + z1) / 2]} material={m.anodisedDark}>
          <boxGeometry args={[1.4, h, z1 - z0]} />
        </mesh>
      ))}
    </>
  );
}

/** Slotted vent: dark slots across a face whose normal is `axis`. */
function Vent({ at, axis, slots, w, gap, len, m }: { at: V3; axis: "x" | "z"; slots: number; w: number; gap: number; len: number; m: BodyMats }) {
  const rot: V3 = axis === "x" ? [0, Math.PI / 2, 0] : [0, 0, 0];
  return (
    <group position={at} rotation={rot}>
      {Array.from({ length: slots }, (_, i) => (
        <mesh key={i} position={[0, (i - (slots - 1) / 2) * (w + gap), 0]} material={m.hole}>
          <boxGeometry args={[len, w, 0.6]} />
        </mesh>
      ))}
    </group>
  );
}

function StrapLug({ at, side, m }: { at: V3; side: 1 | -1; m: BodyMats }) {
  return (
    <group position={at} rotation={[0, 0, (side * Math.PI) / 2]}>
      <mesh material={m.steel}>
        <torusGeometry args={[3.6, 1.1, 10, 24, Math.PI]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Sony FX3                                                            */
/* ------------------------------------------------------------------ */

export const SonyFX3 = memo(function SonyFX3({ screen }: { screen?: THREE.Texture | null }) {
  const m = useBodyMats();
  // Shell: x -64..52, y -37..39, z -50..-2. The grip fills x -78..-56 and reaches forward to z +28.
  return (
    <group>
      {/* Main shell and the front face around the mount */}
      <RoundedBox args={[116, 76, 48]} radius={5.5} smoothness={5} position={[-6, 1, -26]} material={m.shell} castShadow />
      <RoundedBox args={[100, 70, 2]} radius={4} smoothness={3} position={[-4, 0, -1.6]} material={m.shell} />
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.8]} material={m.shell}>
        <cylinderGeometry args={[33.5, 34.5, 1.6, 96]} />
      </mesh>

      {/* Grip: leatherette front, sculpted back for the thumb */}
      <RoundedBox args={[34, 75, 44]} radius={13} smoothness={6} position={[-61, 0.5, 6]} material={m.leather} castShadow />
      <RoundedBox args={[24, 74, 38]} radius={9} smoothness={5} position={[-66, 1, -31]} material={m.shell} castShadow />
      <RoundedBox args={[16, 24, 3]} radius={1.4} smoothness={3} position={[-62, 22, -50.4]} material={m.leather} />
      {/* Memory card door on the grip side */}
      <RoundedBox args={[1.6, 40, 22]} radius={0.7} smoothness={2} position={[-78.2, 2, -32]} material={m.shell} />

      {/* E-mount */}
      <Bayonet rIn={23} rOut={30.5} z={1.4} tabs={4} m={m} />
      <Throat r={23} depth={18} m={m} />
      {/* Lens release button and mount index */}
      <Button at={[37.5, -10, -0.2]} axis="z" r={5} h={2.4} mat={m.shell} bezel m={m} />
      <mesh position={[9, 31.8, 0.1]} material={m.white}>
        <circleGeometry args={[1.1, 16]} />
      </mesh>
      {/* Tally lamp and AF illuminator window */}
      <mesh position={[42, 30, -0.5]} material={m.tally}>
        <boxGeometry args={[3, 3, 0.6]} />
      </mesh>
      <mesh position={[-40, 27, -0.5]} material={m.glassOff}>
        <circleGeometry args={[2.4, 20]} />
      </mesh>
      {/* Front control dial, tucked into the top of the grip */}
      <Dial at={[-61, 31, 23]} axis="y" r={8.5} h={4.6} m={m} />

      {/* Top plate */}
      <Fins x0={-34} x1={34} count={14} y={39} h={3.2} z0={-46} z1={-27} m={m} />
      <group position={[0, 39, -14]}>
        {/* Multi Interface shoe */}
        <mesh position={[0, 0.7, 0]} material={m.anodisedDark}>
          <boxGeometry args={[24, 1.4, 21]} />
        </mesh>
        {[-11, 11].map((x) => (
          <mesh key={x} position={[x, 2.1, 0]} material={m.steel}>
            <boxGeometry args={[2.2, 1.6, 21]} />
          </mesh>
        ))}
        <mesh position={[0, 1.5, 9]} material={m.brass}>
          <boxGeometry args={[14, 0.3, 2]} />
        </mesh>
      </group>
      {[[-24, -6], [24, -6], [0, -34]].map(([x, z]) => (
        <Thread key={`${x}${z}`} at={[x, 39, z]} axis="y" m={m} />
      ))}
      {/* Record button, custom buttons and the shutter button with its zoom lever */}
      <Button at={[-44, 39, -12]} axis="y" r={4.6} h={1.6} mat={m.red} bezel m={m} />
      <Button at={[-40, 39, -33]} axis="y" r={3} h={1.2} mat={m.shell} m={m} />
      <Button at={[-30, 39, -33]} axis="y" r={3} h={1.2} mat={m.shell} m={m} />
      <Button at={[-61, 38, 12]} axis="y" r={5} h={2.4} mat={m.chrome} m={m} />
      <group position={[-61, 38.6, 12]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.anodisedDark}>
          <torusGeometry args={[7.4, 1.5, 12, 40]} />
        </mesh>
        <mesh position={[8.5, 0, 3]} material={m.anodisedDark}>
          <boxGeometry args={[4, 2.6, 4]} />
        </mesh>
      </group>
      {/* Rear dial at the top right corner */}
      <Dial at={[-50, 35, -50]} axis="y" r={7.5} h={4} m={m} />

      {/* Vari-angle screen on a side hinge */}
      <group position={[-4, 3, -53.6]}>
        <RoundedBox args={[80, 55, 5]} radius={2.2} smoothness={3} material={m.shell} />
        <group position={[0, 0, -2.6]} rotation={[0, Math.PI, 0]}>
          <Screen size={[72, 46]} texture={screen} m={m} />
        </group>
      </group>
      <mesh position={[39, 3, -51.6]} material={m.anodisedDark}>
        <cylinderGeometry args={[2.6, 2.6, 40, 16]} />
      </mesh>
      {/* Rear controls on the thumb side */}
      <group position={[-62, -12, -50.2]}>
        <mesh material={m.anodisedDark}>
          <torusGeometry args={[8, 2, 12, 40]} />
        </mesh>
        <Button at={[0, 0, 0]} axis="-z" r={4.4} h={1.4} mat={m.shell} m={m} />
      </group>
      <group position={[-62, 6, -50.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh material={m.rubber} position={[0, 2, 0]}>
          <cylinderGeometry args={[2.6, 3.2, 4, 16]} />
        </mesh>
      </group>
      {[[-52, 30], [-72, 30], [-52, -30], [-72, -30]].map(([x, y]) => (
        <Button key={`${x}${y}`} at={[x, y, -50]} axis="-z" r={2.8} h={1} mat={m.shell} m={m} />
      ))}

      {/* Port doors and vents on the left side */}
      {[18, -2, -22].map((y) => (
        <RoundedBox key={y} args={[1.8, 17, 30]} radius={0.8} smoothness={2} position={[52.3, y, -26]} material={m.rubber} />
      ))}
      <Vent at={[52.1, 33, -26]} axis="x" slots={3} w={1.3} gap={1.5} len={30} m={m} />
      <Vent at={[-41, 28, -50.1]} axis="z" slots={3} w={1.2} gap={1.6} len={10} m={m} />
      <StrapLug at={[53, 32, -40]} side={-1} m={m} />
      <StrapLug at={[-79, 32, -20]} side={1} m={m} />

      {/* Tripod socket */}
      <Thread at={[0, -37, -26]} axis="-y" m={m} r={3.6} />

      <Label text="SONY" color="#e9e9e9" font="wide" size={[30, 7.5]} position={[-6, 35, -0.55]} />
      <Label text="FX3" color="#dcdcdc" font="sans" size={[13, 5]} position={[36, -28, -0.55]} />
      <Label text="CINEMA LINE" color="#9a9a9a" font="wide" size={[22, 3]} position={[28, 32.5, -0.55]} />
    </group>
  );
});

/* ------------------------------------------------------------------ */
/* RED Komodo 6K                                                       */
/* ------------------------------------------------------------------ */

export const RedKomodo = memo(function RedKomodo({ screen }: { screen?: THREE.Texture | null }) {
  const m = useBodyMats();
  const knurls = 48;
  // Body: x ±50.8, y -37.65..57.65, z -80..0. Mount stands proud to z +5; batteries hang off the back.
  return (
    <group>
      <RoundedBox args={[101.6, 95.3, 78]} radius={4.5} smoothness={5} position={[0, 10, -41]} material={m.anodised} castShadow />
      {/* Front plate, a separate machined part */}
      <RoundedBox args={[99, 92.5, 4]} radius={2.5} smoothness={3} position={[0, 10, -1.6]} material={m.anodisedDark} />
      {/* Side pockets machined into the aluminium */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[1, 70, 56]} radius={0.4} smoothness={2} position={[s * 50.7, 6, -44]} material={m.anodisedDark} />
      ))}

      {/* Locking RF mount: knurled lock collar, lever and stainless flange */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.8]} material={m.anodisedDark}>
        <cylinderGeometry args={[39, 40, 3.6, 96]} />
      </mesh>
      {Array.from({ length: knurls }, (_, i) => {
        const a = (i / knurls) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 40.2, Math.sin(a) * 40.2, 1.8]} rotation={[0, 0, a]} material={m.rubber}>
            <boxGeometry args={[1.4, 1.6, 3.4]} />
          </mesh>
        );
      })}
      <group position={[31, -27, 2]} rotation={[0, 0, 0.72]}>
        <RoundedBox args={[7, 22, 5]} radius={1.6} smoothness={3} position={[0, -6, 0]} material={m.anodisedDark} />
        <RoundedBox args={[7.6, 8, 5.6]} radius={2} smoothness={3} position={[0, -15, 0]} material={m.rubber} />
      </group>
      <mesh position={[0, 38.4, 3.7]} material={m.red}>
        <circleGeometry args={[1.4, 16]} />
      </mesh>
      <Bayonet rIn={27} rOut={34} z={5} tabs={3} m={m} />
      <group position={[0, 0, 5]}>
        <Throat r={27} depth={24} m={m} />
      </group>
      {/* Front tally and user button */}
      <mesh position={[-40, 50, 0.6]} material={m.tally}>
        <boxGeometry args={[6, 1.6, 0.6]} />
      </mesh>
      <Button at={[40, 46, 0.4]} axis="z" r={3.4} h={1.4} mat={m.anodisedDark} bezel m={m} />

      {/* Top: recessed touchscreen and mounting points */}
      <group position={[0, 57.65, -40]}>
        <RoundedBox args={[86, 3, 58]} radius={1.2} smoothness={2} position={[0, -0.9, 0]} material={m.rubber} />
        <group position={[0, 0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <Screen size={[76, 43]} texture={screen} m={m} />
        </group>
      </group>
      {[[-44, -6], [44, -6], [-44, -74], [44, -74], [0, -76]].map(([x, z]) => (
        <Thread key={`${x}${z}`} at={[x, 57.65, z]} axis="y" m={m} />
      ))}

      {/* Camera left: record and user buttons */}
      <group>
        <Button at={[50.8, 32, -20]} axis="x" r={8} h={2.6} mat={m.red} bezel m={m} />
        <Button at={[50.8, 32, -38]} axis="x" r={4.2} h={1.6} mat={m.anodisedDark} bezel m={m} />
        <Button at={[50.8, 32, -50]} axis="x" r={4.2} h={1.6} mat={m.anodisedDark} bezel m={m} />
      </group>
      <Label text="KOMODO" color="#f0f0f0" font="wide" size={[52, 8]} position={[51.35, 8, -44]} rotation={[0, Math.PI / 2, 0]} />
      <Label text="6K" color="#d0201a" font="wide" size={[14, 8]} position={[51.35, -4, -62]} rotation={[0, Math.PI / 2, 0]} />

      {/* Camera right: I/O and the CFast door */}
      <group position={[-50.8, 0, 0]}>
        <RoundedBox args={[2, 16, 52]} radius={0.8} smoothness={2} position={[-0.4, 36, -44]} material={m.anodisedDark} />
        {/* SDI out (BNC) */}
        <group position={[0, -16, -26]} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={m.chrome} position={[0, 3, 0]}>
            <cylinderGeometry args={[5.4, 5.4, 6, 24]} />
          </mesh>
          <mesh material={m.hole} position={[0, 6.1, 0]}>
            <cylinderGeometry args={[3.2, 3.2, 0.4, 20]} />
          </mesh>
        </group>
        {/* EXT (LEMO), audio and USB-C */}
        <group position={[0, -16, -44]} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={m.anodisedDark} position={[0, 2.5, 0]}>
            <cylinderGeometry args={[4.6, 4.6, 5, 24]} />
          </mesh>
          <mesh material={m.red} position={[0, 5.1, 3.4]}>
            <boxGeometry args={[1, 0.3, 1]} />
          </mesh>
        </group>
        <group position={[0, -16, -58]} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={m.chrome} position={[0, 1, 0]}>
            <cylinderGeometry args={[3, 3, 2, 20]} />
          </mesh>
        </group>
        <RoundedBox args={[1, 3.4, 9.4]} radius={0.5} smoothness={2} position={[-0.3, -2, -58]} material={m.hole} />
        <Vent at={[-0.2, -26, -44]} axis="x" slots={3} w={1.3} gap={1.8} len={40} m={m} />
      </group>
      <Label text="RED" color="#d0201a" font="wide" size={[20, 7]} position={[-34, 48, 0.55]} />

      {/* Back: fan exhaust above, dual battery plate below */}
      <group position={[0, 0, -80]}>
        <RoundedBox args={[78, 22, 2]} radius={1} smoothness={2} position={[0, 42, -0.6]} material={m.anodisedDark} />
        <Vent at={[0, 42, -1.7]} axis="z" slots={6} w={1.6} gap={1.6} len={70} m={m} />
        <RoundedBox args={[94, 64, 4]} radius={2} smoothness={2} position={[0, -2, -2]} material={m.anodisedDark} />
        {[-22.5, 22.5].map((x) => (
          <group key={x} position={[x, -3, -14]}>
            <RoundedBox args={[41, 58, 24]} radius={3} smoothness={3} material={m.battery} castShadow />
            <mesh position={[0, 4, -12.1]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[30, 16]} />
              <meshStandardMaterial color="#3a3b3e" roughness={0.6} />
            </mesh>
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} position={[-8 + i * 5.3, -20, -12.2]} material={i < 3 ? m.tally : m.hole}>
                <boxGeometry args={[3.6, 1.4, 0.3]} />
              </mesh>
            ))}
          </group>
        ))}
        {/* DC in */}
        <group position={[40, 26, -1]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh material={m.chrome} position={[0, 2, 0]}>
            <cylinderGeometry args={[3.6, 3.6, 4, 20]} />
          </mesh>
        </group>
      </group>

      {/* Mounting points underneath */}
      {[-20, 0, 20].map((x) => (
        <Thread key={x} at={[x, -37.65, -40]} axis="-y" m={m} r={x === 0 ? 4.6 : 3.2} />
      ))}
    </group>
  );
});

/* ------------------------------------------------------------------ */

/** A short tube between a camera and an adapted lens. */
function Adapter({ length, r, m }: { length: number; r: number; m: BodyMats }) {
  return (
    <group>
      <mesh position={[0, 0, length / 2]} rotation={[Math.PI / 2, 0, 0]} material={m.anodisedDark} castShadow>
        <cylinderGeometry args={[r, r, length, 64]} />
      </mesh>
      {/* Knurled grip band and a red index ring */}
      <mesh position={[0, 0, length * 0.45]} rotation={[Math.PI / 2, 0, 0]} material={m.rubber}>
        <cylinderGeometry args={[r + 0.6, r + 0.6, length * 0.35, 64, 1, true]} />
      </mesh>
      <mesh position={[0, 0, length * 0.82]} rotation={[Math.PI / 2, 0, 0]} material={m.red}>
        <cylinderGeometry args={[r + 0.3, r + 0.3, 1.2, 64, 1, true]} />
      </mesh>
    </group>
  );
}

/** A camera body with a lens on it (through an adapter when needed). Millimetres, lens along +z. */
export function CameraWithLens({
  cam,
  lens,
  lensFit,
  anim,
  screen,
}: {
  cam: CameraBody;
  lens: Lens | null;
  lensFit: Fit;
  anim: React.RefObject<AnimState>;
  screen?: THREE.Texture | null;
}) {
  const m = useBodyMats();
  const front = cam.id === "komodo" ? 5 : 0;
  const adapter = lensFit?.adapter ?? 0;
  return (
    <group>
      {cam.id === "fx3" ? <SonyFX3 screen={screen} /> : <RedKomodo screen={screen} />}
      {lens && lensFit && (
        <group position={[0, 0, front]}>
          {adapter > 0 && <Adapter length={adapter} r={cam.id === "komodo" ? 33 : 30} m={m} />}
          <group position={[0, 0, adapter]} rotation={[Math.PI / 2, 0, 0]}>
            <LensModel lens={lens} mountId={lensFit.mount} anim={anim} showHood={false} />
          </group>
        </group>
      )}
    </group>
  );
}

/** Distance from the mount face to the front of the lens, in mm. */
export function rigLength(cam: CameraBody, lens: Lens | null, lensFit: Fit) {
  return (cam.id === "komodo" ? 5 : 0) + (lensFit?.adapter ?? 0) + (lens ? lens.lengthMm + lens.extensionMm : 0);
}
