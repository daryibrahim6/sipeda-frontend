'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export function FixedHeader() {
  const pathname = usePathname();
  const isExcluded = pathname?.startsWith('/admin') || pathname?.startsWith('/petugas') || pathname === '/login';

  return <>{!isExcluded && <Navbar />}</>;
}
