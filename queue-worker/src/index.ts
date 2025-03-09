import { OrderProcessingService } from "./application/consumer-queue.service";
import { ProcessOrder } from "./application/process-order.use-case";
import { ElasticsearchLogger } from "./infraestructure/adapters/elasticsearch.logger";
import { OrderRepository } from "./infraestructure/adapters/order.repository";
import { RabbitMQConsumer } from "./infraestructure/adapters/rabbit-mq.queue";

const logger = new ElasticsearchLogger();

(async () => {
  logger.info("Starting Queue Worker Service.");
  const orderRepository = new OrderRepository(logger);
  const rabbitMQConsumer = await RabbitMQConsumer.getInstance(logger);
  const processOrder = new ProcessOrder(orderRepository, logger);
  const orderProcessingService = new OrderProcessingService(rabbitMQConsumer, processOrder);

  await orderProcessingService.startConsuming();
})()
.then(() => {
  logger.info("Queue Worker Service started successfully.");
})
.catch((error) => {
  logger.error("Queue Worker Service failed to start:", error);
});
