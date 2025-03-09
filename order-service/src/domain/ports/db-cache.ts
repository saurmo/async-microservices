
export interface DbCache {
  get(key: string): Promise<string | null>;
  set(key: string, value: any, ttl: number): Promise<void>;
}