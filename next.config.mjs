/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a second dev server or a build run without clobbering the main `.next`.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
