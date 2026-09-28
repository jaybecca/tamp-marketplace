import type { Metadata } from 'next';
import './globals.css';
import { LocalizationLayer } from '@/components/localization';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tampmarketplace.com';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TAMP — Compare. Click. Shop.',
    template: '%s | TAMP Marketplace'
  },
  description:
    'TAMP Marketplace helps shoppers across Africa discover products, compare prices and find deals from leading global and local marketplaces.',
  applicationName: 'TAMP',
  keywords: [
    'TAMP Marketplace',
    'Africa marketplace',
    'online shopping Africa',
    'compare prices Africa',
    'shopping deals Africa',
    'Nigeria shopping',
    'Ghana shopping',
    'Kenya shopping',
    'South Africa shopping',
    'Egypt shopping',
    'Tanzania shopping',
    'Uganda shopping',
    'Rwanda shopping',
    'Ethiopia shopping',
    'Zambia shopping',
    'Zimbabwe shopping',
    'Morocco shopping',
    'Senegal shopping',
    'Cote d’Ivoire shopping'
  ],
  authors: [{ name: 'TAMP' }],
  creator: 'TAMP',
  publisher: 'TAMP — The Active Mode Planners',
  category: 'shopping',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'TAMP Marketplace',
    title: 'TAMP Marketplace — Compare. Click. Shop.',
    description:
      'Discover products, compare prices and find better deals across global and local marketplaces serving shoppers in Africa.',
    locale: 'en_AU',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TAMP Marketplace — Compare. Click. Shop.' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TAMP Marketplace — Compare. Click. Shop.',
    description: 'Discover products and compare prices across marketplaces serving Africa.',
    images: ['/og-image.png']
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 }
  }
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TAMP Marketplace',
  alternateName: 'TAMP',
  url: siteUrl,
  description: 'Compare products, prices and deals across marketplaces serving shoppers in Africa.',
  image: `${siteUrl}/og-image.png`,
  inLanguage: ['en', 'fr', 'ar', 'sw', 'pt', 'zu'],
  areaServed: {
    '@type': 'Continent',
    name: 'Africa'
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <meta name="theme-color" content="#031f4a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TAMP Marketplace" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body><a className="skip-link" href="#main-content">Skip to main content</a><LocalizationLayer /><div id="main-content">{children}</div></body>
    </html>
  );
}
