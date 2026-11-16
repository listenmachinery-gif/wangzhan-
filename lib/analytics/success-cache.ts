import "server-only";

type CacheEntry = {
  expiresAt: number;
  value: unknown;
};

export class SuccessCache {
  private readonly values = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly successTtlMs: number;

  constructor(options: { successTtlMs?: number } = {}) {
    this.successTtlMs = options.successTtlMs ?? 15 * 60 * 1_000;
  }

  async getOrLoad<T>(
    key: string,
    load: () => Promise<T>,
    now = new Date(),
  ): Promise<T> {
    const nowMs = now.getTime();
    const cached = this.values.get(key);
    if (cached && cached.expiresAt > nowMs) return cached.value as T;
    if (cached) this.values.delete(key);

    const existing = this.inFlight.get(key);
    if (existing) return existing as Promise<T>;

    const loading = load()
      .then((value) => {
        this.values.set(key, { value, expiresAt: nowMs + this.successTtlMs });
        return value;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });
    this.inFlight.set(key, loading);
    return loading;
  }
}
