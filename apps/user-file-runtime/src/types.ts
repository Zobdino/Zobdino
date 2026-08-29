export interface RuntimeEnv {
  ZOBDINO_UPLOAD_TOKEN: string;

  ZOBDINO_DB: {
    prepare(sql: string): {
      bind(...values: unknown[]): {
        run(): Promise<unknown>;
        first<T>(): Promise<T | null>;
      };
    };
  };
}
