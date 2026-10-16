"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Lens, MountId } from "@/types/lens";
import {
  INDEX_THETA,
  RING_TRAVEL,
  buildLensProfile,
  type Group,
  type LensProfile,
  type Ring,
} from "./buildLensProfile";
import { dome, hoodGeometry, lathe, ringSolid } from "./geometries";
import { grainTexture, labelTexture, nameRingTexture, scaleTexture } from "./textures";
import { Mount } from "./Mount";
import { ApertureBlades } from "./ApertureBlades";

export interface AnimState {
  zoom: number;
  focus: number;
  closed: number;
}

interface Props {
  lens: Lens;
  mountId: MountId;
  showHood: boolean;
  /** Smoothed animation values, mutated every frame by the viewer. */
  anim: React.RefObject<AnimState>;
}

const SWITCH_THETA = Math.PI * 0.52;

function useMaterials(p: LensProfile) {
  const mats = useMemo(() => {
    const grain = grainTexture();
    const body = new THREE.MeshPhysicalMaterial({
      color: p.bodyColor,
      bumpMap: grain,
      side: THREE.DoubleSide,
    });
    if (p.bodyColor === "#b8bbc0") {
      Object.assign(body, { metalness: 0.9, roughness: 0.32, anisotropy: 0.6, bumpScale: 0.15 });
    } else if (p.bodyColor === "#e8e7e2") {
      Object.assign(body, { metalness: 0.05, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.35, bumpScale: 0.25 });
    } else {
      Object.assign(body, { metalness: 0.3, roughness: 0.55, clearcoat: 0.12, clearcoatRoughness: 0.6, bumpScale: 0.35 });
    }
    const rubber = new THREE.MeshStandardMaterial({
      color: p.rubberColor,
      roughness: 0.82,
      metalness: 0,
      bumpMap: grain,
      bumpScale: 0.8,
    });
    const gear = new THREE.MeshStandardMaterial({ color: "#1b1b1f", metalness: 0.75, roughness: 0.38 });
    const metalRing = new THREE.MeshStandardMaterial({ color: p.bodyColor, metalness: 0.6, roughness: 0.35 });
    const print = new THREE.MeshStandardMaterial({ color: p.printColor, roughness: 0.5 });
    const innerMetal = new THREE.MeshStandardMaterial({ color: "#2a2a2e", metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide });
    const hood = new THREE.MeshPhysicalMaterial({
      color: "#141416",
      roughness: 0.65,
      metalness: 0.05,
      bumpMap: grain,
      bumpScale: 0.3,
      side: THREE.DoubleSide,
    });
    return { body, rubber, gear, metalRing, print, innerMetal, hood };
  }, [p.bodyColor, p.rubberColor, p.printColor]);

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
    },
    [mats],
  );
  return mats;
}

function RingAssembly({
  ring,
  radius,
  p,
  mats,
  groupRef,
}: {
  ring: Ring;
  radius: number;
  p: LensProfile;
  mats: ReturnType<typeof useMaterials>;
  groupRef: (g: THREE.Group | null) => void;
}) {
  const geo = useMemo(
    () => ringSolid(radius, ring.r, ring.y1 - ring.y0, ring.ribs, ring.depth, ring.gear),
    [ring, radius],
  );
  const band = useMemo(() => {
    if (!ring.band) return null;
    const h = ring.band.y1 - ring.band.y0;
    const g = new THREE.CylinderGeometry(radius + 0.22, radius + 0.22, h, 256, 1, true);
    const texture = scaleTexture(ring.band.marks, p.bodyColor, p.printColor);
    return { g, texture, y: (ring.band.y0 + ring.band.y1) / 2 };
  }, [ring, radius, p.bodyColor, p.printColor]);

  const material = ring.gear ? mats.gear : ring.role === "aperture" ? mats.metalRing : mats.rubber;

  return (
    <group ref={groupRef}>
      <mesh geometry={geo} material={material} position={[0, (ring.y0 + ring.y1) / 2, 0]} />
      {band && (
        <mesh geometry={band.g} position={[0, band.y, 0]}>
          <meshStandardMaterial map={band.texture} roughness={0.5} metalness={0.25} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function BarrelLabel({ p }: { p: LensProfile }) {
  const data = useMemo(() => {
    if (!p.label) return null;
    const l = p.label;
    const { texture, aspect } = labelTexture({
      brand: l.brand,
      brandFont: l.brandFont,
      name: l.name,
      color: p.printColor,
      badge: l.badge,
    });
    let h = l.h;
    let arc = (h * aspect) / p.radius;
    const maxArc = Math.PI * 1.1;
    if (arc > maxArc) {
      h *= maxArc / arc;
      arc = maxArc;
    }
    const r = p.radius + 0.12;
    const geo = new THREE.CylinderGeometry(r, r, h, 128, 1, true, INDEX_THETA - arc / 2, arc);
    return { geo, texture, y: l.y };
  }, [p]);
  if (!data) return null;
  return (
    <mesh geometry={data.geo} position={[0, data.y, 0]}>
      <meshStandardMaterial
        map={data.texture}
        transparent
        roughness={0.45}
        metalness={0.1}
        polygonOffset
        polygonOffsetFactor={-2}
        depthWrite={false}
      />
    </mesh>
  );
}

export function LensModel({ lens, mountId, showHood, anim }: Props) {
  const p = useMemo(() => buildLensProfile(lens, mountId), [lens, mountId]);
  const mats = useMaterials(p);
  const frontGroup = useRef<THREE.Group>(null);
  const ringGroups = useRef<Partial<Record<Ring["role"], THREE.Group | null>>>({});
  const closedRef = useRef(0);

  const geos = useMemo(() => {
    const rear = lathe([...p.rear, [p.radius - 1, p.splitY]], 128);
    const front = lathe([[p.innerTubeR, p.splitY], ...p.front], 128);
    const glass = dome(p.glass.r, p.glass.bulge);
    const inner = p.innerElements.map((e) => ({ ...e, geo: dome(e.r, e.bulge) }));
    const interiorDepth = p.glass.y - p.bladesY + 6;
    const interior = new THREE.CylinderGeometry(p.glass.r, p.glass.r * 0.85, interiorDepth, 64, 1, true);
    interior.translate(0, p.glass.y - interiorDepth / 2, 0);
    const innerTube =
      p.extension > 0
        ? new THREE.CylinderGeometry(p.innerTubeR, p.innerTubeR, p.extension + 4, 128, 1, true).translate(
            0,
            p.splitY - 2 + (p.extension + 4) / 2,
            0,
          )
        : null;
    const nameRing = p.nameRing ? new THREE.RingGeometry(p.nameRing.rIn, p.nameRing.rOut, 128).rotateX(-Math.PI / 2) : null;
    const hood = p.hood ? hoodGeometry(p.hood.r0, p.hood.r1, p.hood.depth, p.hood.petalCut) : null;
    const rearGlass = dome(p.throatR - 5, 1.6);
    return { rear, front, glass, rearGlass, inner, interior, innerTube, nameRing, hood };
  }, [p]);

  const nameRingTex = useMemo(
    () => (p.nameRing ? nameRingTexture(p.nameRing.text, p.nameRing.rIn / p.nameRing.rOut, "#e5e5e5") : null),
    [p],
  );

  useFrame(() => {
    const a = anim.current;
    if (!a) return;
    if (frontGroup.current) frontGroup.current.position.y = p.extension * a.zoom;
    const g = ringGroups.current;
    if (g.focus) g.focus.rotation.y = a.focus * RING_TRAVEL.focus;
    if (g.zoom) g.zoom.rotation.y = a.zoom * RING_TRAVEL.zoom;
    if (g.aperture) g.aperture.rotation.y = -a.closed * RING_TRAVEL.aperture;
    closedRef.current = a.closed;
  });

  const at = (theta: number, r: number): [number, number] => [Math.sin(theta) * r, Math.cos(theta) * r];

  const renderDecor = (grp: Group) => (
    <>
      {p.rings
        .filter((r) => r.group === grp)
        .map((r) => (
          <RingAssembly
            key={r.role}
            ring={r}
            radius={p.radius}
            p={p}
            mats={mats}
            groupRef={(gr) => {
              ringGroups.current[r.role] = gr;
            }}
          />
        ))}
      {p.indexMarks
        .filter((m) => m.group === grp)
        .map((m, i) => {
          const [x, z] = at(INDEX_THETA, p.radius + 0.1);
          return (
            <mesh key={`i${i}`} position={[x, m.y, z]} rotation={[0, INDEX_THETA, 0]} material={mats.print}>
              <boxGeometry args={[0.55, 2, 0.3]} />
            </mesh>
          );
        })}
      {p.label?.group === grp && <BarrelLabel p={p} />}
      {p.accents
        .filter((a) => a.group === grp)
        .map((a, i) => (
          <mesh key={`a${i}`} position={[0, a.y, 0]}>
            <cylinderGeometry args={[p.radius + 0.1, p.radius + 0.1, a.h, 128, 1, true]} />
            <meshPhysicalMaterial color={a.color} metalness={0.5} roughness={0.3} clearcoat={0.6} side={THREE.DoubleSide} />
          </mesh>
        ))}
    </>
  );

  return (
    <group>
      <Mount mountId={mountId} bodyColor={p.bodyColor} />

      {/* Rear element */}
      <mesh geometry={geos.rearGlass} position={[0, -4.2, 0]} rotation={[Math.PI, 0, 0]}>
        <meshPhysicalMaterial color="#5d6f8a" metalness={0.3} roughness={0.03} clearcoat={1} transparent opacity={0.7} iridescence={0.8} />
      </mesh>

      {/* Mount index dot */}
      <mesh position={[0, 2.4, -(Math.min(p.radius, p.throatR + 5.5) + 0.05)]} scale={[1, 1, 0.35]}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color={p.indexColor} roughness={0.4} />
      </mesh>

      <mesh geometry={geos.rear} material={mats.body} />
      {geos.innerTube && <mesh geometry={geos.innerTube} material={mats.innerMetal} />}
      {renderDecor("rear")}

      {p.switches && (
        <group
          position={[at(SWITCH_THETA, p.radius + 0.7)[0], p.switches.y, at(SWITCH_THETA, p.radius + 0.7)[1]]}
          rotation={[0, SWITCH_THETA, 0]}
        >
          <RoundedBox args={[8, p.switches.h, 2]} radius={0.7} smoothness={4} material={mats.body} />
          {Array.from({ length: p.switches.count }, (_, i) => (
            <group key={i} position={[0, (i - (p.switches!.count - 1) / 2) * 7.5, 1.05]}>
              <RoundedBox args={[5.2, 3.6, 0.5]} radius={0.2} smoothness={2}>
                <meshStandardMaterial color="#0d0d0f" roughness={0.7} />
              </RoundedBox>
              <RoundedBox args={[2.2, 2.4, 1.1]} radius={0.3} smoothness={2} position={[i === 0 ? -1.2 : 1.2, 0, 0.4]}>
                <meshStandardMaterial color="#3a3a3f" roughness={0.45} metalness={0.4} />
              </RoundedBox>
            </group>
          ))}
        </group>
      )}

      <group ref={frontGroup}>
        <mesh geometry={geos.front} material={mats.body} />
        {renderDecor("front")}

        {p.hoodBayonet && (
          <mesh position={[0, p.length - 4.8, -(p.radius - 0.85)]} scale={[1, 1, 0.3]}>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
          </mesh>
        )}

        {geos.nameRing && nameRingTex && (
          <mesh geometry={geos.nameRing} position={[0, p.nameRing!.y, 0]}>
            <meshStandardMaterial map={nameRingTex} roughness={0.6} metalness={0.2} />
          </mesh>
        )}

        {/* Dark optical tunnel behind the front element */}
        <mesh geometry={geos.interior}>
          <meshStandardMaterial color="#050506" roughness={0.95} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0, p.bladesY - 6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[p.glass.r, 48]} />
          <meshStandardMaterial color="#020203" roughness={1} />
        </mesh>
        <ApertureBlades
          count={lens.bladeCount}
          outer={p.glass.r}
          y={p.bladesY}
          closedRef={closedRef}
          apertureMax={lens.apertureMax}
          apertureMin={lens.apertureMin}
        />

        {/* Internal elements: faint coated reflections deeper in the barrel */}
        {geos.inner.map((e, i) => (
          <mesh key={i} geometry={e.geo} position={[0, e.y, 0]} scale={[p.glass.oval, 1, 1]}>
            <meshPhysicalMaterial
              color="#06080b"
              metalness={0}
              roughness={0.02}
              transparent
              opacity={0.3}
              specularIntensity={1}
              specularColor={i % 2 ? "#c7a6ff" : "#7fe3b4"}
              clearcoat={1}
              clearcoatRoughness={0}
              envMapIntensity={2.2}
              depthWrite={false}
            />
          </mesh>
        ))}

        {/* Front element */}
        <mesh geometry={geos.glass} position={[0, p.glass.y + p.glass.bulge * 0.15, 0]} scale={[p.glass.oval, 1, 1]}>
          <meshPhysicalMaterial
            color={p.glass.tint}
            metalness={0.1}
            roughness={0.01}
            transparent
            opacity={0.42}
            specularIntensity={1}
            specularColor="#8ff0c2"
            clearcoat={1}
            clearcoatRoughness={0}
            iridescence={0.35}
            iridescenceIOR={1.4}
            iridescenceThicknessRange={[380, 480]}
            envMapIntensity={2.4}
            depthWrite={false}
          />
        </mesh>

        {showHood && geos.hood && p.hood && <mesh geometry={geos.hood} position={[0, p.hood.y, 0]} material={mats.hood} />}
        {p.petalHood && <PetalHood radius={p.radius} y={p.length} material={mats.hood} />}
      </group>
    </group>
  );
}

function PetalHood({ radius, y, material }: { radius: number; y: number; material: THREE.Material }) {
  const geo = useMemo(() => hoodGeometry(radius + 0.4, radius + 1.2, radius * 0.55, radius * 0.32), [radius]);
  return <mesh geometry={geo} position={[0, y - 1, 0]} material={material} />;
}
