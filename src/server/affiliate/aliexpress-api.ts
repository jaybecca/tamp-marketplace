import { createHmac } from 'node:crypto';

const TOP_ENDPOINT = 'https://eco.taobao.com/router/rest';

type Params = Record<string, string>;

function timestampChina() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).format(new Date()).replace('T', ' ');
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function signTopRequest(params: Params, secret: string) {
  const canonical = Object.keys(params).sort().map((key) => key + params[key]).join('');
  return createHmac('md5', secret).update(canonical, 'utf8').digest('hex').toUpperCase();
}

async function callAffiliateApi(method: string, businessParams: Params) {
  const params: Params = {
    app_key: requiredEnv('ALIEXPRESS_APP_KEY'),
    format: 'json',
    method,
    sign_method: 'hmac',
    timestamp: timestampChina(),
    v: '2.0',
    ...businessParams,
  };
  params.sign = signTopRequest(params, requiredEnv('ALIEXPRESS_APP_SECRET'));

  const body = new URLSearchParams(params);
  const response = await fetch(TOP_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body,
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`AliExpress affiliate API returned HTTP ${response.status}`);

  let payload: any;
  try { payload = JSON.parse(raw); }
  catch { throw new Error('AliExpress affiliate API returned an unreadable response'); }

  const root = payload?.aliexpress_affiliate_product_query_response
    ?? payload?.aliexpress_affiliate_link_generate_response
    ?? payload;
  const result = root?.resp_result;
  if (result && Number(result.resp_code) !== 200) {
    throw new Error(`AliExpress affiliate API rejected the request (code ${result.resp_code})`);
  }
  if (payload?.error_response) {
    const code = payload.error_response.code ?? 'unknown';
    throw new Error(`AliExpress affiliate API error (${code})`);
  }
  return payload;
}

export async function searchAliExpressAffiliateProducts(input: {
  keywords: string;
  shipToCountry?: string;
  targetCurrency?: string;
  targetLanguage?: string;
  page?: number;
  pageSize?: number;
}) {
  const keywords = input.keywords.trim().slice(0, 120);
  if (!keywords) throw new Error('A product search keyword is required');
  const country = (input.shipToCountry || 'US').toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) throw new Error('shipToCountry must be a two-letter country code');

  const params: Params = {
    fields: 'product_id,product_title,product_detail_url,product_main_image_url,sale_price,sale_price_currency,original_price,original_price_currency,commission_rate,evaluate_rate,lastest_volume,promotion_link,first_level_category_name,second_level_category_name',
    keywords,
    page_no: String(Math.max(1, Math.min(100, Math.trunc(input.page || 1)))),
    page_size: String(Math.max(1, Math.min(50, Math.trunc(input.pageSize || 20)))),
    ship_to_country: country,
    target_currency: (input.targetCurrency || 'USD').toUpperCase(),
    target_language: (input.targetLanguage || 'EN').toUpperCase(),
    tracking_id: requiredEnv('ALIEXPRESS_TRACKING_ID'),
  };
  return callAffiliateApi('aliexpress.affiliate.product.query', params);
}

export async function generateAliExpressPromotionLink(sourceUrl: string) {
  let url: URL;
  try { url = new URL(sourceUrl); } catch { throw new Error('A valid AliExpress product URL is required'); }
  if (url.protocol !== 'https:' || !(url.hostname === 'aliexpress.com' || url.hostname.endsWith('.aliexpress.com'))) {
    throw new Error('Only HTTPS AliExpress product URLs can be converted');
  }
  return callAffiliateApi('aliexpress.affiliate.link.generate', {
    promotion_link_type: '0',
    source_values: url.toString(),
    tracking_id: requiredEnv('ALIEXPRESS_TRACKING_ID'),
  });
}
