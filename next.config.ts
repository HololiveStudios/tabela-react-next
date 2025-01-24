/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  basePath: '', // Defina o subdiretório, se necessário
  assetPrefix: '', // Prefixo de assets, se necessário
};

module.exports = nextConfig;
