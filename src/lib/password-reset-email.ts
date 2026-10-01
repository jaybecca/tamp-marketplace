const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function sendPasswordResetEmail(input: { to: string; name: string; token: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error('Password reset email delivery is not configured.');

  const resetUrl = `${siteUrl()}/auth/reset-password?token=${encodeURIComponent(input.token)}`;
  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: 'Reset your TAMP Marketplace password',
      text: `Hi ${input.name || 'there'},\n\nWe received a request to reset your TAMP Marketplace password. Use this link within 30 minutes:\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.\n\nTAMP Marketplace`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#082e68;max-width:560px;margin:auto"><h2>Reset your TAMP Marketplace password</h2><p>Hi ${escapeHtml(input.name || 'there')},</p><p>We received a request to reset your password. This link expires in 30 minutes.</p><p><a href="${resetUrl}" style="display:inline-block;background:#ffc400;color:#062b62;text-decoration:none;font-weight:800;padding:12px 18px;border-radius:8px">Reset password</a></p><p style="font-size:13px;color:#607792">If you did not request this, you can safely ignore this email.</p><p>TAMP Marketplace</p></div>`,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Password reset email failed: ${response.status} ${detail.slice(0, 300)}`);
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] || char);
}
