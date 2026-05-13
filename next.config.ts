import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts']
  }
};

export default withPWA({
  dest: 'public',
  disable: isDev,
  register: true,
  skipWaiting: true
})(nextConfig);
