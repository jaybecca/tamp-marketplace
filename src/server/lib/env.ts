const optionalPublic = (value: string | undefined, fallback: string) => value?.trim() || fallback;

export const serverEnv = {
  siteUrl: optionalPublic(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"),
  siteName: optionalPublic(process.env.NEXT_PUBLIC_SITE_NAME, "TAMP Marketplace"),
  defaultCurrency: optionalPublic(process.env.NEXT_PUBLIC_DEFAULT_CURRENCY, "USD"),
  defaultLanguage: optionalPublic(process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE, "en"),
  databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;

export function assertProductionEnvironment() {
  if (process.env.NODE_ENV !== "production") return;
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required in production.");
  }
}
