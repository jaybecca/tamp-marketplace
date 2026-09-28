export type DatabaseHealth = {
  configured: boolean;
  provider: "postgresql" | "unconfigured";
};

export interface DatabaseAdapter {
  health(): Promise<DatabaseHealth>;
}
