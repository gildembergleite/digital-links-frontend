import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "digitalcollege.com.br",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
    ]
  }
};

export default nextConfig;
