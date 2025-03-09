import { Order } from "../../domain/entities/order";
import { Logger } from "../../domain/ports/logger";
import { Repository } from "../../domain/ports/repository";
import { MongoDBClient } from "./mongo-db-client";

export class OrderRepository implements Repository<Order> {
  private tableName: string = "orders";

  constructor(private logger: Logger) {}

  async save(order: Order): Promise<void> {
    const client = await MongoDBClient.getInstance();
    const db = client.getDatabase();
    await db.collection(this.tableName).insertOne(order);
    this.logger.info("Order saved in MongoDB", {orderId: order.orderId, status: order.status});
  }
  async updateStatus(orderId: string, status: string): Promise<void> {
    const client = await MongoDBClient.getInstance();
    const db = client.getDatabase();
    await db.collection(this.tableName).updateOne({ orderId }, { $set: { status } });
    this.logger.info(`Order ${orderId} status updated to '${status}'`);
  }

  async findById(orderId: string): Promise<any> {
    const client = await MongoDBClient.getInstance();
    const db = client.getDatabase();
    const order = await db.collection(this.tableName).findOne({ orderId });
    return order;
  }
}
