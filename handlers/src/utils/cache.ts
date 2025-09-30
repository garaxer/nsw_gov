import { LocationInfo } from "../types/domain";

const cache = new Map<string, LocationInfo>();
const MAX_SIZE = 50;

const key = (address: string) => address.toUpperCase().trim();

export const addressCache = {
  get(address: string): LocationInfo | undefined {
    const k = key(address);
    const v = cache.get(k);
    if (v) {
      cache.delete(k);
      cache.set(k, v);
    }
    return v;
  },

  set(address: string, value: LocationInfo): void {
    const k = key(address);
    if (cache.has(k)) cache.delete(k);
    else if (cache.size >= MAX_SIZE) {
      const next = cache.keys().next().value;
      if (next) cache.delete(next);
    }
    cache.set(k, value);
  },
};
