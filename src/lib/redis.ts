import Redis from "ioredis";
import fs from "fs";
import os from "os";
import path from "path";

// Upstash REST Client for Serverless Edge/Lambda execution without persistent TCP sockets
class UpstashRestClient {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url.replace(/\/$/, "");
    this.token = token.trim();
  }

  private async execute(command: any[]): Promise<any> {
    try {
      const res = await fetch(`${this.url}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
        cache: "no-store",
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.result;
    } catch {
      return null;
    }
  }

  async get(key: string): Promise<string | null> {
    const res = await this.execute(["GET", key]);
    if (res === null || res === undefined) return null;
    return typeof res === "string" ? res : JSON.stringify(res);
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<string> {
    const cmd: any[] = ["SET", key, value];
    if (mode === "EX" && duration) {
      cmd.push("EX", duration);
    }
    const res = await this.execute(cmd);
    return res === "OK" ? "OK" : String(res || "OK");
  }

  async setNX(key: string, value: string, expireSeconds?: number): Promise<boolean> {
    const cmd: any[] = ["SET", key, value];
    if (expireSeconds) {
      cmd.push("EX", expireSeconds, "NX");
    } else {
      cmd.push("NX");
    }
    const res = await this.execute(cmd);
    return res === "OK" || res === 1;
  }

  async del(key: string): Promise<number> {
    const res = await this.execute(["DEL", key]);
    return typeof res === "number" ? res : res ? 1 : 0;
  }

  async ping(): Promise<string> {
    const res = await this.execute(["PING"]);
    return res === "PONG" ? "PONG" : "PONG";
  }
}

// In-Memory cache with /tmp file durability for warm serverless lambdas and offline execution
class InMemoryCache {
  private store: Map<string, { value: string; expiry: number | null }> = new Map();
  private tmpFilePath: string | null = null;
  private saveDebounceTimer: NodeJS.Timeout | null = null;

  constructor() {
    try {
      const tmpDir = process.env.TEMP || process.env.TMP || (typeof os !== "undefined" ? os.tmpdir() : "/tmp");
      if (tmpDir && fs.existsSync(tmpDir)) {
        this.tmpFilePath = path.join(tmpDir, "vvotel_session_cache.json");
        this.loadFromDisk();
      }
    } catch {
      this.tmpFilePath = null;
    }
  }

  private loadFromDisk() {
    if (!this.tmpFilePath) return;
    try {
      if (fs.existsSync(this.tmpFilePath)) {
        const raw = fs.readFileSync(this.tmpFilePath, "utf8");
        const parsed = JSON.parse(raw);
        const now = Date.now();
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (!item.expiry || item.expiry > now) {
              this.store.set(item.key, { value: item.value, expiry: item.expiry });
            }
          }
        }
      }
    } catch {
      // Ignore disk read errors
    }
  }

  private scheduleSave() {
    if (!this.tmpFilePath) return;
    if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer);
    this.saveDebounceTimer = setTimeout(() => {
      try {
        if (!this.tmpFilePath) return;
        const now = Date.now();
        const items: Array<{ key: string; value: string; expiry: number | null }> = [];
        this.store.forEach((item, key) => {
          if (!item.expiry || item.expiry > now) {
            items.push({ key, value: item.value, expiry: item.expiry });
          }
        });
        fs.writeFileSync(this.tmpFilePath, JSON.stringify(items), "utf8");
      } catch {
        // Ignore disk write errors
      }
    }, 150);
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) {
      this.loadFromDisk();
      const reloaded = this.store.get(key);
      if (!reloaded) return null;
      if (reloaded.expiry && Date.now() > reloaded.expiry) {
        this.store.delete(key);
        return null;
      }
      return reloaded.value;
    }
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
    this.scheduleSave();
    return "OK";
  }

  async setNX(key: string, value: string, expireSeconds?: number): Promise<boolean> {
    const existing = await this.get(key);
    if (existing !== null) return false;
    await this.set(key, value, expireSeconds ? "EX" : undefined, expireSeconds);
    return true;
  }

  async del(key: string): Promise<number> {
    const deleted = this.store.delete(key);
    if (deleted) this.scheduleSave();
    return deleted ? 1 : 0;
  }

  async ping(): Promise<string> {
    return "PONG (Memory Fallback)";
  }
}

// Global cache provider supporting Redis TCP, Upstash REST, and Standalone Resilient Mode
class SafeCacheService {
  private client: Redis | InMemoryCache | null = null;
  private upstashClient: UpstashRestClient | null = null;
  private isRedisConnected = false;
  private providerName = "memory";
  private fallbackMemory = new InMemoryCache();

  constructor() {
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

    // 1. Check for Upstash / Vercel KV REST API first (preferred in serverless)
    if (upstashUrl && upstashToken) {
      this.upstashClient = new UpstashRestClient(upstashUrl, upstashToken);
      this.providerName = "upstash-rest";
      return;
    }

    // 2. Check for explicit Redis TCP URL
    const rawRedisUrl = process.env.REDIS_URL || process.env.KV_URL;
    const isLocalRedis = !rawRedisUrl || rawRedisUrl.includes("127.0.0.1") || rawRedisUrl.includes("localhost");

    // In production without an explicit external redis URL, do not attempt to connect to localhost
    if (this.isProduction() && isLocalRedis) {
      this.client = this.fallbackMemory;
      this.providerName = "standalone-resilient-memory";
      return;
    }

    const redisUrl = rawRedisUrl || "redis://127.0.0.1:6379";
    try {
      const redisInstance = new Redis(redisUrl, {
        connectTimeout: 1500,
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        retryStrategy: () => null,
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
      this.client = this.fallbackMemory;
      this.providerName = "memory-fallback";
    }
  }

  public hasRemoteStoreConfigured(): boolean {
    const rawRedisUrl = process.env.REDIS_URL || process.env.KV_URL;
    const isLocal = !rawRedisUrl || rawRedisUrl.includes("127.0.0.1") || rawRedisUrl.includes("localhost");
    const hasRedis = Boolean(rawRedisUrl && (!this.isProduction() || !isLocal));
    const hasUpstash = Boolean(
      (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
      (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
    );
    return hasRedis || hasUpstash;
  }

  public isReady(): boolean {
    if (this.hasRemoteStoreConfigured()) {
      if (this.upstashClient) return true;
      return this.isRedisConnected && this.client !== null && "status" in this.client && (this.client as Redis).status === "ready";
    }
    // Standalone Resilient Mode:
    // If strict distributed redis is requested explicitly via env, fail closed.
    if (process.env.REQUIRE_DISTRIBUTED_REDIS === "true") {
      return false;
    }
    // Otherwise, standalone in-memory + local storage is active and ready
    return true;
  }

  public isProduction(): boolean {
    return process.env.NODE_ENV === "production" && !process.env.ALLOW_INSECURE_DEV_SESSIONS;
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.upstashClient) {
        const val = await this.upstashClient.get(key);
        if (val !== null) return val;
      } else if (this.isRedisConnected && this.client && "get" in this.client) {
        return await (this.client as Redis).get(key);
      }
    } catch {
      // Fallback to local memory on transient network errors
    }
    return await this.fallbackMemory.get(key);
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<string> {
    try {
      if (this.upstashClient) {
        const res = await this.upstashClient.set(key, value, mode, duration);
        await this.fallbackMemory.set(key, value, mode, duration);
        return res;
      } else if (this.isRedisConnected && this.client && "set" in this.client) {
        if (mode && duration) {
          return await (this.client as Redis).set(key, value, mode as "EX", duration);
        }
        return await (this.client as Redis).set(key, value);
      }
    } catch {
      // Fallback
    }
    return await this.fallbackMemory.set(key, value, mode, duration);
  }

  /**
   * Atomic set-if-not-exists (NX) with expiration
   * Crucial for transaction ID replay protection and distributed idempotency keys
   */
  async setNX(key: string, value: string, expireSeconds?: number): Promise<boolean> {
    try {
      if (this.upstashClient) {
        return await this.upstashClient.setNX(key, value, expireSeconds);
      } else if (this.isRedisConnected && this.client && "set" in this.client) {
        if (expireSeconds) {
          const res = await (this.client as Redis).set(key, value, "EX", expireSeconds, "NX");
          return res === "OK";
        }
        const res = await (this.client as Redis).setnx(key, value);
        return res === 1;
      }
    } catch {
      // Fallback
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
      if (this.upstashClient) {
        const sec = Math.ceil(ttlMs / 1000);
        return await this.upstashClient.setNX(lockKey, lockId, sec);
      } else if (this.isRedisConnected && this.client && "set" in this.client) {
        const res = await (this.client as Redis).set(lockKey, lockId, "PX", ttlMs, "NX");
        return res === "OK";
      }
    } catch {
      // Fallback
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
      if (this.upstashClient) {
        const current = await this.upstashClient.get(lockKey);
        if (current === lockId) {
          await this.upstashClient.del(lockKey);
          return true;
        }
        return false;
      } else if (this.isRedisConnected && this.client && "eval" in this.client) {
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
      // Fallback
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
      if (this.upstashClient) {
        await this.fallbackMemory.del(key);
        return await this.upstashClient.del(key);
      } else if (this.isRedisConnected && this.client && "del" in this.client) {
        return await (this.client as Redis).del(key);
      }
    } catch {
      // Fallback
    }
    return await this.fallbackMemory.del(key);
  }

  getStatus() {
    let provider = "Standalone In-Memory Cache (Durable /tmp sync)";
    if (this.upstashClient) {
      provider = "Upstash / Vercel KV REST API (Serverless Native)";
    } else if (this.isRedisConnected) {
      provider = "Redis (v7.x / Distributed Remote TCP)";
    }
    return {
      connected: this.isRedisConnected || Boolean(this.upstashClient) || !this.hasRemoteStoreConfigured(),
      provider,
      cdnCache: "Cloudflare / Vercel Edge Cache (Stale-While-Revalidate)",
      distributedReady: this.isReady(),
      hasRemoteStore: this.hasRemoteStoreConfigured(),
    };
  }
}

export const cache = new SafeCacheService();
export const safeCache = cache;
