'use client';

import type { ReactNode } from 'react';

type BadgeProp = { icon?: ReactNode; text: string } | string;

type Props = {
  badge?: BadgeProp;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

function isObjectBadge(badge: BadgeProp): badge is { icon?: ReactNode; text: string } {
  return typeof badge === 'object' && badge !== null;
}

export function PageHeader({ badge, title, description, actions, className = '' }: Props) {
  return (
    <div className={`bg-[var(--color-section-alt)] ${className}`}>
      <div className="page-container py-12 sm:py-16">
        <div className="max-w-3xl">
          {badge && (
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-3 animate-fade-in-up">
              {isObjectBadge(badge) ? (
                <>{badge.icon && <span className="inline-flex">{badge.icon}</span>}{badge.text}</>
              ) : (
                badge
              )}
            </div>
          )}
          <h1 className="text-h1 lg:text-display text-[var(--color-text-primary)] leading-tight animate-fade-in-up stagger-1">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-body text-[var(--color-text-secondary)] leading-relaxed max-w-2xl animate-fade-in-up stagger-2">
              {description}
            </p>
          )}
          {actions && (
            <div className="mt-6 flex flex-wrap gap-3 animate-fade-in-up stagger-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
