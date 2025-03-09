import amqplib, { Channel, Connection } from "amqplib";
import { MessageQueue } from "../../domain/ports/queue";
import { Logger } from "../../domain/ports/logger";

export class RabbitMQConsumer implements MessageQueue {
  private static instance: RabbitMQConsumer;
  private connection!: any;
  private channel!: Channel;
  private readonly queueName = "orders";

  private constructor(private logger: Logger) {}

  static async getInstance(logger: Logger): Promise<RabbitMQConsumer> {
    if (!RabbitMQConsumer.instance) {
      RabbitMQConsumer.instance = new RabbitMQConsumer(logger);
      await RabbitMQConsumer.instance.init();
    }
    return RabbitMQConsumer.instance;
  }

  private async init() {
    const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://guest:kD{30@42FWEc@localhost:5672";
    this.connection = await amqplib.connect(rabbitmqUrl);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queueName, { durable: true });
    this.logger.info("RabbitMQ connected");
  }

  async consume(queue: string, callback: (message: any) => Promise<void>): Promise<void> {
    if (!this.channel) throw new Error("RabbitMQ channel not initialized");
    this.channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          this.channel!.ack(msg);
        } catch (error) {
          this.logger.error("Error processing message:", { error, message: msg.content.toString() });
          this.channel!.nack(msg, false, false);
        }
      }
    });
  }
}
