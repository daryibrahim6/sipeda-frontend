'use client';

import { useEffect, useRef } from 'react';
import type { Location } from '@/lib/types';

type Props = {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  onSelect?: (loc: Location) => void;
};

export function LeafletMap({ locations, center, zoom = 12, onSelect }: Props) {
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Flag ini menandai apakah effect ini sudah di-cleanup
    // sebelum Promise.all selesai (React 18 Strict Mode double-invoke)
    let cancelled = false;

    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css' as string),
    ]).then(([L]) => {
      // Jika cleanup sudah dipanggil sebelum Promise resolve → abort
      if (cancelled || !mapRef.current) return;

      // Jika map sudah ada (edge case), destroy dulu
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((mapRef.current as any)._leaflet_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any)?.remove();
        mapInstanceRef.current = null;
      }

      // Fix default icon Leaflet di Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl:       '/leaflet/marker-icon.png',
        shadowUrl:     '/leaflet/marker-shadow.png',
      });

      const defaultCenter: [number, number] = center ??
        (locations.length > 0
          ? [locations[0].koordinat_lat, locations[0].koordinat_lng]
          : [-6.3275, 108.3242]); // Indramayu center

      const map = L.map(mapRef.current!).setView(defaultCenter, zoom);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom icon merah
      const redIcon = L.divIcon({
        html: `<div style="
          width:32px;height:32px;
          background:#C60000;
          border:3px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      locations.forEach(loc => {
        const marker = L.marker(
          [loc.koordinat_lat, loc.koordinat_lng],
          { icon: redIcon }
        ).addTo(map);

        // Stok ringkas di popup
        const stokHtml = loc.stok_ringkas?.length
          ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;">
              ${loc.stok_ringkas.map(s => `
                <span style="font-size:11px;padding:2px 6px;border-radius:9999px;background:${
                  s.status === 'normal' ? '#dcfce7' :
                  s.status === 'kritis' ? '#fef9c3' : '#fee2e2'
                };color:${
                  s.status === 'normal' ? '#166534' :
                  s.status === 'kritis' ? '#854d0e' : '#991b1b'
                }">
                  ${s.golongan_darah}: ${s.total}
                </span>
              `).join('')}
            </div>`
          : '';

        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#111">
              ${loc.nama_lokasi}
            </div>
            <div style="font-size:12px;color:#666;margin-bottom:4px">${loc.alamat}</div>
            <div style="font-size:11px;color:#888">${loc.kecamatan}</div>
            ${loc.kontak ? `<div style="font-size:12px;margin-top:6px">📞 ${loc.kontak}</div>` : ''}
            ${stokHtml}
            <a href="/jadwal?lokasi=${loc.id}" style="
              display:block;margin-top:10px;text-align:center;
              background:#C60000;color:white;padding:6px 12px;
              border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;
            ">Lihat Jadwal</a>
          </div>
        `, { maxWidth: 260 });

        marker.on('click', () => onSelect?.(loc));
      });
    });

    return () => {
      // Set flag → Promise yang belum resolve tidak akan jalan
      cancelled = true;

      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl z-0"
      style={{ minHeight: '400px' }}
      aria-label="Peta lokasi donor darah"
      role="application"
    />
  );
}