import type { Metadata } from 'next';
import {
  PageShell,
  africaKeywords,
  JsonLd,
  siteUrl,
} from '@/components/site';
import { getDbDestinationData } from '@/server/marketplace-db';

export const metadata: Metadata = {
  title: 'Shopping destinations across Africa',
  description:
    'See how TAMP Marketplace models merchant availability by destination country.',
  keywords: [
    ...africaKeywords,
    'merchant availability Africa',
    'shopping destinations',
  ],
};

const statusLabel = (s: string) =>
  ({
    available: 'Available',
    limited: 'Limited',
    'product-dependent': 'Product dependent',
    'not-available': 'Not available',
    unknown: 'Unknown',
  })[s] || 'Unknown';

export default async function Destinations() {
  const destinations = await getDbDestinationData();

  return (
    <PageShell active="destinations">
      <div className="market-page destination-page">
        <div className="crumbs">Home / Destinations</div>

        <div className="eyebrow">SHOP BY DESTINATION</div>

        <h1>See what merchants serve each destination.</h1>

        <p className="lead">
          TAMP Marketplace does not hold inventory or fulfill orders.
          Destination data helps us show relevant merchant offers while the
          merchant remains responsible for checkout, shipping, returns and
          fulfillment.
        </p>

        <div className="destination-grid">
          {destinations.map((country) => (
            <article
              className="destination-card"
              key={country.code}
            >
              <div className="destination-card-top">
                <span>{country.flag}</span>

                <div>
                  <h2>{country.name}</h2>
                  <small>
                    {country.currency} · {country.region}
                  </small>
                </div>
              </div>

              <div className="coverage-list">
                {country.merchants.map((merchant) => (
                  <div key={merchant.slug}>
                    <span>{merchant.name}</span>

                    <b
                      className={`coverage coverage-${merchant.status}`}
                    >
                      {statusLabel(merchant.status)}
                    </b>
                  </div>
                ))}
              </div>

              <a
                className="yellow-btn"
                href={`/products?country=${country.code}`}
              >
                Shop in {country.name} →
              </a>
            </article>
          ))}
        </div>

        <div className="site-note">
          <b>How the data works:</b> merchant-level coverage is only one
          layer. A particular product can still have different shipping
          rules, seller restrictions, fees or delivery options. TAMP
          Marketplace should use product-level merchant feeds/APIs where
          available and direct shoppers to the merchant to confirm final
          terms.
        </div>
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'TAMP Marketplace Shopping Destinations',
          url: `${siteUrl}/destinations`,
        }}
      />
    </PageShell>
  );
}
