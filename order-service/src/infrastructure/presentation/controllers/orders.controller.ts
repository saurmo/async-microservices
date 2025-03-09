import { Request, Response } from "express";
import { RabbitQueue } from "../../adapters/rabbit-mq.queue";
import { OrderUseCase } from "../../../application/order.use-case";
import { OrderRepository } from "../../adapters/order.repository";
import { RedisCache } from "../../adapters/redis-cache";
import { ElasticsearchLogger } from "../../adapters/elasticsearch.logger";

export class OrderController {
  static async initDependencies() {
    const logger = new ElasticsearchLogger();
    const redisCache = new RedisCache(logger);
    const queue = await RabbitQueue.getInstance(logger);
    const repository = new OrderRepository(logger);
    const orderUseCase = new OrderUseCase(queue, repository, logger, redisCache);
    return { logger, queue, repository, orderUseCase };
  }

  static async createOrder(req: Request, res: Response): Promise<any> {
    try {
      const { userId, products } = req.body;

      if (!userId || !Array.isArray(products)) return res.status(400).json({ message: "Invalid order data" });

      const { logger, orderUseCase } = await OrderController.initDependencies();
      const order = orderUseCase.createOrder(userId, products);
      orderUseCase
        .processOrder(order)
        .then(() => {
          logger.info("Order successfully sent to RabbitMQ:", { orderId: order.orderId, status: order.status });
        })
        .catch((error) => {
          logger.error("Failed to send order to RabbitMQ:", error);
        });

      return res.status(202).json({
        orderId: order.orderId,
        status: order.status,
      });
    } catch (error) {
      console.error("Failed to process order:", error);

      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async getOrder(req: Request, res: Response): Promise<any> {
    try {
      const { orderId } = req.params;
      if (!orderId) return res.status(400).json({ message: "Invalid orderId" });

      const { orderUseCase } = await OrderController.initDependencies();

      const { order, cache } = await orderUseCase.getOrder(orderId);

      if (cache) res.setHeader("X-Cache", "HIT");

      if (!order) return res.status(404).json({ message: "Order not found" });

      return res.status(200).json(order);
    } catch (error) {
      console.error("Failed to get order:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
