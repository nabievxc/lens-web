"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { bladeGeometry } from "./geometries";

interface Props {
  count: number;
  outer: number;
  y: number;
  /** 0 = wide open, 1 = stopped all the way down. */
  closedRef: React.RefObject<number>;
  apertureMax: number;
  apertureMin: number;
}

export function ApertureBlades({ count, outer, y, closedRef, apertureMax, apertureMin }: Props) {
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const last = useRef(-1);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#4a4a52",
        metalness: 0.85,
        roughness: 0.32,
        side: THREE.DoubleSide,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    const closed = closedRef.current ?? 0;
    if (Math.abs(closed - last.current) < 0.0005 || count < 3) return;
    last.current = closed;
    const fNumber = apertureMax * Math.pow(apertureMin / apertureMax, closed);
    const hole = outer * 0.94 * (apertureMax / fNumber);
    const twist = closed * 0.9;
    meshes.current.forEach((m, i) => {
      if (!m) return;
      m.geometry.dispose();
      m.geometry = bladeGeometry(i, count, hole, outer, twist);
    });
  });

  if (count < 3) {
    return (
      <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={material}>
        <ringGeometry args={[outer * 0.25, outer, 48]} />
      </mesh>
    );
  }

  return (
    <group position={[0, y, 0]}>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m;
          }}
          position={[0, i * 0.04, 0]}
          material={material}
        >
          <bufferGeometry />
        </mesh>
      ))}
    </group>
  );
}
