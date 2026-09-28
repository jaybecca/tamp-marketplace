import type { ReactNode } from 'react';
import { AuthHeader } from './preferences';

export function AuthShell({ children }: { children: ReactNode }) {
  return <>
    <AuthHeader />
    <main>{children}</main>
    <footer className="auth-footer"><div><img src="/tamp-logo.webp" alt="TAMP" /><span>Compare. Click. Shop.</span></div><span>© 2026 TAMP Marketplace</span></footer>
  </>;
}
