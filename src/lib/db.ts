import { neon } from '@neondatabase/serverless';

type QueryResult<T> = {
  rows: T[];
  rowCount: number;
};

export function db() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }
  return neon(process.env.DATABASE_URL);
}

export async function query<T = Record<string, unknown>>(
  text: string,
  values: unknown[] = []
): Promise<QueryResult<T>> {
  const sql = db();
  const rows = await sql.query(text, values) as T[];

  return {
    rows,
    rowCount: rows.length,
  };
}
