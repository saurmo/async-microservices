import { Logging } from "../domain/logging";

export class LogsUseCase {
  constructor(private logging: Logging) {}

  async allLogs() {
    const logs = await this.logging.getLogs({
      index: "logs-*",
    });
    return logs;
  }

  async orderLogs(orderId: string) {
    const logs = await this.logging.getLogs({
      index: "logs-*",
      query: {
        match: { "fields.orderId": orderId },
      },
    });
    return logs;
  }
}
