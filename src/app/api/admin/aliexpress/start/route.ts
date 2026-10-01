import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/lib/admin';
import { buildAuthorizationUrl, createOAuthState } from '@/server/affiliate/aliexpress';

export async function GET(request: Request) {
  try { await requireAdmin();
    const state=createOAuthState();
    const response=NextResponse.redirect(buildAuthorizationUrl(state));
    response.cookies.set('tamp_aliexpress_oauth_state',state,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/api/admin/aliexpress',maxAge:600});
    return response;
  } catch(e) {
    const message=e instanceof Error?e.message:'AliExpress authorization is unavailable.';
    const status=message==='AUTH_REQUIRED'?401:message==='ADMIN_REQUIRED'?403:500;
    return NextResponse.json({error:status===401?'Authentication required.':status===403?'Admin access required.':message},{status});
  }
}
