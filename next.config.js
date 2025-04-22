/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable static export for WebView integration
  output: 'export',
  // Base path if deploying to a subfolder
  // basePath: '',
  // Transpile MUI and other packages
  transpilePackages: ['@mui/material', '@mui/system', '@mui/icons-material']
};

module.exports = nextConfig; 