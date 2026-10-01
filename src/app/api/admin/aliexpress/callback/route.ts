import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/lib/admin';
import { query } from '@/lib/db';
import { encryptCredential } from '@/server/integrations/credentials';
import { exchangeAliExpressCode, verifyOAuthState } from '@/server/affiliate/aliexpress';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const u=new URL(request.url);
    const code=u.searchParams.get('code');
    const state=u.searchParams.get('state');
    const cookieState=request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('tamp_aliexpress_oauth_state='))?.split('=')[1];
    if(!code || !state || !cookieState || state!==cookieState || !verifyOAuthState(state)) return NextResponse.json({error:'Invalid or expired AliExpress authorization state.'},{status:400});
    const token:any=await exchangeAliExpressCode(code);
    const sellerId=String(token.user_id||token.seller_id||token.member_id||'').trim();
    if(!sellerId) return NextResponse.json({error:'AliExpress authorization succeeded but no seller identifier was returned.'},{status:502});
    const accessExpiry=token.expires_in?new Date(Date.now()+Number(token.expires_in)*1000):null;
    const refreshExpiry=token.refresh_expires_in?new Date(Date.now()+Number(token.refresh_expires_in)*1000):null;
    await query(`INSERT INTO aliexpress_authorizations(seller_user_id,access_token_ciphertext,refresh_token_ciphertext,access_token_expires_at,refresh_token_expires_at,status,updated_at) VALUES($1,$2,$3,$4,$5,'active',NOW()) ON CONFLICT(seller_user_id) DO UPDATE SET access_token_ciphertext=EXCLUDED.access_token_ciphertext,refresh_token_ciphertext=EXCLUDED.refresh_token_ciphertext,access_token_expires_at=EXCLUDED.access_token_expires_at,refresh_token_expires_at=EXCLUDED.refresh_token_expires_at,status='active',updated_at=NOW()`,[sellerId,encryptCredential(String(token.access_token)),token.refresh_token?encryptCredential(String(token.refresh_token)):null,accessExpiry,refreshExpiry]);
    const response=NextResponse.redirect(new URL('/admin?aliexpress=connected',u));
    response.cookies.set('tamp_aliexpress_oauth_state','',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/api/admin/aliexpress',maxAge:0});
    return response;
  } catch(e) {
    console.error('AliExpress OAuth callback failed',e);
    return NextResponse.json({error:'AliExpress authorization could not be completed.'},{status:500});
  }
}
