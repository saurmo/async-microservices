import { createClient } from "redis";
import { Logger } from "../../domain/ports/logger";
import { DbCache } from "src/domain/ports/db-cache";

export class RedisCache implements DbCache {
  private client;

  constructor(logger: Logger) {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    this.client.on("error", (err) => logger.error("Redis Client Error", err));
    this.client.connect();
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: any, ttl: number = 60): Promise<void> {
    await this.client.set(key, JSON.stringify(value), { EX: ttl });
  }
}
