import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    qualities: [60, 70, 75, 80, 90, 100],
  },
};

export default withNextIntl(nextConfig);
