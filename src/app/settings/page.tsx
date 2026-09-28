import type { Metadata } from 'next';
import { PageShell, JsonLd, pageJsonLd } from '@/components/site';
import { PreferencesBar } from '@/components/preferences';
import { AccountClient } from '@/components/account-client';
import { PrivacyConsent } from '@/components/privacy-consent';

export const metadata: Metadata = { title: 'Settings', description: 'Manage TAMP language and currency preferences.', alternates: { canonical: '/settings' } };

export default function SettingsPage() {
 return <PageShell active="settings"><article className="market-page policy">
  <div className="crumbs">Home / Settings</div><div className="eyebrow">SETTINGS</div><h1>TAMP Settings</h1>
  <p className="lead">Manage the shopping preferences used across TAMP on this device.</p>
  <AccountClient />
  <section className="settings-card"><h2>Language and currency</h2><p>Your selections are saved locally on this device and used to adapt TAMP's interface and displayed prices.</p><PreferencesBar /></section>
  <PrivacyConsent />
  <section className="settings-card"><h2>Shopping model</h2><p>TAMP is a discovery and comparison service. Orders, payments, delivery, returns and refunds are handled by the merchant you visit.</p></section>
  <section className="settings-card"><h2>Company</h2><p><strong>Ecosystem brand:</strong> TAMP</p><p><strong>Parent company:</strong> The Active Mode Planners</p><p><strong>Support:</strong> WhatsApp +234 915 234 5733</p><a href="/support">Open support →</a></section>
 </article><JsonLd data={pageJsonLd('WebPage','TAMP Settings','Manage TAMP shopping preferences.','/settings')}/></PageShell>;
}
