import { MessageQueue } from "../domain/ports/queue";
import { ProcessOrder } from "./process-order.use-case";

export class OrderProcessingService {
  constructor(private messageQueue: MessageQueue, private processOrder: ProcessOrder) {}

  async startConsuming() {
    await this.messageQueue.consume("orders", async (order) => {
      await this.processOrder.execute(order);
    });
  }
}
