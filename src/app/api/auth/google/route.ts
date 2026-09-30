import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';

export async function GET(request: Request) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      {
        error:
          'Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
      },
      { status: 503 },
    );
  }

  const state = randomBytes(24).toString('base64url');
  const jar = await cookies();

  jar.set('tamp_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  const redirect = new URL(
    '/api/auth/google/callback',
    siteUrl,
  ).toString();

  const url = new URL(
    'https://accounts.google.com/o/oauth2/v2/auth',
  );

  url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', redirect);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);

  return NextResponse.redirect(url);
}
