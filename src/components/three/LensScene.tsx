"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTheme } from "@/lib/theme";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { EffectComposer, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import type { Lens, MountId } from "@/types/lens";
import { LensModel, type AnimState } from "./LensModel";

export interface SceneTargets {
  zoom: number;
  focus: number;
  closed: number;
  demo: boolean;
}

interface Props {
  lens: Lens;
  mountId: MountId;
  targets: React.RefObject<SceneTargets>;
  autoRotate: boolean;
  showHood: boolean;
  interactive?: boolean;
}

const SCALE = 0.01;

function Animator({ targets, anim }: { targets: React.RefObject<SceneTargets>; anim: React.RefObject<AnimState> }) {
  useFrame((state, dt) => {
    const t = targets.current;
    const a = anim.current;
    if (!t || !a) return;
    let zoom = t.zoom;
    let focus = t.focus;
    let closed = t.closed;
    if (t.demo) {
      const time = state.clock.elapsedTime;
      zoom = 0.5 - 0.5 * Math.cos(time * 0.7);
      focus = 0.5 - 0.5 * Math.cos(time * 1.1);
      closed = 0.5 - 0.5 * Math.cos(time * 0.55);
    }
    const k = 1 - Math.exp(-dt * 6);
    a.zoom += (zoom - a.zoom) * k;
    a.focus += (focus - a.focus) * k;
    a.closed += (closed - a.closed) * k;
  });
  return null;
}

function FitCamera({ size }: { size: number }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as { target: THREE.Vector3; update: () => void } | null;
  useEffect(() => {
    const dir = new THREE.Vector3(1.05, 0.55, 1.2).normalize();
    camera.position.copy(dir.multiplyScalar(size * 2.1 + 0.4));
    camera.lookAt(0, 0, 0);
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }  }, [camera, controls, size]);
  return null;
}

/** Product-photography studio: big soft boxes give the long highlights you see on real lens barrels. */
function Studio({ light }: { light: boolean }) {
  return (
    <Environment resolution={512} environmentIntensity={light ? 1.5 : 1}>
      <color attach="background" args={[light ? "#4a4a4a" : "#08080a"]} />
      <Lightformer form="rect" intensity={5} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 3, 1]} />
      <Lightformer form="rect" intensity={2.5} position={[-7, 2, 2]} rotation-y={Math.PI / 2} scale={[8, 1.2, 1]} />
      <Lightformer form="rect" intensity={2.5} position={[7, 1, -2]} rotation-y={-Math.PI / 2} scale={[8, 0.8, 1]} />
      <Lightformer form="rect" intensity={1.2} position={[0, 1, 8]} scale={[10, 3, 1]} />
      <Lightformer form="rect" intensity={0.25} position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} />
      <Lightformer form="ring" intensity={3} position={[3, 3, 5]} scale={1.5} />
    </Environment>
  );
}

export default function LensScene({ lens, mountId, targets, autoRotate, showHood, interactive = true }: Props) {
  const anim = useRef<AnimState>({ zoom: 0, focus: 1, closed: 0 });
  const L = lens.lengthMm + lens.extensionMm * 0.5;
  const size = Math.max(L, lens.diameterMm * 1.2) * SCALE;
  const R = (lens.diameterMm / 2) * SCALE;
  const light = useTheme() === "light";
  const backdrop = useMemo(() => new THREE.Color(light ? "#ede2d1" : "#101011"), [light]);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 30, near: 0.01, far: 100, position: [2, 1, 2] }}
      gl={{ antialias: false, stencil: false }}
    >
      <primitive attach="background" object={backdrop} />
      <Animator targets={targets} anim={anim} />
      <ambientLight intensity={light ? 0.6 : 0.15} />
      <directionalLight position={[3, 5, 2]} intensity={light ? 1.8 : 1.4} />
      <directionalLight position={[-3, 1, -2]} intensity={light ? 0.8 : 0.5} color={light ? "#ffffff" : "#e6ecff"} />

      <group rotation={[Math.PI / 2, 0, 0]} scale={SCALE}>
        <group position={[0, -lens.lengthMm / 2, 0]}>
          <LensModel lens={lens} mountId={mountId} anim={anim} showHood={showHood} />
        </group>
      </group>

      <ContactShadows
        position={[0, -R - 0.04, 0]}
        opacity={light ? 0.45 : 0.6}
        scale={size * 4}
        blur={light ? 2.2 : 2.6}
        far={R * 3 + 0.2}
        resolution={512}
      />
      <Studio light={light} />

      <EffectComposer multisampling={8}>
        <N8AO aoRadius={size * 0.08} distanceFalloff={size * 0.3} intensity={2.2} quality="high" halfRes={false} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={interactive}
        enableRotate={interactive}
        autoRotate={autoRotate}
        autoRotateSpeed={1.2}
        minDistance={size * 0.6}
        maxDistance={size * 5 + 1}
      />
      <FitCamera size={size} />
    </Canvas>
  );
}
