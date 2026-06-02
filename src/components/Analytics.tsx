'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!GA_ID || typeof window === 'undefined') return;
        const w = window as { gtag?: (...args: unknown[]) => void };
        if (!w.gtag) return;

        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        w.gtag('config', GA_ID, {
            page_path: url,
            page_title: document.title,
        });
    }, [pathname, searchParams]);

    if (!GA_ID) return null;

    return (
        <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}', {
                        page_path: window.location.pathname,
                    });
                `}
            </Script>
        </>
    );
}
