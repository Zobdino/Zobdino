export interface RuntimeAudioObject {
  body: ReadableStream<Uint8Array>;
  size: number;
  httpMetadata?: { contentType?: string };
  customMetadata?: Record<string, string>;
}

export interface RuntimeAudioBucket {
  put(
    key: string,
    value: ArrayBuffer | Uint8Array,
    options?: {
      httpMetadata?: { contentType?: string };
      customMetadata?: Record<string, string>;
    },
  ): Promise<unknown>;
  get(key: string): Promise<RuntimeAudioObject | null>;
}

export interface RuntimeEnv {
  ZOBDINO_UPLOAD_TOKEN: string;
  ZOBDINO_ALLOWED_ORIGINS?: string;
  ZOBDINO_GENERATION_MODE?: "offline-test" | "gemini";
  GEMINI_API_KEY?: string;
  ZOBDINO_AUDIO_BUCKET?: RuntimeAudioBucket;

  ZOBDINO_DB: {
    prepare(sql: string): {
      bind(...values: unknown[]): {
        run(): Promise<unknown>;
        first<T>(): Promise<T | null>;
      };
    };
  };
}
