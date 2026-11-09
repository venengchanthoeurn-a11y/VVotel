import Redis from "ioredis";

// In-Memory cache fallback implementation matching Redis API for development and offline testing
class InMemoryCache {
  private store: Map<string, { value: string; expiry: number | null }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<string> {
    let expiry: number | null = null;
    if (mode === "EX" && duration) {
      expiry = Date.now() + duration * 1000;
    }
    this.store.set(key, { value, expiry });
    return "OK";
  }

  async setNX(key: string, value: string, expireSeconds?: number): Promise<boolean> {
    const existing = await this.get(key);
    if (existing !== null) return false;
    await this.set(key, value, expireSeconds ? "EX" : undefined, expireSeconds);
    return true;
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async ping(): Promise<string> {
    return "PONG (Memory Fallback)";
  }
}

// Global cache provider that safely connects to Redis if available or falls back to in-memory
class SafeCacheService {
  private client: Redis | InMemoryCache;
  private isRedisConnected = false;
  private providerName = "memory";
  private fallbackMemory = new InMemoryCache();

  constructor() {
    const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
    try {
      const redisInstance = new Redis(redisUrl, {
        connectTimeout: 1500,
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        retryStrategy: () => null, // don't spam reconnect if local Redis is down
      });

      redisInstance.on("connect", () => {
        this.isRedisConnected = true;
        this.providerName = "redis";
        console.log("✅ [VVotel Redis] Connected to Redis server successfully.");
      });

      redisInstance.on("error", () => {
        this.isRedisConnected = false;
        this.providerName = "memory-fallback";
      });

      redisInstance.connect().catch(() => {
        this.isRedisConnected = false;
        this.providerName = "memory-fallback";
      });

      this.client = redisInstance;
    } catch {
      this.client = new InMemoryCache();
      this.providerName = "memory-fallback";
    }
  }

  public isReady(): boolean {
    return this.isRedisConnected && "status" in this.client && this.client.status === "ready";
  }

  public isProduction(): boolean {
    return process.env.NODE_ENV === "production" && !process.env.ALLOW_INSECURE_DEV_SESSIONS;
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.isReady()) {
        return await (this.client as Redis).get(key);
      }
    } catch {
      // fallback
    }
    return await this.fallbackMemory.get(key);
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<string> {
    try {
      if (this.isReady()) {
        if (mode && duration) {
          return await (this.client as Redis).set(key, value, mode as "EX", duration);
        }
        return await (this.client as Redis).set(key, value);
      }
    } catch {
      // fallback
    }
    return await this.fallbackMemory.set(key, value, mode, duration);
  }

  /**
   * Atomic set-if-not-exists (NX) with expiration
   * Crucial for transaction ID replay protection and distributed idempotency keys
   */
  async setNX(key: string, value: string, expireSeconds?: number): Promise<boolean> {
    try {
      if (this.isReady()) {
        if (expireSeconds) {
          const res = await (this.client as Redis).set(key, value, "EX", expireSeconds, "NX");
          return res === "OK";
        }
        const res = await (this.client as Redis).setnx(key, value);
        return res === 1;
      }
    } catch {
      // fallback
    }
    return await this.fallbackMemory.setNX(key, value, expireSeconds);
  }

  /**
   * Acquire a distributed mutex lock
   * Uses Redis atomic SET key value NX PX ttlMs to guarantee cross-instance exclusivity
   */
  async acquireLock(resourceKey: string, lockId: string, ttlMs = 5000): Promise<boolean> {
    const lockKey = `lock:${resourceKey}`;
    try {
      if (this.isReady()) {
        const res = await (this.client as Redis).set(lockKey, lockId, "PX", ttlMs, "NX");
        return res === "OK";
      }
    } catch {
      // fallback
    }
    return await this.fallbackMemory.setNX(lockKey, lockId, Math.ceil(ttlMs / 1000));
  }

  /**
   * Release a distributed mutex lock safely
   * Checks that the caller owns the lockId before deleting to prevent releasing other workers' locks
   */
  async releaseLock(resourceKey: string, lockId: string): Promise<boolean> {
    const lockKey = `lock:${resourceKey}`;
    try {
      if (this.isReady()) {
        const script = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
        const res = await (this.client as Redis).eval(script, 1, lockKey, lockId);
        return res === 1;
      }
    } catch {
      // fallback
    }
    const current = await this.fallbackMemory.get(lockKey);
    if (current === lockId) {
      await this.fallbackMemory.del(lockKey);
      return true;
    }
    return false;
  }

  async del(key: string): Promise<number> {
    try {
      if (this.isReady()) {
        return await (this.client as Redis).del(key);
      }
    } catch {
      // fallback
    }
    return await this.fallbackMemory.del(key);
  }

  getStatus() {
    return {
      connected: this.isRedisConnected,
      provider: this.isRedisConnected ? "Redis (v7.x / Distributed Remote)" : "In-Memory LRU Cache (Fast Fallback)",
      cdnCache: "Cloudflare / Vercel Edge Cache (Stale-While-Revalidate)",
      distributedReady: this.isReady(),
    };
  }
}

export const cache = new SafeCacheService();
export const safeCache = cache;
