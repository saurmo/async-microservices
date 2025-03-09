# Challenge NodeJS

- **challenge-nodejs.postman_collection.json**: Postman collection with the API requests.

## Prerequisites
To run this project successfully, ensure you have the following installed on your machine:

### Required Software
- **Docker & Docker Compose** - [Download](https://www.docker.com/get-started)
- **Git** (Optional, for cloning the repository) - [Download](https://git-scm.com/)

## HOW TO RUN

1. Clone the repository or download the code.
2. Open a terminal and navigate to the project directory.
3. Run `docker-compose up -d --build`.
This command will:
- Start **MongoDB**, **Redis**, **RabbitMQ**, and **Elasticsearch**
- Build and start the **Order Service** ,  **Logging Service**, and **Queue Worker**

4. Wait for the containers to start, ensuring all services are up and running. 
- Ensure ports `3000`, `3001`, `5672`, `27017`, `6379`, and `9200` are not in use by other applications.

5. To stop the containers and remove the volumes, run `docker-compose down -v`.

For any issues, check the logs with:
`docker-compose logs -f`


## ORDER SERVICE

> This service is responsible for creating and retrieving orders.

### POST /api/v1/orders

> This endpoint is used to create a new order, save it to the database, and send it to the queue. It accepts a JSON payload with the following properties:

| Property | Type   | Description                                                         |
| -------- | ------ | ------------------------------------------------------------------- |
| userId   | string | The user ID associated with the order.                              |
| products | array  | An array of objects representing the products and their quantities. |

Example:

```json
{
  "userId": "12345",
  "products": [
    { "productId": "p1", "quantity": 2 },
    { "productId": "p2", "quantity": 1 }
  ]
}
```

```curl
curl --location 'http://localhost:3000/api/v1/orders' \
--header 'Content-Type: application/json' \
--data '{
    "userId": "1",
    "products": [
        {
            "productId": "p1",
            "quantity": 2
        },
        {
            "productId": "p2",
            "quantity": 1
        }
    ]
}'
```

### GET /api/v1/orders/:orderId

> This endpoint retrieves the details of a specific order using its `orderId`. It first checks the Redis cache; if the order is not found in the cache, it fetches it from the database and stores it in the cache for 5 minutes.
> Response headers include `X-Cache: HIT` if the order is found in the cache, and `X-Cache: MISS` if the order is not found in the cache.

Example:

```json
{
  "orderId": "12345",
  "userId": "12345",
  "products": [
    { "productId": "p1", "quantity": 2 },
    { "productId": "p2", "quantity": 1 }
  ],
  "status": "PENDING"
}
```

## LOGGING SERVICE

> This service is responsible for logging application-related events. It provides an API to retrieve logs.

### GET /logs

> This endpoint retrieves all logs.

```curl
curl --location 'http://localhost:3001/logs'
```

### GET /logs/orders/:orderId

> This endpoint retrieves logs related to a specific order using its `orderId`. If no matching order is found, it returns an empty array.

```curl
curl --location 'http://localhost:3001/logs/orders/o2104'
```

Example response:

```json
[
  {
    "@timestamp": "2025-03-08T21:29:53.109Z",
    "message": "Order sent to RabbitMQ",
    "severity": "info",
    "fields": {
      "userId": "1",
      "orderId": "o2104",
      "status": "PENDING",
      "service": "order-service"
    }
  }
]
```

## QUEUE WORKER

> This service is responsible for consuming messages from the queue and processing them. It updates order statuses in the database and logs events to Elasticsearch.

## DEPENDENCIES

- RabbitMQ: [`Docker image`](https://hub.docker.com/_/rabbitmq/)
- MongoDB: [`Docker image`](https://hub.docker.com/_/mongo/)
- Redis: [`Docker image`](https://hub.docker.com/_/redis/)
- Elasticsearch: [`Docker image`](https://hub.docker.com/_/elasticsearch)
- NodeJS: `node:18-alpine`
