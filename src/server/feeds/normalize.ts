import crypto from 'node:crypto';
import type { FeedProduct } from './ingest';

export function normalizeText(value: unknown) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function normalizeSku(value: unknown) {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-');
}

export function fingerprintProduct(item: FeedProduct) {
  const canonical = [normalizeSku(item.sourceSku), normalizeText(item.title).toLowerCase(), normalizeText(item.brand).toLowerCase(), normalizeText(item.sourceUrl).toLowerCase()].join('|');
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

export function normalizeFeedProduct(item: FeedProduct): FeedProduct | null {
  const sourceSku = normalizeSku(item.sourceSku);
  const title = normalizeText(item.title);
  const sourceUrl = normalizeText(item.sourceUrl);
  if (!sourceSku || !title || !/^https?:\/\//i.test(sourceUrl)) return null;
  return {
    ...item,
    sourceSku,
    title,
    sourceUrl,
    description: normalizeText(item.description) || null,
    brand: normalizeText(item.brand) || null,
    categorySlug: normalizeText(item.categorySlug) || null,
    currencyCode: normalizeText(item.currencyCode).toUpperCase() || null,
  };
}
