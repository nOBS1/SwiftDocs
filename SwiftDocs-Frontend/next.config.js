module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // 可以在这里添加额外的 webpack 别名配置
    };
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['child_process', 'fs', 'path', 'os', 'util'],
  },
}
