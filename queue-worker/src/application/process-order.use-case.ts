import { Order } from "../domain/entities/order";
import { Logger } from "../domain/ports/logger";
import { Repository } from "../domain/ports/repository";

export class ProcessOrder {
  constructor(private orderRepository: Repository<Order>, private logger: Logger) {}

  async execute({ orderId, status }: Order): Promise<void> {
    try {
      this.logger.info(`Processing order ${orderId}...`, { orderId, status });

      await this.orderRepository.updateStatus(orderId, "PROCESSING");

      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (Math.random() > 0.2) {
        await this.orderRepository.updateStatus(orderId, "COMPLETE");
        this.logger.info(`Order ${orderId} completed successfully.`, { orderId, status });
      } else {
        throw new Error("Random processing error");
      }
    } catch (error) {
      this.logger.error(`Order ${orderId} failed:`, { orderId, status, error });
      await this.orderRepository.updateStatus(orderId, "FAILED");
    }
  }
}
