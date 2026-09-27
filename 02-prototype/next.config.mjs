/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Set by scripts/deploy-pages.sh for the GitHub Pages build.
  ...(process.env.PAGES_EXPORT === "1"
    ? { output: "export", basePath: process.env.PAGES_BASE_PATH || "", trailingSlash: true, images: { unoptimized: true } }
    : {}),
};

export default nextConfig;
