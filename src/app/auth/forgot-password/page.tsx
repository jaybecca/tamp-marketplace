'use client';
import { useState } from 'react';
import { AuthShell } from '@/components/auth-shell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setMessage(''); setError(''); try { const r = await fetch('/api/auth/forgot-password', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({email}) }); const d=await r.json().catch(()=>({})); if(!r.ok){setError(d.error||'Please try again later.');} else setMessage(d.message||'If an account exists for that email, a password reset link has been sent.'); } catch { setError('We could not connect to the server. Please try again.'); } finally { setBusy(false); } }
  return <AuthShell><div className="market-page auth-page"><div className="auth-card"><img className="auth-card-logo" src="/tamp-logo.webp" alt="TAMP Marketplace"/><h1>Forgot your password?</h1><p className="lead auth-lead">Enter your email and we’ll send you a secure password reset link.</p><form onSubmit={submit}><div className="form-row"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div>{message&&<p role="status" className="success-box">{message}</p>}{error&&<p role="alert" className="auth-error">{error}</p>}<button className="yellow-btn auth-submit" disabled={busy} type="submit">{busy?'Sending…':'Send reset link'}</button></form><p className="auth-switch"><a href="/auth/sign-in">← Back to sign in</a></p></div></div></AuthShell>;
}
