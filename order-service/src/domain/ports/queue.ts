
export interface MessageQueue {
  sendMessage(message: string): Promise<void>;
}
