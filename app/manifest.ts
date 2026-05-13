import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Expenses',
    short_name: 'Expenses',
    description: 'iOS style expense tracker',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/dashboard',
    scope: '/',
    background_color: '#f3f3f4',
    theme_color: '#f3f3f4',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  };
}
