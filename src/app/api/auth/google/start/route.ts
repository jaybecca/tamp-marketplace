import { NextResponse } from 'next/server'; import { cookies } from 'next/headers'; import { randomBytes } from 'node:crypto';
import { rateLimit, clientIp } from '@/server/security-rate-limit';
export async function GET(request: Request){
  const rl = await rateLimit(`auth-google:${clientIp(request)}`, 10, 60);
  if (!rl.allowed) return NextResponse.json({error:'Too many Google sign-in attempts. Please try again shortly.'},{status:429,headers:{'Retry-After':'60'}});
  if(!process.env.GOOGLE_CLIENT_ID || !process.env.NEXT_PUBLIC_SITE_URL) return NextResponse.json({error:'Google OAuth is not configured.'},{status:503});
  const state=randomBytes(24).toString('base64url'); const jar=await cookies();
  jar.set('tamp_oauth_state',state,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:600});
  const redirect=new URL('/api/auth/google/callback',process.env.NEXT_PUBLIC_SITE_URL).toString(); const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id',process.env.GOOGLE_CLIENT_ID); url.searchParams.set('redirect_uri',redirect); url.searchParams.set('response_type','code'); url.searchParams.set('scope','openid email profile'); url.searchParams.set('state',state); return NextResponse.redirect(url);
}
