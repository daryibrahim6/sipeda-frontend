'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        setAnimating(true);
        const timeout = setTimeout(() => setAnimating(false), 500);
        return () => clearTimeout(timeout);
    }, [pathname, searchParams]);

    if (!animating) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none">
            <div
                className="h-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-accent)] to-[var(--color-primary-muted)] animate-progress"
                style={{ boxShadow: '0 0 8px rgba(198, 40, 40, 0.5)' }}
            />
        </div>
    );
}
