export interface RuntimeEnv {
  ZOBDINO_UPLOAD_TOKEN: string;
  ZOBDINO_ALLOWED_ORIGINS?: string;
  ZOBDINO_GENERATION_MODE?: "offline-test";

  ZOBDINO_DB: {
    prepare(sql: string): {
      bind(...values: unknown[]): {
        run(): Promise<unknown>;
        first<T>(): Promise<T | null>;
      };
    };
  };
}
