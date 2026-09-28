import type { Metadata } from 'next';
import { PageShell, JsonLd, pageJsonLd } from '@/components/site';

export const metadata: Metadata = { title: 'Brands', description: 'Explore popular brands and compare available products across participating marketplaces.', robots: { index: false, follow: true } };

export default function Page() {
  return <PageShell><div className="market-page"><div className="crumbs">Home / Brands</div><div className="eyebrow">TAMP MARKETPLACE</div><h1>Brands</h1><p className="lead">Explore popular brands and compare available products across participating marketplaces.</p><div className="seo-grid"><article className="seo-card"><h2>Frontend ready</h2><p>This page is connected to the homepage navigation and provides the destination for future live account, saved-item and checkout functionality.</p></article><article className="seo-card"><h2>Compare with confidence</h2><p>Merchant checkout, availability, shipping and final pricing are confirmed on the merchant destination.</p></article></div></div><JsonLd data={pageJsonLd('WebPage','Brands','Explore popular brands and compare available products across participating marketplaces.','/brands')} /></PageShell>;
}
