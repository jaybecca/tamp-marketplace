import type { Metadata } from 'next';
import { PageShell, JsonLd, pageJsonLd } from '@/components/site';

export const metadata: Metadata = { title: 'Support', description: 'Contact TAMP support through WhatsApp or email.', alternates: { canonical: '/support' } };

export default function SupportPage() {
  return <PageShell active="support"><article className="market-page policy">
    <div className="crumbs">Home / Support</div><div className="eyebrow">SUPPORT</div>
    <h1>How can we help?</h1><p className="lead">TAMP Marketplace is a shopping discovery and comparison service within the TAMP ecosystem. For questions about TAMP Marketplace, use the support channels below.</p>
    <div className="info-grid">
      <div><h2>WhatsApp</h2><p>Chat with TAMP support on WhatsApp.</p><a className="yellow-btn" href="https://wa.me/2349152345733" target="_blank" rel="noreferrer">Message us on WhatsApp</a><p><strong>+234 915 234 5733</strong></p></div>
      <div><h2>Email</h2><p>For marketplace support and general enquiries:</p><p><strong>marketplace.tampconsulting.space</strong></p><p className="site-note">This contact address is shown exactly as supplied for TAMP support.</p></div>
    </div>
    <h2>Merchant orders</h2><p>TAMP does not take payment, ship products or fulfil merchant orders. If you have an issue with an order, payment, delivery, return or refund made on a merchant website, contact that merchant directly.</p>
    <h2>Parent company</h2><p>TAMP is a brand of <strong>The Active Mode Planners</strong>.</p>
  </article><JsonLd data={pageJsonLd('ContactPage','TAMP Support','TAMP support and contact information.','/support')}/></PageShell>;
}
