import { getCurrentUser } from '@/lib/auth';

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error('AUTH_REQUIRED');
  const configured = (process.env.ADMIN_EMAILS ?? '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
  if ((user as UserWithRole).role !== 'admin' && !configured.includes(user.email.toLowerCase())) throw new Error('ADMIN_REQUIRED');
  return user as UserWithRole;
}

type UserWithRole = { id: string; email: string; name: string; role: 'customer' | 'admin' };
