import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Catatan: runtimeCaching TIDAK digunakan — match-all NetworkOnly default
// dari @serwist/next/worker memblokir tile OSM/Unsplash (cross-origin opaque
// response throw SerwistError, tile <img> tidak pernah dapat data → map abu-abu).
// Sekarang: SW hanya handle precache (Next.js build assets), semua fetch
// request lain langsung ke network tanpa intercept.

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
});

serwist.addEventListeners();
