import { Client } from "@elastic/elasticsearch";
import { Logging } from "../../domain/logging";

export class ElasticsearchService implements Logging {
  elasticClient = new Client({
    node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  });

  async getLogs(query: any) {
    const { hits } = await this.elasticClient.search(query);
    const logs = hits.hits.map((hit) => hit._source)?.sort((a:any, b:any) => a['@timestamp'] - b['@timestamp']);
    return logs;
  }
}
