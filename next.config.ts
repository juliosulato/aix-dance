import path from 'path';
import type { NextConfig } from "next";

// Next.js v16 no longer accepts an `eslint` key in `next.config`.
// We remove it and add `turbopack.root` to silence the workspace root warning.
const nextConfig = {
    images: {
        qualities: [75, 100]
    },
    output: "standalone",
    async rewrites() {
        return [
            {
                source: "/api/v1/:path*",
                destination: "https://dev-aixdance-api.mazzaux.com.br/api/v1/:path*",
            },
        ];
    },
    turbopack: {
        // Resolve to the project directory to avoid Next.js inferring the wrong workspace root.
        root: path.resolve(__dirname)
    }
} as unknown as NextConfig;

export default nextConfig;
