/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/dev", // So all routes (e.g. /login) are served from /dev/login
  output: "standalone", // For compatibility with custom servers and Docker
  
  images: {
    domains: ['avatars.githubusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

