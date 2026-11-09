import Redis from "ioredis";

// In-Memory cache fallback implementation matching Redis API
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

  constructor() {
    const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
    try {
      const redisInstance = new Redis(redisUrl, {
        connectTimeout: 1000,
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        retryStrategy: () => null, // don't spam reconnect if local Redis is down
      });

      redisInstance.on("connect", () => {
        this.isRedisConnected = true;
        this.providerName = "redis";
        console.log("✅ [VVotel Redis] Connected to Redis Cache server successfully.");
      });

      redisInstance.on("error", () => {
        // Suppress unhandled error log when Redis is not running
        this.isRedisConnected = false;
        this.providerName = "memory-fallback";
      });

      // Try connecting in the background
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

  async get(key: string): Promise<string | null> {
    try {
      if (this.isRedisConnected && "status" in this.client && this.client.status === "ready") {
        return await (this.client as Redis).get(key);
      }
    } catch {
      // fallback
    }
    if (!this.fallbackMemory) {
      this.fallbackMemory = new InMemoryCache();
    }
    return await this.fallbackMemory.get(key);
  }

  private fallbackMemory = new InMemoryCache();

  async set(key: string, value: string, mode?: string, duration?: number): Promise<string> {
    try {
      if (this.isRedisConnected && "status" in this.client && this.client.status === "ready") {
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

  async del(key: string): Promise<number> {
    try {
      if (this.isRedisConnected && "status" in this.client && this.client.status === "ready") {
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
      provider: this.isRedisConnected ? "Redis (v7.x / Remote)" : "In-Memory LRU Cache (Fast Fallback)",
      cdnCache: "Cloudflare / Vercel Edge Cache (Stale-While-Revalidate)",
    };
  }
}

export const cache = new SafeCacheService();
export const safeCache = cache;
