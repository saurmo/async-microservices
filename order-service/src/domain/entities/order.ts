import { Item } from "./item";

export class Order {
  public orderId: string;
  constructor(
    public userId: string,
    public products: Item[],
    public status: string
  ) {
    this.orderId = this.generateOrderId();
  }

  private generateOrderId(): string {
    return `o${Math.floor(1000 + Math.random() * 9000)}`; //  "oXXXX" (Ej: o1234)
  }
}
