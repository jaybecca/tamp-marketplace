import { query } from '@/lib/db';
import type { AvailabilityStatus, Product } from '@/data/marketplace';

export type DbCountry = {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  region: string;
};

export type DbMerchant = {
  slug: string;
  name: string;
  websiteUrl: string;
  icon: string;
  type: string;
  status: AvailabilityStatus;
};

export type DbCategory = {
  slug: string;
  name: string;
  icon: string;
  count: number;
};

export type DbDestinationCountry = DbCountry & {
  merchants: DbMerchant[];
};

const countryMeta: Record<
  string,
  { flag: string; region: string; symbol: string }
> = {
  NG: { flag: '🇳🇬', region: 'West Africa', symbol: '₦' },
  GH: { flag: '🇬🇭', region: 'West Africa', symbol: 'GH₵' },
  KE: { flag: '🇰🇪', region: 'East Africa', symbol: 'KSh' },
  EG: { flag: '🇪🇬', region: 'North Africa', symbol: 'E£' },
  MA: { flag: '🇲🇦', region: 'North Africa', symbol: 'MAD' },
  UG: { flag: '🇺🇬', region: 'East Africa', symbol: 'USh' },
  SN: { flag: '🇸🇳', region: 'West Africa', symbol: 'CFA' },
  CI: { flag: '🇨🇮', region: 'West Africa', symbol: 'CFA' },
};

const merchantMeta: Record<string, { icon: string; type: string }> = {
  amazon: { icon: 'a', type: 'amazon' },
  jumia: { icon: '✦', type: 'jumia' },
  aliexpress: { icon: 'AE', type: 'ali' },
  ebay: { icon: 'e', type: 'ebay' },
  temu: { icon: 'TEMU', type: 'temu' },
};

const iconByCategory: Record<string, string> = {
  electronics: '💻',
  wearables: '⌚',
  phones: '📱',
  laptops: '💻',
  fashion: '👕',
  shoes: '👟',
  beauty: '💄',
  'home-living': '🛋️',
  sports: '⚽',
  toys: '🧸',
  automotive: '🚙',
  books: '📚',
  audio: '🎧',
};

const currencySymbols: Record<string, string> = {
  NGN: '₦',
  GHS: 'GH₵',
  KES: 'KSh',
  UGX: 'USh',
  ZAR: 'R',
  TZS: 'TSh',
  RWF: 'RF',
  ETB: 'Br',
  ZMW: 'ZK',
  BWP: 'P',
  MZN: 'MT',
  AOA: 'Kz',
  CDF: 'FC',
  XAF: 'CFA',
  DZD: 'دج',
  TND: 'د.ت',
  EGP: 'E£',
  MAD: 'MAD',
  XOF: 'CFA',
  GMD: 'D',
  SLE: 'Le',
  MWK: 'MK',
  MGA: 'Ar',
  BIF: 'FBu',
  MUR: '₨',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

function countryFromRow(x: {
  code: string;
  name: string;
  currency_code: string;
}): DbCountry {
  const code = x.code.trim();
  const currency = x.currency_code.trim();
  const meta = countryMeta[code];

  return {
    code,
    name: x.name,
    currency,
    currencySymbol: currencySymbols[currency] || meta?.symbol || currency,
    flag: meta?.flag || '🌍',
    region: meta?.region || 'Africa',
  };
}

function merchantFromRow(x: {
  slug: string;
  name: string;
  website_url: string;
  status: string;
}): DbMerchant {
  const slug = x.slug;
  const meta = merchantMeta[slug];

  return {
    slug,
    name: x.name,
    websiteUrl: x.website_url,
    icon: meta?.icon || x.name.slice(0, 1).toUpperCase(),
    type: meta?.type || slug,
    status: (x.status || 'unknown') as AvailabilityStatus,
  };
}

export async function getDbCountries(): Promise<DbCountry[]> {
  const r = await query<{
    code: string;
    name: string;
    currency_code: string;
    default_language: string;
  }>(
    `SELECT code,name,currency_code,default_language
     FROM countries
     WHERE active=TRUE
     ORDER BY name`,
  );

  return r.rows.map((x) =>
    countryFromRow({
      code: x.code,
      name: x.name,
      currency_code: x.currency_code,
    }),
  );
}

/**
 * Loads the complete destination/merchant matrix in one database query.
 *
 * This replaces the previous destinations-page pattern of running one
 * merchant query per country. With 54 countries and 5 merchants, this
 * returns 270 rows in a single round trip.
 */
export async function getDbDestinationData(): Promise<
  DbDestinationCountry[]
> {
  const r = await query<{
    country_code: string;
    country_name: string;
    currency_code: string;
    merchant_slug: string;
    merchant_name: string;
    website_url: string;
    status: string;
  }>(
    `SELECT
       c.code AS country_code,
       c.name AS country_name,
       c.currency_code,
       m.slug AS merchant_slug,
       m.name AS merchant_name,
       m.website_url,
       COALESCE(mca.status,'unknown') AS status
     FROM countries c
     CROSS JOIN merchants m
     LEFT JOIN merchant_country_availability mca
       ON mca.merchant_id = m.id
      AND mca.country_code = c.code
     WHERE c.active=TRUE
       AND m.active=TRUE
     ORDER BY c.name,m.name`,
  );

  const grouped = new Map<string, DbDestinationCountry>();

  for (const row of r.rows) {
    const code = row.country_code.trim();

    if (!grouped.has(code)) {
      grouped.set(code, {
        ...countryFromRow({
          code,
          name: row.country_name,
          currency_code: row.currency_code,
        }),
        merchants: [],
      });
    }

    grouped.get(code)!.merchants.push(
      merchantFromRow({
        slug: row.merchant_slug,
        name: row.merchant_name,
        website_url: row.website_url,
        status: row.status,
      }),
    );
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export async function getDbCountry(code = 'NG') {
  const list = await getDbCountries();

  return (
    list.find((x) => x.code === code.toUpperCase()) || list[0]
  );
}

export async function getDbMerchants(
  country = 'NG',
): Promise<DbMerchant[]> {
  const r = await query<{
    slug: string;
    name: string;
    website_url: string;
    status: string;
  }>(
    `SELECT m.slug,m.name,m.website_url,
            COALESCE(mca.status,'unknown') AS status
     FROM merchants m
     LEFT JOIN merchant_country_availability mca
       ON mca.merchant_id = m.id
      AND mca.country_code = $1
     WHERE m.active=TRUE
     ORDER BY m.name`,
    [country.toUpperCase()],
  );

  return r.rows.map((x) => merchantFromRow(x));
}

export async function getDbCategories(): Promise<DbCategory[]> {
  const r = await query<{
    slug: string;
    name: string;
    icon: string | null;
    count: string;
  }>(
    `SELECT c.slug,c.name,c.icon,COUNT(p.id)::text count
     FROM categories c
     LEFT JOIN products p
       ON p.category_slug=c.slug
      AND p.active=TRUE
     WHERE c.active=TRUE
     GROUP BY c.slug,c.name,c.icon
     ORDER BY c.name`,
  );

  return r.rows.map((x) => ({
    slug: x.slug,
    name: x.name,
    icon: x.icon || '🛍️',
    count: Number(x.count),
  }));
}

export function productFromDb(r: any): Product {
  const offers = (r.offers || []) as Product['offers'];
  const price = Number(r.price || 0);
  const old = Number(r.old_price || 0);

  return {
    slug: r.slug,
    name: r.title,
    category:
      r.category_slug?.replaceAll('-', ' ') || 'Products',
    brand: r.brand || '',
    icon: iconByCategory[r.category_slug] || '🛍️',
    price,
    oldPrice: old || undefined,
    rating: Number(r.rating || 0),
    reviews: Number(r.reviews || 0),
    merchant: r.merchant || offers?.[0]?.merchant || '',
    affiliateId: offers?.[0]?.affiliateId,
    discount:
      old > price
        ? Math.round((1 - price / old) * 100)
        : undefined,
    description: r.description || '',
    tags: [],
    offers,
  };
}
