
export interface Repository<T> {
  save(entity: T): Promise<void>;
  updateStatus(entityId: string, status: string): Promise<void>;
  findById(entityId: string): Promise<T | null>;
}
