/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'https', hostname: '*.sipeda.id' },
    ],
  },
  // Aktifkan strict mode untuk catch bug lebih awal
  reactStrictMode: true,
};

export default nextConfig;
