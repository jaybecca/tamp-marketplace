import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const name = String(body.name ?? user?.name ?? '').trim();
    const email = String(body.email ?? user?.email ?? '').trim().toLowerCase();
    const subject = String(body.subject ?? '').trim();
    const message = String(body.message ?? '').trim();
    const priority = ['low','normal','high','urgent'].includes(String(body.priority)) ? String(body.priority) : 'normal';
    if (!subject || !message || message.length > 10000 || (!user && !/^\S+@\S+\.\S+$/.test(email))) {
      return NextResponse.json({ error: 'Name/email, subject and message are required.' }, { status: 400 });
    }
    const r = await query(`INSERT INTO support_tickets(user_id,email,name,subject,message,priority) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,status,created_at`, [user?.id ?? null, email || null, name || null, subject, message, priority]);
    return NextResponse.json({ ticket: r.rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Support is temporarily unavailable.' }, { status: 500 });
  }
}
