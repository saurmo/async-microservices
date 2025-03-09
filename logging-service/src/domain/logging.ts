export interface Logging {
  getLogs(query: any): Promise<any[]>;
}
