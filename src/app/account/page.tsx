import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { PageShell, JsonLd, pageJsonLd } from '@/components/site';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your TAMP Marketplace account and saved shopping activity.',
  alternates: { canonical: '/account' },
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/sign-in');
  const initials = user.name?.trim()?.split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase() || user.email[0].toUpperCase();
  return <PageShell active="account">
    <article className="market-page account-page">
      <div className="crumbs">Home / My Account</div>
      <div className="account-hero-card">
        <div className="account-avatar account-avatar-large">{initials}</div>
        <div><div className="eyebrow">MY ACCOUNT</div><h1>Welcome, {user.name || 'Shopper'}</h1><p>{user.email}</p></div>
      </div>
      <div className="account-grid">
        <a className="account-tile" href="/wishlist"><strong>Saved products</strong><span>View products you saved for later.</span></a>
        <a className="account-tile" href="/settings"><strong>Account settings</strong><span>Manage preferences, privacy and account details.</span></a>
        <a className="account-tile" href="/cart"><strong>Shopping list</strong><span>Review products you are considering.</span></a>
        <a className="account-tile" href="/support"><strong>Help & support</strong><span>Get help with your TAMP experience.</span></a>
      </div>
      <form className="account-signout" action="/api/auth/sign-out" method="post"><button className="outline-btn" type="submit">Sign out</button></form>
    </article>
    <JsonLd data={pageJsonLd('WebPage','TAMP My Account','Manage your TAMP Marketplace account and saved shopping activity.','/account')} />
  </PageShell>;
}
