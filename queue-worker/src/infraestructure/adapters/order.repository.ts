import { Order } from "../../domain/entities/order";
import { Logger } from "../../domain/ports/logger";
import { Repository } from "../../domain/ports/repository";
import { MongoDBClient } from "./mongo-db-client";

export class OrderRepository implements Repository<Order> {

  constructor(private logger: Logger) {}

  async updateStatus(orderId: string, status: string): Promise<void> {
    const client = await MongoDBClient.getInstance();
    const db = client.getDatabase();
    await db.collection("orders").updateOne({ orderId }, { $set: { status } });
    this.logger.info(`Order ${orderId} status updated to '${status}'`, { orderId, status });
  }
}
