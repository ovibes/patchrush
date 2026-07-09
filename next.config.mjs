/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "pino-pretty": false
    };
    return config;
  }
};

export default nextConfig;
