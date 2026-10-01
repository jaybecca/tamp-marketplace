import crypto from 'node:crypto';

const API_BASE = 'https://api-sg.aliexpress.com/rest';
const AUTH_BASE = 'https://api-sg.aliexpress.com/oauth/authorize';

export function aliexpressCallbackUrl() {
  return (process.env.ALIEXPRESS_CALLBACK_URL || `${(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')}/api/admin/aliexpress/callback`).trim();
}

export function createOAuthState() {
  const nonce = crypto.randomBytes(32).toString('base64url');
  const key = process.env.INTEGRATION_CREDENTIAL_KEY;
  if (!key) throw new Error('INTEGRATION_CREDENTIAL_KEY is not configured');
  const sig = crypto.createHmac('sha256', key).update(nonce).digest('base64url');
  return `${nonce}.${sig}`;
}

export function verifyOAuthState(state: string) {
  const [nonce, sig] = state.split('.');
  const key = process.env.INTEGRATION_CREDENTIAL_KEY;
  if (!nonce || !sig || !key) return false;
  const expected = crypto.createHmac('sha256', key).update(nonce).digest('base64url');
  const a = Buffer.from(sig); const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function buildAuthorizationUrl(state: string) {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  if (!appKey) throw new Error('ALIEXPRESS_APP_KEY is not configured');
  const u = new URL(AUTH_BASE);
  u.searchParams.set('response_type','code');
  u.searchParams.set('force_auth','true');
  u.searchParams.set('redirect_uri',aliexpressCallbackUrl());
  u.searchParams.set('client_id',appKey);
  u.searchParams.set('state',state);
  return u.toString();
}

function sign(params: Record<string,string>) {
  const appSecret = process.env.ALIEXPRESS_APP_SECRET;
  if (!appSecret) throw new Error('ALIEXPRESS_APP_SECRET is not configured');
  const body = Object.keys(params).sort().map(k => `${k}${params[k]}`).join('');
  return crypto.createHmac('sha256', appSecret).update(`/auth/token/create${body}`).digest('hex').toUpperCase();
}

function findTokenPayload(input: any): any {
  if (!input || typeof input !== 'object') return null;
  if (input.access_token || input.refresh_token) return input;
  for (const key of ['response','data','result']) { if (input[key]) { const found=findTokenPayload(input[key]); if(found) return found; } }
  if (typeof input.response_body === 'string') { try { return findTokenPayload(JSON.parse(input.response_body)); } catch {} }
  if (typeof input.body === 'string') { try { return findTokenPayload(JSON.parse(input.body)); } catch {} }
  return null;
}

export async function exchangeAliExpressCode(code: string) {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  if (!appKey) throw new Error('ALIEXPRESS_APP_KEY is not configured');
  const params: Record<string,string> = { app_key: appKey, code, sign_method: 'sha256', timestamp: String(Date.now()) };
  const u = new URL(`${API_BASE}/auth/token/create`);
  Object.entries({...params,sign:sign(params)}).forEach(([k,v])=>u.searchParams.set(k,v));
  const response = await fetch(u, { method:'GET', cache:'no-store' });
  const raw = await response.text();
  let json:any; try { json=JSON.parse(raw); } catch { throw new Error(`AliExpress token response was not JSON (${response.status})`); }
  if (!response.ok) throw new Error(`AliExpress token exchange failed (${response.status})`);
  const token=findTokenPayload(json);
  if (!token?.access_token) throw new Error('AliExpress did not return an access token');
  return token;
}
