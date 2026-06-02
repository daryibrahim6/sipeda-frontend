'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const navKey = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    return (
        <div
            key={navKey}
            className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
        >
            <div
                className="h-full w-full origin-left bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-accent)] to-[var(--color-primary-muted)] animate-progress"
                style={{ boxShadow: '0 0 8px rgba(198, 40, 40, 0.5)' }}
            />
        </div>
    );
}
