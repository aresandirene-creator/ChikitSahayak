import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tesseract starts a Node worker from its package directory. Keep these
  // packages external so Next.js does not rewrite that worker path at build
  // time.
  serverExternalPackages: ["tesseract.js", "tesseract.js-core", "espeak-ng"],
  // Hide the Next.js development tools / issue indicator from the kiosk UI.
  devIndicators: false,
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
