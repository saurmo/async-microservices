import amqplib, { Channel, Connection } from "amqplib";
import { MessageQueue } from "../../domain/ports/queue";
import { Logger } from "../../domain/ports/logger";

export class RabbitQueue implements MessageQueue {
  private static instance: RabbitQueue;
  private connection!: any;
  private channel!: Channel;
  private readonly queueName = "orders";

  private constructor(private logger: Logger) {}

  static async getInstance(logger: Logger): Promise<RabbitQueue> {
    if (!RabbitQueue.instance) {
      RabbitQueue.instance = new RabbitQueue(logger);
      await RabbitQueue.instance.init();
    }
    return RabbitQueue.instance;
  }

  private async init() {
    const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://guest:kD{30@42FWEc@localhost:5672";
    this.connection = await amqplib.connect(rabbitmqUrl);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queueName, { durable: true });
    this.logger.info("RabbitMQ connected");
  }

  async sendMessage(message: string): Promise<void> {
    this.channel.sendToQueue(this.queueName, Buffer.from(message), { persistent: true });
  }
}
