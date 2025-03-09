import winston from "winston";
import { ElasticsearchTransport } from "winston-elasticsearch";
import { Logger } from "../../domain/ports/logger";

export class ElasticsearchLogger implements Logger {
  private logger: winston.Logger;

  constructor() {
    const esTransportOpts = {
      level: "info",
      clientOpts: { node: process.env.ELASTICSEARCH_URL || "http://localhost:9200" },
      indexPrefix: "logs", 
    };

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.json(),
      transports: [
        new ElasticsearchTransport(esTransportOpts), 
      ],
    });
  }

  info(message: string, meta?: any) {
    this.logger.info(message, { ...meta, service: "queue-worker" });
  }

  error(message: string, meta?: any) {
    this.logger.error(message, { ...meta, service: "queue-worker" });
  }
}
