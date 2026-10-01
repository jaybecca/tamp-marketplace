'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/auth-shell';
import { PasswordField } from '@/components/preferences';

function ResetPasswordForm(){
 const params=useSearchParams(); const router=useRouter(); const token=params.get('token')||''; const [error,setError]=useState(token?'':'This password reset link is missing or incomplete.'); const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const f=new FormData(e.currentTarget);if(f.get('password')!==f.get('confirmPassword')){setError('Passwords do not match.');setBusy(false);return;}try{const r=await fetch('/api/auth/reset-password',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,password:f.get('password')})});const d=await r.json().catch(()=>({}));if(!r.ok){setError(d.error||'This reset link is invalid or expired.');setBusy(false);return;}router.replace('/auth/sign-in?reset=success');}catch{setError('Password reset could not connect to the server. Please try again.');setBusy(false);}}
 return <AuthShell><div className="market-page auth-page"><div className="auth-card"><img className="auth-card-logo" src="/tamp-logo.webp" alt="TAMP Marketplace"/><h1>Create a new password</h1><p className="lead auth-lead">Choose a new password with at least 8 characters.</p><form onSubmit={submit}><div className="form-row"><label htmlFor="password">New password</label><PasswordField name="password" autoComplete="new-password" placeholder="At least 8 characters"/></div><div className="form-row"><label htmlFor="confirmPassword">Confirm new password</label><PasswordField name="confirmPassword" autoComplete="new-password" placeholder="Enter it again"/></div>{error&&<p role="alert" className="auth-error">{error}</p>}<button className="yellow-btn auth-submit" disabled={busy||!token} type="submit">{busy?'Resetting…':'Reset password'}</button></form><p className="auth-switch"><a href="/auth/sign-in">Back to sign in</a></p></div></div></AuthShell>;
}

export default function ResetPasswordPage(){
 return <Suspense fallback={<AuthShell><div className="market-page auth-page"><div className="auth-card"><h1>Create a new password</h1><p className="lead auth-lead">Loading secure reset link…</p></div></div></AuthShell>}><ResetPasswordForm/></Suspense>;
}
