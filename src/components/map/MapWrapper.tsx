'use client';

import dynamic from 'next/dynamic';
import type { Location } from '@/lib/types';

const LeafletMap = dynamic(
  () => import('./LeafletMap').then(m => m.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <div className="text-sm text-gray-400">Memuat peta...</div>
        </div>
      </div>
    ),
  }
);

export default function MapWrapper(props: {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
}) {
  return <LeafletMap {...props} />;
}