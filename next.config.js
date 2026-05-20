/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.sharepoint.com",
        pathname: "/**",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

module.exports = nextConfig;
