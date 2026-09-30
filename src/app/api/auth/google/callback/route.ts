import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { ensureAuthSchema } from '@/lib/auth-schema';

export async function GET(request: Request) {
  try {
    await ensureAuthSchema();

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const jar = await cookies();

    if (
      !code ||
      !state ||
      state !== jar.get('tamp_oauth_state')?.value
    ) {
      return NextResponse.redirect(
        new URL('/auth/sign-in?error=oauth_state', request.url),
      );
    }

    jar.set('tamp_oauth_state', '', {
      maxAge: 0,
      path: '/',
    });

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    const redirect = new URL(
      '/api/auth/google/callback',
      siteUrl,
    ).toString();

    const tokenRes = await fetch(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: redirect,
          grant_type: 'authorization_code',
        }),
      },
    );

    if (!tokenRes.ok) {
      throw new Error('Google token exchange failed');
    }

    const token = await tokenRes.json();

    const profileRes = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      },
    );

    if (!profileRes.ok) {
      throw new Error('Google profile lookup failed');
    }

    const profile = await profileRes.json();

    const email = String(profile.email ?? '').toLowerCase();
    const name = String(
      profile.name ?? email.split('@')[0],
    );

    if (!email) {
      throw new Error('Google did not return an email.');
    }

    const found = await query<{ id: string }>(
      'SELECT id FROM users WHERE email=$1 LIMIT 1',
      [email],
    );

    let id = found.rows[0]?.id;

    if (id) {
      await query(
        `UPDATE users
         SET name=$1,
             avatar_url=$2,
             provider=$3,
             provider_account_id=$4,
             updated_at=NOW()
         WHERE id=$5`,
        [
          name,
          profile.picture ?? null,
          'google',
          String(profile.sub ?? ''),
          id,
        ],
      );
    } else {
      const created = await query<{ id: string }>(
        `INSERT INTO users
         (email,name,avatar_url,provider,provider_account_id)
         VALUES($1,$2,$3,$4,$5)
         RETURNING id`,
        [
          email,
          name,
          profile.picture ?? null,
          'google',
          String(profile.sub ?? ''),
        ],
      );

      id = created.rows[0].id;
    }

    await createSession(id);

    return NextResponse.redirect(
      new URL('/account', request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL('/auth/sign-in?error=oauth_failed', request.url),
    );
  }
}
