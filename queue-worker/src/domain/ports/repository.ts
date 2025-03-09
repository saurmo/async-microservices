
export interface Repository<T> {
  updateStatus(entityId: string, status: string): Promise<void>;
}
