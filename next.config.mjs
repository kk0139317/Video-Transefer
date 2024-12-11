// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
      appDir: true, // Enable app directory structure
    },
    env: {
      API_URL: process.env.API_URL,
    },
  };
  
  export default nextConfig;
  