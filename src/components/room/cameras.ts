import type { Lens, MountId } from "@/types/lens";
import { LENSES } from "@/data/lenses";
import { CAMERA_BAR } from "./layout";

export type CameraId = "fx3" | "komodo";

export interface CameraBody {
  id: CameraId;
  brand: string;
  name: string;
  mount: MountId;
  /** Mounts that go on with a common adapter, in order of preference. */
  adapts: MountId[];
  /** Recorded area of the sensor in mm (the video crop, not the full stills sensor). */
  sensor: { w: number; h: number; label: string };
  recording: string;
  fps: string;
  iso: number;
  weightG: number;
  priceUsd: number;
  /** Body size in mm: width, height, depth. */
  size: [number, number, number];
  /** Where the camera stands on the display table, in world metres. */
  display: [number, number, number];
  defaultLens: string[];
}

/** Flange focal distance in mm, which sets how long an adapter has to be. */
const FLANGE: Record<MountId, number> = {
  E: 18,
  Z: 16,
  RF: 20,
  L: 20,
  X: 17.7,
  M43: 19.25,
  EF: 44,
  F: 46.5,
  PL: 52,
  GFX: 26.7,
};

export const CAMERAS: Record<CameraId, CameraBody> = {
  fx3: {
    id: "fx3",
    brand: "Sony",
    name: "FX3",
    mount: "E",
    adapts: ["EF", "F", "PL"],
    sensor: { w: 35.6, h: 20.0, label: "Full frame, 12.1 MP" },
    recording: "4K 23.98p · XAVC S-I 4:2:2 10-bit",
    fps: "23.98",
    iso: 800,
    weightG: 640,
    priceUsd: 3898,
    size: [129.7, 77.8, 84.5],
    display: [CAMERA_BAR.x - 0.65, CAMERA_BAR.h, CAMERA_BAR.z],
    defaultLens: ["sony-fe-24-70mm-f2-8-gm-ii", "sony-fe-35mm-f1-4-gm"],
  },
  komodo: {
    id: "komodo",
    brand: "RED",
    name: "Komodo 6K",
    mount: "RF",
    adapts: ["EF", "PL"],
    sensor: { w: 27.03, h: 14.26, label: "Super 35, 6K global shutter" },
    recording: "6K 17:9 · REDCODE RAW HQ",
    fps: "24.00",
    iso: 800,
    weightG: 950,
    priceUsd: 5995,
    // Depth includes the mount and the pair of BP batteries on the back.
    size: [101.6, 95.3, 111],
    display: [CAMERA_BAR.x + 0.65, CAMERA_BAR.h, CAMERA_BAR.z],
    defaultLens: ["zeiss-cp-3-50mm-t2-1", "canon-rf-28-70mm-f2-l-usm"],
  },
};

export const CAMERA_LIST = Object.values(CAMERAS);

export type Fit = { mount: MountId; adapter: number } | null;

/** How a lens goes on a camera: natively (adapter length 0), through an adapter, or not at all. */
export function fit(cam: CameraBody, lens: Lens): Fit {
  if (lens.mounts.includes(cam.mount)) return { mount: cam.mount, adapter: 0 };
  for (const m of cam.adapts) {
    if (lens.mounts.includes(m)) return { mount: m, adapter: FLANGE[m] - FLANGE[cam.mount] };
  }
  return null;
}

export function lensesFor(cam: CameraBody): Lens[] {
  return LENSES.filter((l) => fit(cam, l)).sort((a, b) => (fit(cam, a)!.adapter > 0 ? 1 : 0) - (fit(cam, b)!.adapter > 0 ? 1 : 0));
}

export function defaultLensFor(cam: CameraBody, bag: string[]): Lens {
  const from = (slugs: string[]) => slugs.map((s) => LENSES.find((l) => l.slug === s)).find((l) => l && fit(cam, l));
  return from(bag) ?? from(cam.defaultLens) ?? lensesFor(cam)[0];
}

export function cameraRate(cam: CameraBody) {
  return Math.round(cam.priceUsd * 0.012);
}

export function focalAt(lens: Lens, zoom: number) {
  return lens.focalMin * Math.pow(lens.focalMax / lens.focalMin, zoom);
}

export function stopAt(lens: Lens, closed: number) {
  return lens.apertureMax * Math.pow(lens.apertureMin / lens.apertureMax, closed);
}

/** Frame shape after de-squeezing anamorphic glass. */
export function frameAspect(cam: CameraBody, lens: Lens) {
  return (cam.sensor.w * (lens.squeeze ?? 1)) / cam.sensor.h;
}

/** Vertical field of view in degrees that shows exactly the recorded frame, letterboxed into the screen. */
export function viewfinderFov(cam: CameraBody, lens: Lens, zoom: number, screenAspect: number) {
  const f = focalAt(lens, zoom);
  const hfov = 2 * Math.atan((cam.sensor.w * (lens.squeeze ?? 1)) / (2 * f));
  const vfov = 2 * Math.atan(cam.sensor.h / (2 * f));
  const frame = frameAspect(cam, lens);
  const v = frame > screenAspect ? 2 * Math.atan(Math.tan(hfov / 2) / screenAspect) : vfov;
  return THREE_DEG * v;
}

const THREE_DEG = 180 / Math.PI;
