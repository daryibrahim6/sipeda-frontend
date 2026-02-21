import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sipeda.vercel.app';
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
