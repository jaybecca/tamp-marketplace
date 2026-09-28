import Redis from "ioredis";

let client: Redis | undefined;

export function redis() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not configured");
  if (!client) client = new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: true });
  return client;
}

export async function redisHealth() {
  if (!process.env.REDIS_URL) return { configured: false, provider: "redis" as const };
  try {
    const result = await redis().ping();
    return { configured: result === "PONG", provider: "redis" as const };
  } catch {
    return { configured: false, provider: "redis" as const };
  }
}
