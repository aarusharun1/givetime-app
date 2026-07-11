import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development" || isCapacitorBuild,
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Static export for Capacitor native builds only
  ...(isCapacitorBuild
    ? { output: "export", images: { unoptimized: true } }
    : {
        images: {
          remotePatterns: [
            {
              protocol: "https",
              hostname: "i.postimg.cc",
            },
          ],
        },
      }),
};

export default withPWA(nextConfig);
