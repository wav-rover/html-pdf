/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a second dev server or a build run without clobbering the main `.next`.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  experimental: {
    // PDF imports go through a Server Action; the default 1 MB limit is below our 5 MB cap.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
