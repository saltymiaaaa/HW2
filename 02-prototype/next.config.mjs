/** @type {import('next').NextConfig} */
const isPages = process.env.PAGES_EXPORT === "1";

const nextConfig = {
  reactStrictMode: true,
  // Inlined into the bundle so lib/client-data.ts can pick the static path
  // reliably; shell env vars alone are not always inlined for client code.
  env: { NEXT_PUBLIC_STATIC: isPages ? "1" : "0" },
  // Set by scripts/deploy-pages.sh for the GitHub Pages build.
  ...(isPages
    ? { output: "export", basePath: process.env.PAGES_BASE_PATH || "", trailingSlash: true, images: { unoptimized: true } }
    : {}),
};

export default nextConfig;
