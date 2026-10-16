import type { BrandId } from "@/types/lens";

export interface BrandInfo {
  id: BrandId;
  name: string;
  country: string;
  founded: number;
  accent: string;
  description: string;
}

export const BRANDS: Record<BrandId, BrandInfo> = {
  sony: {
    id: "sony",
    name: "Sony",
    country: "Japan",
    founded: 1946,
    accent: "#f08a24",
    description: "G Master, G and Zeiss-branded lenses for E-mount.",
  },
  canon: {
    id: "canon",
    name: "Canon",
    country: "Japan",
    founded: 1937,
    accent: "#e11d2a",
    description: "RF and EF lenses, with the red-ringed L series as its professional line.",
  },
  nikon: {
    id: "nikon",
    name: "Nikon",
    country: "Japan",
    founded: 1917,
    accent: "#facc15",
    description: "NIKKOR Z and F lenses. S-Line is Nikon's top optical tier.",
  },
  fujifilm: {
    id: "fujifilm",
    name: "Fujifilm",
    country: "Japan",
    founded: 1934,
    accent: "#22c55e",
    description: "Fujinon XF/XC lenses for APS-C and GF lenses for the medium format GFX system.",
  },
  panasonic: {
    id: "panasonic",
    name: "Panasonic",
    country: "Japan",
    founded: 1918,
    accent: "#3b82f6",
    description: "Lumix S lenses for L-Mount and Lumix G / Leica DG lenses for Micro Four Thirds.",
  },
  "om-system": {
    id: "om-system",
    name: "OM System",
    country: "Japan",
    founded: 1919,
    accent: "#60a5fa",
    description: "M.Zuiko lenses (formerly Olympus) for Micro Four Thirds, including the PRO line.",
  },
  sigma: {
    id: "sigma",
    name: "Sigma",
    country: "Japan",
    founded: 1961,
    accent: "#d4d4d8",
    description: "Art, Contemporary and Sports lines plus Cine primes, for E, L, RF, X and more.",
  },
  tamron: {
    id: "tamron",
    name: "Tamron",
    country: "Japan",
    founded: 1950,
    accent: "#a3e635",
    description: "Compact, affordable zooms for Sony E, Nikon Z, Fujifilm X and Canon RF.",
  },
  samyang: {
    id: "samyang",
    name: "Samyang",
    country: "South Korea",
    founded: 1972,
    accent: "#ef4444",
    description: "Affordable AF primes and the VDSLR / XEEN cine lines (also sold as Rokinon).",
  },
  viltrox: {
    id: "viltrox",
    name: "Viltrox",
    country: "China",
    founded: 2009,
    accent: "#f59e0b",
    description: "Fast AF primes at aggressive prices, including the Pro and LAB lines.",
  },
  sirui: {
    id: "sirui",
    name: "Sirui",
    country: "China",
    founded: 2001,
    accent: "#38bdf8",
    description: "Affordable anamorphic lenses, plus the Aurora, Sniper and Nightwalker primes.",
  },
  "7artisans": {
    id: "7artisans",
    name: "7Artisans",
    country: "China",
    founded: 2015,
    accent: "#fb923c",
    description: "Budget manual primes, fisheyes, Hope cine primes and the Photoelectric line.",
  },
  ttartisan: {
    id: "ttartisan",
    name: "TTArtisan",
    country: "China",
    founded: 2019,
    accent: "#eab308",
    description: "Retro-styled manual and AF primes, including tilt lenses and fisheyes.",
  },
  laowa: {
    id: "laowa",
    name: "Laowa",
    country: "China",
    founded: 2013,
    accent: "#2dd4bf",
    description: "Made by Venus Optics. Zero-D ultra-wides, probe macros and Nanomorph anamorphics.",
  },
  voigtlander: {
    id: "voigtlander",
    name: "Voigtländer",
    country: "Germany / Japan",
    founded: 1756,
    accent: "#cbd5e1",
    description: "All-metal manual focus primes, made by Cosina in Japan.",
  },
  zeiss: {
    id: "zeiss",
    name: "Zeiss",
    country: "Germany",
    founded: 1846,
    accent: "#2563eb",
    description: "Batis, Loxia and the CP.3 / Supreme Prime cinema lenses.",
  },
  dzofilm: {
    id: "dzofilm",
    name: "DZOFilm",
    country: "China",
    founded: 2014,
    accent: "#a855f7",
    description: "Pictor and Catta cine zooms, Vespid primes and Pavo anamorphics.",
  },
  meike: {
    id: "meike",
    name: "Meike",
    country: "China",
    founded: 2005,
    accent: "#f43f5e",
    description: "Budget cine primes for S35 and full frame, plus AF photo lenses.",
  },
  atlas: {
    id: "atlas",
    name: "Atlas Lens Co.",
    country: "USA",
    founded: 2016,
    accent: "#f97316",
    description: "Orion and Mercury series 2x front anamorphic cinema lenses.",
  },
  blazar: {
    id: "blazar",
    name: "Blazar",
    country: "China",
    founded: 2020,
    accent: "#06b6d4",
    description: "Compact 1.5x anamorphic primes with blue streak flares.",
  },
};

export const BRAND_LIST = Object.values(BRANDS);
