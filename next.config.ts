const nextConfig = {
  output: "standalone",
  async rewrites() {
    const backend = process.env.BACKEND_URL;
    if (!backend || !/^https?:\/\//.test(backend)) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backend.replace(/\/$/, "")}/api/v1/:path*`,
      },
    ];
  },
};
module.exports = nextConfig;
