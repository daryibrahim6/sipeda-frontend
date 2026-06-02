import { Heart } from 'lucide-react';

type Props = {
  className?: string;
  label?: string;
};

export function ArticleImagePlaceholder({ className = '', label = 'PMI Indramayu' }: Props) {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#C62828] via-[#B71C1C] to-[#8E0000] text-white ${className}`}
      role="img"
      aria-label="Placeholder gambar artikel"
    >
      <Heart className="w-12 h-12 sm:w-16 sm:h-16 mb-3 opacity-90" fill="currentColor" strokeWidth={0} />
      <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase opacity-80">{label}</span>
    </div>
  );
}
