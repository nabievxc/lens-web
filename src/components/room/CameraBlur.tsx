"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Effect, EffectAttribute } from "postprocessing";
import * as THREE from "three";

const fragment = /* glsl */ `
uniform vec2 velocity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (dot(velocity, velocity) < 1e-9) {
    outputColor = inputColor;
    return;
  }
  vec4 sum = vec4(0.0);
  for (int i = 0; i < 9; i++) {
    float t = float(i) / 8.0 - 0.5;
    sum += texture2D(inputBuffer, uv + velocity * t);
  }
  outputColor = sum / 9.0;
}
`;

class CameraBlurEffect extends Effect {
  constructor() {
    super("CameraBlur", fragment, {
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map([["velocity", new THREE.Uniform(new THREE.Vector2())]]),
    });
  }
  get velocity(): THREE.Vector2 {
    return this.uniforms.get("velocity")!.value as THREE.Vector2;
  }
}

/** Blur as a fraction of how far the picture moved this frame: 0.5 is a 180 degree shutter. */
const SHUTTER = 0.28;
/** Longest smear allowed, as a fraction of the screen. */
const MAX_SMEAR = 0.018;

/**
 * Light motion blur from turning your head. The room only ever rotates around the eye,
 * so the whole picture slides by the same amount and one blur direction fits every pixel.
 */
export function CameraBlur() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const effect = useMemo(() => new CameraBlurEffect(), []);
  const last = useRef<{ yaw: number; pitch: number } | null>(null);
  const target = useMemo(() => new THREE.Vector2(), []);

  useFrame(() => {
    const yaw = camera.rotation.y;
    const pitch = camera.rotation.x;
    const prev = last.current;
    last.current = { yaw, pitch };
    const v = effect.velocity;
    if (!prev) return;
    let dYaw = yaw - prev.yaw;
    dYaw = Math.atan2(Math.sin(dYaw), Math.cos(dYaw));
    const dPitch = pitch - prev.pitch;
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    target.set((dYaw / hfov) * SHUTTER, (-dPitch / vfov) * SHUTTER);
    // A teleport or a hitch is not motion worth smearing.
    if (target.length() > MAX_SMEAR * 4) target.set(0, 0);
    else if (target.length() > MAX_SMEAR) target.setLength(MAX_SMEAR);
    if (target.lengthSq() < 1e-8) target.set(0, 0);
    v.lerp(target, 0.6);
  });

  return <primitive object={effect} dispose={null} />;
}
