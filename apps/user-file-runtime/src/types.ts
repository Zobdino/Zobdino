export interface RuntimeEnv {
  ZOBDINO_UPLOAD_TOKEN: string;

  ZOBDINO_UPLOADS: {
    put(
      key: string,
      value: ArrayBuffer,
      options?: {
        httpMetadata?: {
          contentType?: string;
        };
        customMetadata?: Record<string, string>;
      },
    ): Promise<unknown>;

    get(
      key: string,
    ): Promise<{
      arrayBuffer(): Promise<ArrayBuffer>;
    } | null>;
  };

  ZOBDINO_DB: {
    prepare(sql: string): {
      bind(...values: unknown[]): {
        run(): Promise<unknown>;
        first<T>(): Promise<T | null>;
      };
    };
  };
}
