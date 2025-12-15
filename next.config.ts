/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
    // If backend URL is missing, skip adding rewrites to avoid build errors
    if (!backend || !/^https?:\/\//.test(backend)) {
      return [];
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backend.replace(/\/$/, "")}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
