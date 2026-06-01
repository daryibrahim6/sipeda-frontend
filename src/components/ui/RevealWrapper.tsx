'use client';

import type { ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

type Props = {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
};

export function RevealWrapper({ children, className = '', stagger = false }: Props) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`${stagger ? 'reveal-children' : 'reveal'} ${className}`}
    >
      {children}
    </div>
  );
}
