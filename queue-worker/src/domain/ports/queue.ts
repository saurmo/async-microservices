
export interface MessageQueue {
  consume(queue: string, callback: (message: any) => Promise<void>): Promise<void>;
}
