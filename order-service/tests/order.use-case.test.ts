import { Item } from "../src/domain/entities/item";
import { Order } from "../src/domain/entities/order";
import { MessageQueue } from "../src/domain/ports/queue";
import { Repository } from "../src/domain/ports/repository";
import { Logger } from "../src/domain/ports/logger";
import { DbCache } from "../src/domain/ports/db-cache";
import { OrderUseCase } from "../src/application/order.use-case";

const mockQueue: jest.Mocked<MessageQueue> = {
  sendMessage: jest.fn(),
};

const mockRepository: jest.Mocked<Repository<Order>> = {
  save: jest.fn(),
  updateStatus: jest.fn(),
  findById: jest.fn(),
};

const mockLogger: jest.Mocked<Logger> = {
  info: jest.fn(),
  error: jest.fn(),
};

const mockCache: jest.Mocked<DbCache> = {
  get: jest.fn(),
  set: jest.fn(),
};

const orderUseCase = new OrderUseCase(mockQueue, mockRepository, mockLogger, mockCache);

describe("OrderUseCase", () => {
  const userId = "12345";
  const products: Item[] = [
    { productId: "p1", quantity: 2 },
    { productId: "p2", quantity: 1 },
  ];
  const order = new Order(userId, products, "PENDING");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an order with status PENDING", () => {
    const createdOrder = orderUseCase.createOrder(userId, products);
    expect(createdOrder.userId).toBe(userId);
    expect(createdOrder.products).toEqual(products);
    expect(createdOrder.status).toBe("PENDING");
  });

  it("should process an order successfully", async () => {
    mockQueue.sendMessage.mockResolvedValue();
    mockRepository.save.mockResolvedValue();

    await expect(orderUseCase.processOrder(order)).resolves.toEqual(order);

  });

  it("should handle failure when sending order to queue", async () => {
    mockQueue.sendMessage.mockRejectedValue(new Error("Queue error"));
    mockRepository.save.mockResolvedValue();
    mockRepository.updateStatus.mockResolvedValue();

    await expect(orderUseCase.processOrder(order)).rejects.toThrow("Failed to send order");

  });

  it("should return order from cache if exists", async () => {
    mockCache.get.mockResolvedValue(JSON.stringify(order));

    const result = await orderUseCase.getOrder(order.orderId);

    expect(result.cache).toBe(true);
    expect(result.order).toEqual(order);

  });

  it("should fetch order from database if not found in cache", async () => {
    mockCache.get.mockResolvedValue(null);
    mockRepository.findById.mockResolvedValue(order);
    mockCache.set.mockResolvedValue();

    const result = await orderUseCase.getOrder(order.orderId);

    expect(result.cache).toBe(false);
    expect(result.order).toEqual(order);
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Cache miss: Fetching order ${order.orderId} from MongoDB`,
      expect.any(Object)
    );
    expect(mockCache.set).toHaveBeenCalledWith(`order:${order.orderId}`, order, expect.any(Number));
  });

  it("should return null if order is not found in cache or database", async () => {
    mockCache.get.mockResolvedValue(null);
    mockRepository.findById.mockResolvedValue(null);

    const result = await orderUseCase.getOrder(order.orderId);

    expect(result.cache).toBe(false);
    expect(result.order).toBeNull();
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Cache miss: Fetching order ${order.orderId} from MongoDB`,
      expect.any(Object)
    );
  });
});
