import { Request, Response } from "express";
import { LogsUseCase } from "../../../application/logs.use-case";
import { ElasticsearchService } from "../../adapters/elasticsearch.service";

export class LogsController {
  static async initDependencies() {
    const loggingService = new ElasticsearchService();
    const logsUseCase = new LogsUseCase(loggingService);
    return { logsUseCase };
  }

  static async allLogs(_: Request, res: Response): Promise<any> {
    try {
      const { logsUseCase } = await LogsController.initDependencies();
      const logs = await logsUseCase.allLogs();
      return res.status(200).json(logs);
    } catch (error) {
      console.error("Failed to get logs:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async orderLogs(req: Request, res: Response): Promise<any> {
    try {
      const { orderId } = req.params;
      const { logsUseCase } = await LogsController.initDependencies();
      if (!orderId) return res.status(400).json({ message: "Invalid orderId" });
      const logs = await logsUseCase.orderLogs(orderId);
      return res.status(200).json(logs);
    } catch (error) {
      console.error("Failed to get order logs:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
