import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Expenses',
  description: 'Premium iOS style expense tracker',
  applicationName: 'Expenses',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Expenses'
  },
  formatDetection: {
    telephone: false
  },
  manifest: '/manifest.json',
  icons: {
    apple: [{ url: '/icons/icon-192.png' }],
    icon: [{ url: '/icons/icon-192.png' }]
  }
};

export const viewport: Viewport = {
  themeColor: '#f3f3f4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '14px',
              background: '#111',
              color: '#fff'
            }
          }}
        />
      </body>
    </html>
  );
}
