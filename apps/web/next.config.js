/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@luvara/ui"],
  images: {
    domains: ["luvara-storage.s3.amazonaws.com", "images.unsplash.com"],
  },
};

module.exports = nextConfig;
