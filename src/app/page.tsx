import { SiteHeader } from '@/components/site';
import { LocalizedHomeBlog } from '@/components/home-blog-localized';
import { getActiveBrands, getActiveCategories, getCatalogProducts, getFeaturedMerchants } from '@/server/catalog';

export const dynamic = 'force-dynamic';
const categories = [
  ['💻', 'Electronics'], ['📱', 'Phones'], ['💻', 'Laptops'], ['👕', 'Fashion'], ['👟', 'Shoes'], ['💄', 'Beauty'],
  ['🛋️', 'Home & Living'], ['⚽', 'Sports'], ['🧸', 'Toys'], ['🚙', 'Automotive'], ['📚', 'Books'], ['⊞', 'More']
];
const fallbackMerchants = [
  { slug: 'amazon', name: 'Amazon', status: 'Global Products' }, { slug: 'jumia', name: 'JUMIA', status: "Africa's Marketplace" },
  { slug: 'aliexpress', name: 'AliExpress', status: 'Global Deals' }, { slug: 'ebay', name: 'eBay', status: 'Unique Finds' }, { slug: 'temu', name: 'TEMU', status: 'Big Savings' }
];
const deals = [
  ['-42%', '🎧', 'Apple AirPods Pro (2nd Gen)', '$179', '$309', 'amazon'], ['-35%', '📱', 'Samsung Galaxy S24', '$649', '$999', 'amazon'],
  ['-28%', '💻', 'Lenovo IdeaPad 3 Laptop', '$429', '$599', 'jumia'], ['-33%', '⌚', 'Samsung Galaxy Watch 6', '$199', '$299', 'amazon'],
  ['-38%', '👟', 'Nike Air Force 1', '$89', '$145', 'ebay']
];
const articles = [
  ['Best Laptops Under $600 in 2025', '💻', 'Buying Guide'], ['Top 10 Smartphones in Nigeria 2025', '📱', 'Buying Guide'],
  ['Amazon vs Jumia: Which is Better?', '🛍️', 'Comparison'], ['Smart Home Gadgets for 2025', '🏠', 'Tech']
];
const brands = ['Apple', 'SAMSUNG', 'NIKE', 'adidas', 'DELL', 'hp', 'Canon', 'SONY'];
function SearchBox({ hero = false }: { hero?: boolean }) { return <form action="/products" method="get" className={hero ? 'search hero-search' : 'search'}><span className="search-icon">⌕</span><input name="q" aria-label="Search" placeholder="Search for products, brands and more..."/><button type="submit">Search</button></form>; }
function MerchantLogo({ type }: { type: string }) { return <span className={`merchant-logo ${type}`}>{type === 'amazon' ? 'a' : type === 'ali' ? 'AE' : type === 'ebay' ? 'e' : type === 'jumia' ? '✦' : 'TEMU'}</span>; }
function DealCard({ deal }: { deal: string[] }) { const [discount, icon, name, price, old, merchant] = deal; const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); return <article className="deal-card"><span className="discount">{discount}</span><a className="deal-arrow" href={`/products/${slug}`} aria-label={`View ${name}`}>›</a><div className="deal-image">{icon}</div><h3>{name}</h3><div className="stars">★★★★★ <em>(4.8)</em></div><div className="prices"><strong>{price}</strong><del>{old}</del></div><a className="deal-button" href={`/products/${slug}`}>View Deal →</a><div className="deal-merchant"><MerchantLogo type={merchant}/><b>{merchant === 'amazon' ? 'amazon' : merchant === 'jumia' ? 'JUMIA' : 'eBay'}</b></div></article>; }
export default async function Home() {
  const [dbCategories, dbMerchants, dbDeals, dbBrands] = await Promise.all([getActiveCategories(), getFeaturedMerchants('NG'), getCatalogProducts({country:'NG',deals:true,limit:5}), getActiveBrands()]);
  return <>
  <SiteHeader active="home" />
  <section className="hero"><div className="hero-inner"><div className="hero-copy"><div className="eyebrow">COMPARE OFFERS. SHOP WITH CONFIDENCE.</div><h1>Find the right deal.<br/>Compare real offers.<br/><strong>Shop with confidence.</strong></h1><p>Discover products, compare merchant offers and see which options fit your destination.<br className="desktop"/> TAMP Marketplace helps you choose where to shop; checkout stays with the merchant.</p><SearchBox hero/><div className="trust-row"><span>◉　Top Global Stores</span><span>％　Compare Prices</span><span>◆　Merchant Links</span><span>✓　Destination-aware</span></div></div><div className="hero-visual"><img src="/hero-shopper.webp" alt="Shopper holding shopping bags"/></div><aside className="marketplaces"><div className="market-title"><div><h2>Top Marketplaces</h2><p>Compare offers from participating merchants.</p></div><span className="round-arrow">›</span></div>{(dbMerchants.length ? dbMerchants : fallbackMerchants).map(m=><a className="market-row" href={`/merchants/${m.slug}`} key={m.slug}><MerchantLogo type={m.slug==='aliexpress'?'ali':m.slug}/><div><b>{m.name}</b><small>{m.status}</small></div></a>)}<div className="dots"><i className="selected"/><i/><i/></div></aside></div></section>
  <section className="trust-panel" aria-label="Why TAMP is useful for shoppers">
    <div className="trust-panel-inner">
      <div className="trust-intro"><span className="trust-kicker">BUILT FOR SMARTER SHOPPING</span><h2>Know what you are comparing.</h2><p>TAMP Marketplace helps you discover and compare offers by merchant and destination. Your purchase is completed directly with the merchant.</p></div>
      <div className="trust-steps">
        <div className="trust-step"><span>01</span><div><b>Discover</b><small>Discover products across participating stores.</small></div></div>
        <div className="trust-line" aria-hidden="true">→</div>
        <div className="trust-step"><span>02</span><div><b>Compare</b><small>Compare merchant, price and destination fit.</small></div></div>
        <div className="trust-line" aria-hidden="true">→</div>
        <div className="trust-step"><span>03</span><div><b>Visit merchant</b><small>Visit the merchant and complete your purchase there.</small></div></div>
      </div>
    </div>
    <div className="trust-proof"><span>✓ Merchant identified</span><span>✓ Destination-aware</span><span>✓ Merchant transparency</span><span>✓ Secure merchant checkout</span></div>
  </section>
  <section className="section categories" id="categories"><div className="section-heading"><h2>Popular Categories</h2><a href="/categories">View all →</a></div><div className="category-row">{dbCategories.map(({icon,name,slug})=><a className="category" href={`/categories/${slug}`} key={slug}><span>{icon}</span><b>{name}</b></a>)}</div></section>
  <section className="section deals" id="deals"><div className="section-heading"><h2>Featured Deals <small>🔥 Hot Deals This Week</small></h2><a href="/products?deals=1">View all deals →</a></div><div className="deals-grid">{dbDeals.map(d=><article className="deal-card" key={d.slug}><div className="deal-image">{d.icon}</div><h3>{d.name}</h3><div className="prices"><strong>{d.price.toLocaleString()} {d.offers?.[0]?.currency || 'USD'}</strong>{d.oldPrice&&<del>{d.oldPrice.toLocaleString()} {d.offers?.[0]?.currency || 'USD'}</del>}</div><a className="deal-button" href={`/products/${d.slug}`}>View Deal →</a><div className="deal-merchant"><b>{d.merchant}</b></div></article>)}<aside className="compare-card"><div><h2>Compare Prices<br/>Across Top Stores</h2><p>Find the best deals from Amazon, Jumia, AliExpress, eBay, Temu and more.</p><a className="compare-button" href="/products?deals=1">Compare Offers →</a></div><div className="compare-badges"><span>amazon</span><span>JUMIA</span><span>AliExpress</span><span>eBay</span><span>TEMU</span></div></aside></div></section>
  <section className="brands" id="brands"><div className="section-heading"><h2>Top Brands</h2><a href="/brands">View all brands →</a></div><div className="brand-row">{dbBrands.map(b=><a href={`/products?brand=${encodeURIComponent(b)}`} key={b}>{b}</a>)}</div></section>
  <section className="section articles" id="articles"><div className="section-heading"><h2>Latest from Our Blog</h2><a href="/blog">View all articles →</a></div><LocalizedHomeBlog/></section>
  <section className="newsletter"><div><div className="newsletter-icon">✉</div><div><h2>Stay Updated with the Best Deals</h2><p>Get the latest deals, product updates and shopping tips delivered to your inbox.</p></div></div><form action="https://api.web3forms.com/submit" method="POST"><input type="hidden" name="access_key" value="bdca05f7-4ca1-4b01-a44c-17f7cdc2b3e5"/><input type="hidden" name="subject" value="TAMP Marketplace Newsletter Subscription"/><input type="hidden" name="from_name" value="TAMP Marketplace"/><input name="email" placeholder="Enter your email address" type="email" required/><button type="submit">Subscribe</button></form></section>
  <footer className="footer" id="footer"><div className="footer-main"><div className="footer-brand"><img src="/tamp-logo.webp" alt="TAMP Marketplace"/><p>TAMP Marketplace is a shopping discovery and comparison service from the TAMP ecosystem. Discover offers, compare prices and visit participating merchants for checkout.</p></div><div><h4>Quick Links</h4><a href="/">Home</a><a href="/products">Products</a><a href="/categories">Categories</a><a href="/products?deals=1">Deals</a><a href="/blog">Blog</a></div><div><h4>Support</h4><a href="/auth/sign-in">Contact</a><a href="/auth/sign-in">Help Center</a><a href="/auth/sign-in">FAQs</a><a href="/policies/privacy">Privacy Policy</a><a href="/policies/terms">Terms & Conditions</a></div><div><h4>Legal</h4><a href="/policies/cookies">Cookie Policy</a><a href="/policies/privacy">Data Protection</a><a href="/policies/affiliate-disclosure">Affiliate Disclosure</a><a href="/policies/accessibility">Accessibility</a></div></div><div className="footer-bottom"><span>© 2026 TAMP Marketplace. A TAMP ecosystem service. All rights reserved.</span></div></footer>
  <nav className="mobile-nav"><a className="active" href="#">⌂<small>Home</small></a><a href="#categories">▦<small>Categories</small></a><a href="#deals">🔥<small>Deals</small></a><a href="#">♡<small>Wishlist</small></a><a href="#footer">♙<small>Account</small></a></nav>
</>; }
