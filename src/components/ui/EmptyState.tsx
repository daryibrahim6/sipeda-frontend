import type { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className = '' }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-[var(--color-section-alt)] flex items-center justify-center text-[var(--color-text-muted)] mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  );
}
