import { neon } from '@neondatabase/serverless';

export type QueryResult<T> = {
  rows: T[];
  rowCount: number;
};

const DB_QUERY_TIMEOUT_MS = 8000;

export function db() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  return neon(process.env.DATABASE_URL);
}

export async function query<T = Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  const sql = db();

  const queryPromise = sql.query(text, values);

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Database query timed out after ${DB_QUERY_TIMEOUT_MS}ms`));
    }, DB_QUERY_TIMEOUT_MS);
  });

  const rows = await Promise.race([
    queryPromise,
    timeoutPromise,
  ]);

  return {
    rows: rows as T[],
    rowCount: rows.length,
  };
}

