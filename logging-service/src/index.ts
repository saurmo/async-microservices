import express from "express";
import cors from "cors";
import { LogsController } from "./infrastructure/presentation/controllers/logs.controller";
import { handlerMiddlewareNotFound } from "./infrastructure/presentation/middlewares/not-found";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app
  .get("/logs", LogsController.allLogs)
  .get("/logs/orders/:orderId", LogsController.orderLogs)
  .use(handlerMiddlewareNotFound);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
