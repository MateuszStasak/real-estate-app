import million from "million/compiler";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  experimental: {
    appDir: true
  },
};

export default million.next(nextConfig);


