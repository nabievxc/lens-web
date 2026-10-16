import type { Format, MountId } from "@/types/lens";

export interface MountSpec {
  id: MountId;
  name: string;
  maker: string;
  flangeMm: number;
  throatMm: number;
  tabs: number;
  contacts: number;
  /** Colour of the alignment dot on the lens barrel. */
  indexColor: string;
  formats: Format[];
  year: number;
  description: string;
}

export const MOUNTS: Record<MountId, MountSpec> = {
  E: {
    id: "E",
    name: "Sony E-mount",
    maker: "Sony",
    flangeMm: 18,
    throatMm: 46.1,
    tabs: 4,
    contacts: 10,
    indexColor: "#f5f5f5",
    formats: ["FF", "APS-C"],
    year: 2010,
    description:
      "Sony's mirrorless mount, with an 18 mm flange. Sigma, Tamron, Samyang, Viltrox and most other third-party makers build lenses for it.",
  },
  Z: {
    id: "Z",
    name: "Nikon Z-mount",
    maker: "Nikon",
    flangeMm: 16,
    throatMm: 55,
    tabs: 4,
    contacts: 11,
    indexColor: "#f5f5f5",
    formats: ["FF", "APS-C"],
    year: 2018,
    description:
      "Nikon's mirrorless mount. Its 55 mm throat is the widest of any full-frame mount, and the flange distance is 16 mm.",
  },
  RF: {
    id: "RF",
    name: "Canon RF-mount",
    maker: "Canon",
    flangeMm: 20,
    throatMm: 54,
    tabs: 3,
    contacts: 12,
    indexColor: "#e11d2a",
    formats: ["FF", "APS-C"],
    year: 2018,
    description:
      "Canon's full-frame mirrorless mount. It keeps the 54 mm EF diameter, moves the flange to 20 mm and uses 12 contacts.",
  },
  L: {
    id: "L",
    name: "L-Mount",
    maker: "Leica / Panasonic / Sigma",
    flangeMm: 20,
    throatMm: 51.6,
    tabs: 4,
    contacts: 10,
    indexColor: "#e11d2a",
    formats: ["FF", "APS-C"],
    year: 2014,
    description:
      "Open mount shared by the L-Mount Alliance: Leica, Panasonic, Sigma, DJI and Samyang.",
  },
  X: {
    id: "X",
    name: "Fujifilm X-mount",
    maker: "Fujifilm",
    flangeMm: 17.7,
    throatMm: 43.5,
    tabs: 3,
    contacts: 10,
    indexColor: "#f5f5f5",
    formats: ["APS-C"],
    year: 2012,
    description:
      "Fujifilm's APS-C mirrorless mount. Many XF lenses have a physical aperture ring, and there are dozens of small primes for it.",
  },
  M43: {
    id: "M43",
    name: "Micro Four Thirds",
    maker: "Panasonic / OM System",
    flangeMm: 19.25,
    throatMm: 38,
    tabs: 3,
    contacts: 11,
    indexColor: "#f5f5f5",
    formats: ["M43"],
    year: 2008,
    description:
      "An open standard for 2x crop sensors, used by Panasonic Lumix G, OM System and Blackmagic cameras.",
  },
  EF: {
    id: "EF",
    name: "Canon EF-mount",
    maker: "Canon",
    flangeMm: 44,
    throatMm: 54,
    tabs: 3,
    contacts: 8,
    indexColor: "#e11d2a",
    formats: ["FF", "APS-C", "S35"],
    year: 1987,
    description:
      "The classic Canon DSLR mount. Still common on cinema cameras and adaptable to almost every mirrorless body.",
  },
  F: {
    id: "F",
    name: "Nikon F-mount",
    maker: "Nikon",
    flangeMm: 46.5,
    throatMm: 44,
    tabs: 3,
    contacts: 5,
    indexColor: "#f5f5f5",
    formats: ["FF", "APS-C"],
    year: 1959,
    description:
      "Nikon's SLR bayonet, in production since 1959.",
  },
  PL: {
    id: "PL",
    name: "ARRI PL-mount",
    maker: "ARRI",
    flangeMm: 52,
    throatMm: 54,
    tabs: 4,
    contacts: 0,
    indexColor: "#f5f5f5",
    formats: ["S35", "FF"],
    year: 1982,
    description:
      "The usual mount on cinema cameras. A four-lug breech lock holds heavy cine lenses without them rotating.",
  },
  GFX: {
    id: "GFX",
    name: "Fujifilm G-mount",
    maker: "Fujifilm",
    flangeMm: 26.7,
    throatMm: 65,
    tabs: 3,
    contacts: 12,
    indexColor: "#f5f5f5",
    formats: ["MF"],
    year: 2016,
    description:
      "Fujifilm's medium format mirrorless mount for the GFX system, built around a 44x33 mm sensor.",
  },
};

export const MOUNT_LIST = Object.values(MOUNTS);
