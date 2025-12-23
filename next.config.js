/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: "/Movie-Picker",
  assetPrefix: "/Movie-Picker/",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**"
      }
    ]
  }
};

export default nextConfig;
