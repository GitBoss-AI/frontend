/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/dev", // So all routes (e.g. /signin) are served from /dev/signin
  output: "standalone", // For compatibility with custom servers and Docker
};

module.exports = nextConfig;

