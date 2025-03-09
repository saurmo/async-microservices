import express from "express";
import cors from "cors";
import { OrderController } from "./infrastructure/presentation/controllers/orders.controller";
import { notFoundMiddleware } from "./infrastructure/presentation/middlewares/not-found";
import { cacheHeadersMiddleware } from "./infrastructure/presentation/middlewares/cache-headers";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app
  .post("/api/v1/orders", OrderController.createOrder)
  .get("/api/v1/orders/:orderId", cacheHeadersMiddleware, OrderController.getOrder)
  .use(notFoundMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
