/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
      BACKEND_URL: process.env.BACKEND_URL,
      FRONTEND_URL:process.env.FRONTEND_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      STRIPE_PROMISE_KEY: process.env.STRIPE_PROMISE_KEY,
      GOOGLE_CLIENT: process.env.GOOGLE_CLIENT,
      GOOGLE_SECRET: process.env.GOOGLE_SECRET,
      GITHUB_CLIENT: process.env.GITHUB_CLIENT,
      GITHUB_SECRET: process.env.GITHUB_SECRET,
      IMAGE_URL: process.env.IMAGE_URL,
  },
};

export default nextConfig;
