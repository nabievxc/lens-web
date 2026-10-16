"use client";

import { useSyncExternalStore } from "react";

const KEY = "lens-rental";
const EMPTY: string[] = [];
let current: string[] | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  if (current) return current;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    current = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    current = [];
  }
  return current;
}

function write(next: string[]) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

export function useRental(): string[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}

export function addToRental(slug: string) {
  const list = read();
  if (!list.includes(slug)) write([...list, slug]);
}

export function removeFromRental(slug: string) {
  write(read().filter((s) => s !== slug));
}

export function clearRental() {
  write([]);
}
