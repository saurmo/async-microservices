import { ProcessOrder } from "../src/application/process-order.use-case";
import { Order } from "../src/domain/entities/order";
import { Logger } from "../src/domain/ports/logger";
import { Repository } from "../src/domain/ports/repository";

describe("ProcessOrder", () => {
  let mockRepository: jest.Mocked<Repository<Order>>;
  let mockLogger: jest.Mocked<Logger>;
  let processOrder: ProcessOrder;
  let order: Order;

  beforeEach(() => {
    mockRepository = {
      updateStatus: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    processOrder = new ProcessOrder(mockRepository, mockLogger);

    order = { orderId:'o1123', userId: "user123", products: [{ productId: "p1", quantity: 2 }], status: "PENDING" };
  });

  test("should process an order successfully", async () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.9);  
    await processOrder.execute(order);

    expect(mockRepository.updateStatus).toHaveBeenCalledWith(order.orderId, "PROCESSING");
    expect(mockRepository.updateStatus).toHaveBeenCalledWith(order.orderId, "COMPLETE");

    expect(mockLogger.info).toHaveBeenCalledWith(`Processing order ${order.orderId}...`, expect.any(Object));
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Order ${order.orderId} completed successfully.`,
      expect.any(Object)
    );
  });

  test("should fail processing an order and update status to FAILED", async () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.1);  

    await processOrder.execute(order);

    expect(mockRepository.updateStatus).toHaveBeenCalledWith(order.orderId, "PROCESSING");
    expect(mockRepository.updateStatus).toHaveBeenCalledWith(order.orderId, "FAILED");

    expect(mockLogger.error).toHaveBeenCalledWith(`Order ${order.orderId} failed:`, expect.any(Object));
  });

  afterEach(() => {
    jest.spyOn(global.Math, "random").mockRestore();
  });
});
