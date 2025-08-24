
# RedisStreamsModule Integration Guide

This library provides a modular way to work with Redis Streams in NestJS, supporting both publishing and consuming stream events.

## Features

- **RedisStreamsModule**: Main entry point for configuring Redis connection and stream registration.
- **BaseClient**: Handles Redis connection lifecycle and graceful shutdown.
- **RedisStreamsClient**: Publishes validated payloads to Redis streams.
- **RedisStreamsServer**: Consumes events from Redis streams using group/consumer semantics.
- **InjectRedisStreamClient Decorator**: Injects the stream client into your services/controllers.
- **Type-safe Payloads**: Uses Zod schemas for payload validation.
- **Customizable Stream, Group, Consumer IDs**.

---

## Usage

### 1. Import and Configure

```typescript
import { RedisStreamsModule } from '@app/redis-stream-events';

@Module({
  imports: [
    RedisStreamsModule.forRoot({ url: 'redis://localhost:6379' }),
    RedisStreamsModule.register({ streamId: 'mystream' }),
  ],
  controllers: [ExamplesController],
  providers: [ExamplesService],
})
export class ExamplesModule {}
```

### 2. Inject the Client

Use the provided decorator to inject the client:

```typescript
import { InjectRedisStreamClient, RedisStreamsClient } from '@app/redis-stream-events';

@Injectable()
export class MyService {
  constructor(
    @InjectRedisStreamClient() private readonly redisClient: RedisStreamsClient,
  ) {}

  async publishEvent<T>(pattern: string, schema: z.ZodSchema<T>, data: T) {
    await this.redisClient.sendPayload(pattern, { schema, data });
  }
}
```

### 3. Consuming Events

Implement a custom server using `RedisStreamsServer` to consume events from a stream:

```typescript
import { RedisStreamsServer } from '@app/redis-stream-events';

const server = new RedisStreamsServer('mystream', 'nestjs_group', 'consumer-1');
server.listen(() => {
  // Ready to consume events
});
```

---

## API Reference

### RedisStreamsModule

- `forRoot({ url })`: Configure Redis connection.
- `register({ streamId })`: Register a stream for publishing/consuming.

### RedisStreamsClient

- `sendPayload(pattern, { schema, data })`: Publishes a validated payload to the stream.

### RedisStreamsServer

- `listen(callback)`: Starts consuming events from the stream.
- Supports group and consumer configuration.

### BaseClient

- Handles connection, shutdown, and exposes the raw Redis client.

### Decorators

- `InjectRedisStreamClient()`: Injects the stream client.

### Interfaces

- `IRedisStreamEventsClient`: Ensures type-safe publishing.

---

## Best Practices

- Use environment variables for sensitive config.
- Validate all payloads with Zod schemas.
- Handle shutdown gracefully for clean disconnects.

---

**Summary:**  
This library enables robust, type-safe event streaming with Redis in NestJS, supporting both publishing and consuming with easy configuration and dependency injection.
