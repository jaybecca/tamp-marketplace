import type { Metadata } from 'next';
import { JsonLd, PageShell, africaKeywords, pageJsonLd } from '@/components/site';
import { LocalizedBlogList } from '@/components/blog-localized';

export const metadata: Metadata = {
  title: 'Shopping Blog & Buying Guides',
  description: '50 practical, funny and useful guides for comparing products, prices, merchants and destinations across Africa and beyond.',
  keywords: [...africaKeywords, 'Africa buying guides', 'Nigeria shopping tips', 'Kenya shopping tips', 'online shopping Africa'],
  alternates: { canonical: '/blog' },
  openGraph: { title: 'Shopping Blog | TAMP Marketplace', description: '50 practical, funny and useful guides for comparing products, prices, merchants and destinations across Africa and beyond.', images: ['/og-image.png'] }
};

export default function Blog() {
  return <PageShell active="blog">
    <div className="market-page">
      <div className="crumbs">Home / Blog</div>
      <div className="eyebrow">TAMP MARKETPLACE JOURNAL</div>
      <h1>Smarter shopping starts with better information.</h1>
      <p className="lead">50 practical, funny and useful guides for comparing products, prices, merchants and destinations across Africa and beyond.</p>
      <LocalizedBlogList />
    </div>
    <JsonLd data={pageJsonLd('Blog','TAMP Marketplace Blog','50 shopping guides, comparisons and ecommerce insights for buyers across Africa.','/blog')}/>
  </PageShell>;
}
