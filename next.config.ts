import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["192.168.50.85"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default withNextIntl(nextConfig);
