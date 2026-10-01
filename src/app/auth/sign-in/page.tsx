'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PasswordField } from '@/components/preferences';
import { AuthShell } from '@/components/auth-shell';

function SignInForm(){
 const router=useRouter();
 const params=useSearchParams();
 const [error,setError]=useState(params.get('error')?'Google sign-in could not be completed.':params.get('reset')==='success'?'Your password has been reset. Please sign in with your new password.':'');
 const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');try{const f=new FormData(e.currentTarget);const r=await fetch('/api/auth/sign-in',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:f.get('email'),password:f.get('password')})});const d=await r.json().catch(()=>({}));if(!r.ok){setError(d.error||'Sign-in failed. Please check your connection and try again.');setBusy(false);return;}router.replace('/account'); router.refresh();}catch{setError('Sign-in could not connect to the server. Please try again.');setBusy(false);}}
 return <AuthShell><div className="market-page auth-page"><div className="auth-card"><img className="auth-card-logo" src="/tamp-logo.webp" alt="TAMP Marketplace"/><h1>Welcome back</h1><p className="lead auth-lead">Sign in to continue your shopping journey.</p><a className="google-btn" href="/api/auth/google"><span className="google-mark">G</span>Continue with Google</a><div className="auth-divider"><span>or continue with email</span></div><form onSubmit={submit}><div className="form-row"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com"/></div><div className="form-row"><label htmlFor="password">Password</label><PasswordField name="password" required autoComplete="current-password" placeholder="Your password"/></div><div className="auth-options"><label className="remember"><input name="remember" type="checkbox"/> <span>Remember me</span></label><a href="/auth/forgot-password">Forgot password?</a></div>{error&&<p role="alert" className="auth-error">{error}</p>}<button className="yellow-btn auth-submit" disabled={busy} type="submit">{busy?'Signing in…':'Sign in'}</button></form><p className="auth-browse"><a href="/">← Continue browsing TAMP Marketplace</a></p><p className="auth-switch">New to TAMP? <a href="/auth/register">Create an account</a></p></div></div></AuthShell>;}

export default function SignIn(){
 return <Suspense fallback={<AuthShell><div className="market-page auth-page"><div className="auth-card"><h1>Welcome back</h1><p className="lead auth-lead">Sign in to continue your shopping journey.</p></div></div></AuthShell>}><SignInForm/></Suspense>;
}
