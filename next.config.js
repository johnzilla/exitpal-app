/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  webpack: (config, { isServer }) => {
    // For static exports, we need to completely exclude Firebase
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase/app': false,
        'firebase/firestore': false,
        'firebase/auth': false,
      };
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        util: false,
        buffer: false,
        events: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;