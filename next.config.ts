import path from 'path';
import type { NextConfig } from "next";

const nextConfig = {
    images: {
        qualities: [75, 100]
    },
    output: "standalone",
    turbopack: {
        root: path.resolve(__dirname)
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '20mb', // Aumente para 10mb ou quanto precisar
        },
    },
} as unknown as NextConfig;

export default nextConfig;
