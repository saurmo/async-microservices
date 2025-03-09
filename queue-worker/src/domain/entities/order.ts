

export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETE" | "FAILED";

export interface Order {
  orderId: string;
  userId: string;
  products: { productId: string; quantity: number }[];
  status: OrderStatus;
}
