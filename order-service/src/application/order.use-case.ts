import { Order } from "../domain/entities/order";
import { Repository } from "../domain/ports/repository";
import { MessageQueue } from "../domain/ports/queue";
import { Logger } from "../domain/ports/logger";
import { Item } from "../domain/entities/item";
import { DbCache } from "../domain/ports/db-cache";

export class OrderUseCase {
  constructor(
    private queue: MessageQueue,
    private repository: Repository<Order>,
    private logger: Logger,
    private cache: DbCache
  ) {}

  createOrder(userId: string, products: Item[]) {
    const order = new Order(userId, products, "PENDING");
    return order;
  }

  async processOrder(order: Order) {
    const orderId = order.orderId;
    await this.repository.save(order);
    try {
      const message = JSON.stringify(order);
      await this.queue.sendMessage(message);
    } catch (error) {
      const message = `Failed to send order ${orderId} to RabbitMQ`;
      this.logger.error(message, { orderId, error });
      order.status = "FAILED";
      await this.repository.updateStatus(orderId, "FAILED");
      throw new Error(message);
    }
    return order;
  }

  async getOrder(orderId: string): Promise<{ order: Order | null; cache: boolean }> {
    const cachedOrder = await this.cache.get(`order:${orderId}`);
    if (cachedOrder) {
      this.logger.info(`Cache hit: Order ${orderId} found in cache`,{ orderId, cache: true });
      return { order: JSON.parse(cachedOrder), cache: true };
    }
    this.logger.info(`Cache miss: Fetching order ${orderId} from MongoDB`,{ orderId, cache: false });
    const order = await this.repository.findById(orderId);

    if (order) {
      const cacheTime: number = Number(process.env.CACHE_TIME) || 300;
      await this.cache.set(`order:${orderId}`, order, cacheTime); 
    }

    return { order, cache: false };
  }
}
