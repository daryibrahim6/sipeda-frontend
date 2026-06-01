'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        let cancelled = false;
        const id = setTimeout(() => {
            if (cancelled) return;
            setProgress(0);
            setVisible(true);

            let current = 0;
            intervalRef.current = setInterval(() => {
                current += current < 70 ? 12 : current < 90 ? 2 : 0.5;
                if (current >= 94) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    current = 94;
                }
                setProgress(current);
            }, 80);

            timerRef.current = setTimeout(() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setProgress(100);
                setTimeout(() => setVisible(false), 350);
            }, 500);
        }, 0);

        return () => {
            clearTimeout(id);
            if (timerRef.current) clearTimeout(timerRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
            cancelled = true;
        };
    }, [pathname, searchParams]);

    if (!visible && progress === 0) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
        >
            <div
                className="h-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-accent)] to-[var(--color-primary-muted)]"
                style={{
                    width: `${progress}%`,
                    transition: progress === 100
                        ? 'width 0.2s ease-out'
                        : 'width 0.08s linear',
                    boxShadow: '0 0 8px rgba(198, 40, 40, 0.5)',
                }}
            />
        </div>
    );
}
