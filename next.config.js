// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // with strict mode on, components are mounted twice (in development)
  // this complicates socket connections
  reactStrictMode: false,
};

export default nextConfig;
