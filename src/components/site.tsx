import type { ReactNode } from 'react';
import { PreferencesBar, AuthHeader } from './preferences';
import { HeaderCounts } from './marketplace-actions';
import { getCurrentUser } from '@/lib/auth';

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tampmarketplace.com';

export async function SiteHeader({ active = '' }: { active?: string }) {
  const user = await getCurrentUser();
  const initials = user?.name?.trim()?.split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  return <>
    <div className="utility">
      <PreferencesBar />
      <div className="utility-center">Compare offers • Know where you're shopping</div>
      <div className="utility-right">Africa · Compare · Click · Shop</div>
    </div>
    <header className="header">
      <a className="brand" href="/" aria-label="TAMP Marketplace home" data-no-translate><img src="/tamp-logo.webp" alt="TAMP Marketplace" /></a>
      <nav aria-label="Primary navigation">
        <a className={active === 'home' ? 'active' : ''} href="/">Home</a>
        <a className={active === 'products' ? 'active' : ''} href="/products">Products</a>
        <a className={active === 'categories' ? 'active' : ''} href="/categories">Categories</a>
        <a className={active === 'merchants' ? 'active' : ''} href="/merchants">Merchants</a>
        <a className={active === 'destinations' ? 'active' : ''} href="/destinations">Destinations</a>
        <a className={active === 'deals' ? 'active' : ''} href="/deals">Deals <b>Hot</b></a>
        <a className={active === 'blog' ? 'active' : ''} href="/blog">Blog</a>
      </nav>
      <div className="header-search">
        <form action="/products" method="get" className="search">
          <span className="search-icon">⌕</span>
          <input name="q" aria-label="Search TAMP Marketplace" placeholder="Search products, brands and more..." />
          <button type="submit">Search</button>
        </form>
      </div>
      <div className="header-actions">
        {user ? (
          <details className="account-menu">
            <summary className="header-account signed-in-account" aria-label="Open account menu">
              <span className="account-avatar" aria-hidden="true">{initials}</span>
              <span className="account-name">{user.name || user.email}</span>
              <span className="account-chevron" aria-hidden="true">⌄</span>
            </summary>
            <div className="account-menu-panel">
              <div className="account-menu-user"><strong>{user.name || user.email}</strong><span>{user.email}</span></div>
              <a href="/account">My account</a>
              <a href="/wishlist">Saved products</a>
              <a href="/settings">Settings</a>
              <form action="/api/auth/sign-out" method="post"><button type="submit">Sign out</button></form>
            </div>
          </details>
        ) : (
          <a href="/auth/sign-in" className="header-account">♙ <span>Sign In / Register</span></a>
        )}
        <HeaderCounts />
      </div>
      <details className="mobile-header-menu">
        <summary aria-label="Open menu">☰</summary>
        <div className="mobile-menu-panel">
          <form action="/products" method="get" className="search mobile-search"><input name="q" aria-label="Search" placeholder="Search products..." /><button type="submit">⌕</button></form>
          <a href="/">Home</a><a href="/products">Products</a><a href="/categories">Categories</a><a href="/merchants">Merchants</a><a href="/destinations">Destinations</a><a href="/deals">Deals</a><a href="/blog">Blog</a><a href="/wishlist">Wishlist</a><a href="/cart">Shopping list</a>{user ? <><a href="/account">My account</a><a href="/settings">Settings</a><form action="/api/auth/sign-out" method="post"><button type="submit" className="mobile-signout">Sign out</button></form></> : <a href="/auth/sign-in">Sign In / Register</a>}
        </div>
      </details>
    </header>
  </>;
}

export function PageShell({ children, active = '' }: { children: ReactNode; active?: string }) {
  return <>
    <SiteHeader active={active} />
    <main>{children}</main>
    <footer className="footer" id="footer"><div className="footer-main"><div className="footer-brand"><a href="/" aria-label="TAMP Marketplace home"><img src="/tamp-logo.webp" alt="TAMP Marketplace"/></a><p>Compare. Click. Shop. Discover products and better prices across popular online stores serving shoppers across Africa.</p></div><div><h4>Explore</h4><a href="/products">Products</a><a href="/categories">Categories</a><a href="/merchants">Merchants</a><a href="/destinations">Destinations</a><a href="/blog">Blog</a></div><div><h4>Support</h4><a href="/auth/sign-in">Sign In</a><a href="/auth/register">Register</a><a href="/wishlist">Wishlist</a><a href="/cart">Shopping List</a><a href="/support">Support</a><a href="/settings">Settings</a><a href="/policies/accessibility">Accessibility</a><a href="/policies/privacy">Privacy Policy</a></div><div><h4>Legal</h4><a href="/policies/terms">Terms</a><a href="/policies/cookies">Cookies</a><a href="/policies/affiliate-disclosure">Affiliate Disclosure</a><a href="/policies/privacy">Data Protection</a></div></div><div className="footer-bottom"><span>© 2026 TAMP Marketplace. All rights reserved.</span><span>Shopping preferences saved on this device</span></div></footer>
  </>;
}

export function AuthShell({ children }: { children: ReactNode }) {
  return <>
    <AuthHeader />
    <main>{children}</main>
    <footer className="auth-footer"><div><img src="/tamp-logo.webp" alt="TAMP Marketplace" /><span>Compare. Click. Shop.</span></div><span>© 2026 TAMP Marketplace</span></footer>
  </>;
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export const africaKeywords = [
  'TAMP Marketplace', 'Africa shopping', 'online shopping Africa', 'compare prices Africa', 'shopping deals Africa',
  'Nigeria shopping', 'Ghana shopping', 'Kenya shopping',  'Egypt shopping',
  'Uganda shopping',  'Morocco shopping', 'Senegal shopping', 'Côte d’Ivoire shopping',
  'French Africa shopping', 'Swahili shopping', 'Portuguese Africa shopping', 'African ecommerce', 'affiliate shopping Africa'
];

export function pageJsonLd(type: string, name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org', '@type': type, name, description, url: `${siteUrl}${path}`,
    inLanguage: ['en', 'fr', 'ar', 'sw', 'pt', 'zu'], areaServed: { '@type': 'Continent', name: 'Africa' }, publisher: { '@type': 'Organization', name: 'TAMP Marketplace', url: siteUrl }
  };
}
