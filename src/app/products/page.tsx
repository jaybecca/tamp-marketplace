import type { Metadata } from 'next';
import { JsonLd, PageShell, africaKeywords } from '@/components/site';
import { ProductCard, FilterPanel, DestinationBar } from '@/components/shopping';
import { getCatalogProducts } from '@/server/catalog';

export const metadata: Metadata={title:'Products & Price Comparison',description:'Browse products, compare prices and discover deals from popular marketplaces serving shoppers across Africa.',keywords:[...africaKeywords,'product comparison Africa','online products Nigeria'],alternates:{canonical:'/products'},openGraph:{title:'Products & Price Comparison | TAMP Marketplace',description:'Browse products and compare merchant offers across Africa.',images:['/og-image.png']}};

export default async function Products({searchParams}:{searchParams:Promise<{q?:string;category?:string;brand?:string;merchant?:string;deals?:string;country?:string;sort?:string}>}){
 const params=await searchParams;
 const country=(params.country||'NG').toUpperCase(); const q=params.q?.toLowerCase()||''; const category=params.category?.toLowerCase()||''; const brand=params.brand?.toLowerCase()||''; const merchant=params.merchant?.toLowerCase()||''; const deal=params.deals; const sort=params.sort||'featured';
 let filtered=await getCatalogProducts({country,q,category,brand,merchant,deals:!!deal,limit:50});
 if(sort==='price-asc') filtered=[...filtered].sort((a,b)=>a.price-b.price); if(sort==='price-desc') filtered=[...filtered].sort((a,b)=>b.price-a.price); if(sort==='rating') filtered=[...filtered].sort((a,b)=>b.rating-a.rating);
 const heading=q?`Search results for “${q}”`:deal?'Featured deals':category?`${category} products`:brand?`${brand} products`:'Shop products and compare prices';
 return <PageShell active="products"><div className="market-page listing-page">
   <div className="crumbs">Home / Products</div>
   <div className="listing-intro"><div><div className="eyebrow">DISCOVER & COMPARE</div><h1>{heading}</h1><p className="lead">Explore products from participating merchants, compare offers and check destination availability before visiting the store.</p></div><div className="listing-trust"><span>✓ Merchant identified</span><span>✓ Destination-aware</span><span>✓ Checkout with merchant</span></div></div>
   <DestinationBar countryCode={country}/>
   <div className="listing-toolbar"><span><b>{filtered.length}</b> products</span><form action="/products" method="get"><input type="hidden" name="country" value={country}/>{category&&<input type="hidden" name="category" value={category}/>}<input name="q" defaultValue={q} placeholder="Search within products..."/><button>Search</button></form><form className="sort-form" action="/products" method="get"><input type="hidden" name="country" value={country}/>{category&&<input type="hidden" name="category" value={category}/>} {q&&<input type="hidden" name="q" value={q}/>}<select name="sort" defaultValue={sort} aria-label="Sort products"><option value="featured">Sort: Featured</option><option value="price-asc">Price: Low to high</option><option value="price-desc">Price: High to low</option><option value="rating">Rating</option></select><button>Apply</button></form></div>
   <div className="catalog-layout"><FilterPanel countryCode={country} activeCategory={category} activeBrand={brand} activeMerchant={merchant}/><section><div className="product-grid">{filtered.map(p=><ProductCard product={p} countryCode={country} key={p.slug}/>)}</div>{!filtered.length&&<div className="empty-state"><div>⌕</div><h2>No matching products</h2><p>Try a broader search, remove a filter or explore our categories.</p><a className="yellow-btn" href="/categories">Browse categories →</a></div>}</section></div>
 </div><JsonLd data={{'@context':'https://schema.org','@type':'CollectionPage',name:'TAMP Marketplace Products',description:'Products and price comparison for shoppers across Africa.',url:'https://tampmarketplace.com/products'}}/></PageShell>
}
