import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function MobileCtaBar() {
  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden pointer-events-none">
      <Link
        href="/jadwal"
        className="pointer-events-auto flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-accent)] text-white text-sm font-bold rounded-2xl shadow-lg shadow-red-900/30 active:scale-[0.97] transition-all"
      >
        <Heart className="w-4 h-4" /> Daftar Donor Sekarang
      </Link>
    </div>
  );
}
