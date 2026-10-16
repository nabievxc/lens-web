"use client";

import { useMemo } from "react";
import type { MountId } from "@/types/lens";
import { MOUNTS } from "@/data/mounts";
import { annularSector, lathe } from "./geometries";

interface Props {
  mountId: MountId;
  bodyColor: string;
}

const CHROME = { color: "#d9dadc", metalness: 1, roughness: 0.18 } as const;

export function Mount({ mountId, bodyColor }: Props) {
  const mount = MOUNTS[mountId];
  const throatR = mount.throatMm / 2;
  const pl = mountId === "PL";

  const geos = useMemo(() => {
    const flangeOuter = throatR + (pl ? 7 : 4);
    const flange = lathe(
      [
        [throatR - 0.5, 0.2],
        [flangeOuter, 0.2],
        [flangeOuter, -1.6],
        [throatR + 1.2, -1.6],
        [throatR - 0.5, -1.6],
        [throatR - 0.5, 0.2],
      ],
      96,
    );
    const tubeDepth = pl ? 14 : 7;
    const tube = lathe(
      [
        [throatR - 1.2, -1.6],
        [throatR - 1.2, -tubeDepth],
        [throatR - 5, -tubeDepth],
      ],
      96,
    );
    const lugSpan = ((Math.PI * 2) / mount.tabs) * (pl ? 0.5 : 0.38);
    const lugs = Array.from({ length: mount.tabs }, (_, i) => {
      const mid = (Math.PI * 2 * i) / mount.tabs + Math.PI / 2;
      return annularSector(throatR - 0.8, throatR + (pl ? 3 : 2), mid - lugSpan / 2, mid + lugSpan / 2, pl ? 2.2 : 1.2);
    });
    const lockRing = pl
      ? lathe(
          [
            [throatR + 4, -1.8],
            [throatR + 9, -1.8],
            [throatR + 9, -9],
            [throatR + 4, -9],
          ],
          64,
        )
      : null;
    return { flange, tube, lugs, lockRing, tubeDepth };
  }, [throatR, pl, mount.tabs]);

  const contacts = mount.contacts;
  const contactArc = Math.min(1.4, contacts * 0.1);

  return (
    <group>
      <mesh geometry={geos.flange}>
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh geometry={geos.tube}>
        <meshStandardMaterial color={bodyColor === "#e8e7e2" ? "#1c1c1f" : "#161618"} roughness={0.7} metalness={0.2} side={2} />
      </mesh>
      {geos.lugs.map((g, i) => (
        <mesh key={i} geometry={g} position={[0, -2.4, 0]}>
          <meshStandardMaterial {...CHROME} />
        </mesh>
      ))}
      {Array.from({ length: 4 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 4 + Math.PI / 4;
        const r = throatR + 1.9;
        return (
          <group key={`s${i}`} position={[Math.sin(a) * r, -1.75, Math.cos(a) * r]} rotation={[0, a, 0]}>
            <mesh>
              <cylinderGeometry args={[0.8, 0.8, 0.35, 20]} />
              <meshStandardMaterial color="#b9bbbf" metalness={1} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.18, 0]}>
              <boxGeometry args={[1.1, 0.12, 0.22]} />
              <meshStandardMaterial color="#202024" />
            </mesh>
          </group>
        );
      })}
      {geos.lockRing && (
        <mesh geometry={geos.lockRing}>
          <meshStandardMaterial color="#2a2a2e" metalness={0.8} roughness={0.35} />
        </mesh>
      )}
      {Array.from({ length: contacts }, (_, i) => {
        const a = -Math.PI / 2 - contactArc / 2 + (contactArc * (i + 0.5)) / contacts;
        const r = throatR - 3;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, -geos.tubeDepth + 0.6, Math.sin(a) * r]}
            rotation={[0, -a, 0]}
          >
            <boxGeometry args={[1.6, 1.2, 1]} />
            <meshStandardMaterial color="#d6a648" metalness={1} roughness={0.25} />
          </mesh>
        );
      })}
    </group>
  );
}
