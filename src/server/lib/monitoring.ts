export type ClientErrorEvent = {
  message: string;
  digest?: string;
  path?: string;
  language?: string;
};

export function reportServerError(error: unknown, context: Record<string, unknown> = {}) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('TAMP_SERVER_ERROR', { message, ...context });
}
