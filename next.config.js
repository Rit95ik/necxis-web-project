/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable static export for WebView integration
  output: 'export',
  // Disable image optimization for Netlify compatibility
  images: {
    unoptimized: true,
  },
  // Disable trailing slash for Netlify
  trailingSlash: false,
  // No need for basePath when deploying to domain root
  // basePath: '',
  // Transpile MUI and other packages
  transpilePackages: ['@mui/material', '@mui/system', '@mui/icons-material']
};

module.exports = nextConfig; 