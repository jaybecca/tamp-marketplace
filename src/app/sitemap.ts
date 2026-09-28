import type { MetadataRoute } from 'next';
import { query } from '@/lib/db';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tampmarketplace.com';
const staticPaths = [
  '/', '/products', '/categories', '/merchants', '/destinations', '/deals', '/blog', '/brands',
  '/auth/sign-in', '/auth/register', '/support', '/settings', '/wishlist', '/cart', '/account',
  '/policies/privacy', '/policies/terms', '/policies/cookies', '/policies/affiliate-disclosure', '/policies/accessibility'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await Promise.all([
    query<{slug:string;updated_at:string}>(`SELECT slug,updated_at FROM products WHERE active=TRUE ORDER BY updated_at DESC`).catch(() => ({rows:[]})),
    query<{slug:string;updated_at:string}>(`SELECT slug,updated_at FROM categories WHERE active=TRUE ORDER BY updated_at DESC`).catch(() => ({rows:[]})),
    query<{slug:string;updated_at:string}>(`SELECT slug,updated_at FROM merchants WHERE active=TRUE ORDER BY updated_at DESC`).catch(() => ({rows:[]})),
    query<{slug:string;updated_at:string}>(`SELECT slug,updated_at FROM blog_posts WHERE active=TRUE ORDER BY updated_at DESC`).catch(() => ({rows:[]})),
  ]);
  const [products,categories,merchants,blogs] = rows;
  const entries = [
    ...staticPaths.map(path => ({ path, lastModified: new Date() })),
    ...products.rows.map(x => ({path:`/products/${x.slug}`,lastModified:new Date(x.updated_at)})),
    ...categories.rows.map(x => ({path:`/categories/${x.slug}`,lastModified:new Date(x.updated_at)})),
    ...merchants.rows.map(x => ({path:`/merchants/${x.slug}`,lastModified:new Date(x.updated_at)})),
    ...blogs.rows.map(post => ({path:`/blog/${post.slug}`,lastModified:new Date(post.updated_at)})),
  ];
  const unique = [...new Map(entries.map(x => [x.path,x])).values()];
  return unique.map(({path,lastModified}) => ({
    url:`${siteUrl}${path}`,
    lastModified,
    changeFrequency:path.startsWith('/blog')?'weekly':'daily',
    priority:path==='/'?1:path.startsWith('/products')||path.startsWith('/categories')?0.8:0.6,
  }));
}
