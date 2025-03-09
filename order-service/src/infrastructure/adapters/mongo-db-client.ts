import { MongoClient, Db } from "mongodb";

export class MongoDBClient {
  private static instance: MongoDBClient;
  private client!: MongoClient;
  private db!: Db;

  private constructor() {} 

  static async getInstance(): Promise<MongoDBClient> {
    if (!MongoDBClient.instance) {
      MongoDBClient.instance = new MongoDBClient();
      await MongoDBClient.instance.connect();
    }
    return MongoDBClient.instance;
  }

  private async connect() {
    const uri= process.env.MONGO_URL || "mongodb://mongodb:27017/orders";
    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db("orders");
  }

  getDatabase(): Db {
    return this.db;
  }

  async closeConnection() {
    await this.client.close();
    console.log("MongoDB Connection Closed");
  }
}
