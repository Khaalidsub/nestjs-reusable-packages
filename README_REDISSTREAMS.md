
# RedisStreamsModule Integration Guide

This library provides a modular way to work with Redis Streams in NestJS, supporting both publishing and consuming stream events.

## Features

- **Multi-Stream Support**: Consume from multiple Redis streams using a single consumer group and consumer ID
- **Efficient Polling**: Single `XREADGROUP` call handles multiple streams simultaneously
- **RedisStreamsModule**: Main entry point for configuring Redis connection and stream registration
- **BaseClient**: Handles Redis connection lifecycle and graceful shutdown
- **RedisStreamsClient**: Publishes validated payloads to Redis streams
- **RedisStreamsServer**: Consumes events from one or more Redis streams using group/consumer semantics
- **InjectRedisStreamClient Decorator**: Injects the stream client into your services/controllers
- **Type-safe Payloads**: Uses Zod schemas for payload validation
- **Configuration Validation**: Runtime validation with clear error messages

---

## Usage

### 1. Import and Configure

```typescript
import { RedisStreamsModule } from '@app/redis-stream-events';

@Module({
  imports: [
    // Basic configuration with URL string
    RedisStreamsModule.forRoot('redis://localhost:6379'),
    
    // Or with detailed configuration object
    RedisStreamsModule.forRoot({
      url: 'redis://localhost:6379',
      password: 'your-password', // optional
      username: 'your-username', // optional
      database: 0, // optional, defaults to 0
      connectTimeout: 10000, // optional, defaults to 10000ms
      commandTimeout: 5000, // optional, defaults to 5000ms
    }),
    
    // Register a stream (defaults to 'mystream' if not provided)
    RedisStreamsModule.register({ streamId: 'user-events' }),
  ],
  controllers: [ExamplesController],
  providers: [ExamplesService],
})
export class ExamplesModule {}
```

### 2. Configuration Validation

The library uses Zod schemas for runtime validation of configuration options. If invalid configuration is provided, you'll receive clear error messages:

```typescript
// ❌ This will throw a clear error
RedisStreamsModule.forRoot({
  url: 'invalid-url', // Must be a valid URL
  port: 999999, // Port must be between 1 and 65535
});

// ✅ Error message example:
// "Redis configuration error for field "url": Redis URL must be a valid URL (e.g., redis://localhost:6379). 
//  Received: "invalid-url". Details: url: Invalid url"
```

### 2. Inject the Client

Use the provided decorator to inject the client:

```typescript
import { InjectRedisStreamClient, RedisStreamsClient } from '@app/redis-stream-events';
import { z } from 'zod';

@Injectable()
export class MyService {
  constructor(
    @InjectRedisStreamClient() private readonly redisClient: RedisStreamsClient,
  ) {}

  async publishUserEvent(userId: string, action: string) {
    const UserEventSchema = z.object({
      userId: z.string(),
      action: z.string(),
      timestamp: z.date(),
    });

    await this.redisClient.sendPayload('user.action', {
      schema: UserEventSchema,
      data: {
        userId,
        action,
        timestamp: new Date(),
      },
    });
  }
}
```

### 3. Consuming Events from Multiple Streams

Implement a custom server using `RedisStreamsServer` to consume from one or more streams using a single consumer group:

```typescript
import { RedisStreamsServer } from '@app/redis-stream-events';

// Single stream configuration
const singleStreamServer = new RedisStreamsServer({
  streams: [{ name: 'user-events' }],
  group: 'user-service-group',
  consumer: 'consumer-1',
});

// Multiple streams configuration
const multiStreamServer = new RedisStreamsServer({
  streams: [
    { name: 'user-events' },
    { name: 'order-events' },
    { name: 'notification-events' }
  ],
  group: 'main-service-group', // Single consumer group for all streams
  consumer: 'consumer-1', // Single consumer ID for all streams
  blockTimeout: 10000, // Wait 10 seconds for new messages
  batchSize: 5, // Process up to 5 messages at once from any stream
  redisConfig: {
    url: 'redis://localhost:6379',
    password: 'your-password',
  },
});

multiStreamServer.listen(() => {
  console.log('Redis Streams server started - consuming from multiple streams');
});
```

**Important Notes:**
- All streams share the same consumer group and consumer ID
- Consumer groups are automatically created for each stream during startup
- Single `XREADGROUP` call efficiently polls all streams simultaneously
- Messages from any stream can be processed in any order based on arrival

---

## API Reference

### RedisStreamsModule

- `forRoot(config)`: Configure Redis connection. Accepts either:
  - A string URL: `'redis://localhost:6379'`
  - A configuration object with validation:
    ```typescript
    {
      url: string; // Redis URL (required)
      host?: string; // Redis host (optional)
      port?: number; // Redis port 1-65535 (optional)
      password?: string; // Redis password (optional)
      username?: string; // Redis username (optional)
      database?: number; // Redis database 0-15 (optional)
      connectTimeout?: number; // Connection timeout ≥1000ms (default: 10000)
      commandTimeout?: number; // Command timeout ≥1000ms (default: 5000)
    }
    ```

- `register(options)`: Register a stream for publishing/consuming:
  ```typescript
  {
    streamId?: string; // Stream name (default: 'mystream')
  }
  ```

### RedisStreamsClient

- `sendPayload(pattern, { schema, data })`: Publishes a validated payload to the stream.

### RedisStreamsServer

- `constructor(config)`: Create server with **required** configuration for multiple streams:
  ```typescript
  {
    streams: Array<{ name: string }>; // Required: Array of stream names to consume from (min 1)
    group?: string; // Consumer group name (default: 'nestjs_group')
    consumer?: string; // Consumer name (default: 'consumer-1')
    blockTimeout?: number; // Block timeout ≥0ms (default: 5000)
    batchSize?: number; // Batch size ≥1 (default: 1)
    redisConfig?: RedisConfig; // Redis connection config (optional)
  }
  ```
- `listen(callback)`: Starts consuming events from all configured streams using a single consumer group and consumer

**Architecture Details:**
- **Single Consumer Group**: All streams use the same consumer group name
- **Single Consumer ID**: All streams use the same consumer identifier
- **Efficient Polling**: One `XREADGROUP` call polls all streams simultaneously
- **Auto Group Creation**: Consumer groups are created automatically for each stream during startup
- **Per-Stream Acknowledgment**: Messages are acknowledged individually per stream

### Configuration Errors

All configuration errors throw `RedisConfigurationError` with detailed messages:
- Field name that failed validation
- Expected format/constraints
- Actual value received
- Zod validation details

### BaseClient

- Handles connection, shutdown, and exposes the raw Redis client.

### Decorators

- `InjectRedisStreamClient()`: Injects the stream client.

### Interfaces

- `IRedisStreamEventsClient`: Ensures type-safe publishing.

---

## Best Practices

- **Multi-Stream Design**: Group related streams under a single consumer when they need coordinated processing
- **Stream Naming**: Use descriptive, consistent naming conventions (e.g., `user-events`, `order-events`)
- **Consumer Groups**: Choose meaningful group names that reflect the consuming service purpose
- **Error Handling**: Handle `RedisConfigurationError` for clear debugging of configuration issues
- **Environment Variables**: Use environment variables for sensitive config like passwords and URLs
- **Schema Validation**: Always validate payloads with Zod schemas for type safety and runtime validation
- **Timeouts**: Set appropriate `blockTimeout` and `connectTimeout` based on your network conditions
- **Batch Size**: Tune `batchSize` based on message volume and processing capacity
- **Monitoring**: Monitor Redis connection health and stream lag in production
- **Graceful Shutdown**: The server handles graceful shutdown automatically via `OnApplicationShutdown`

---

**Summary:**  
This library enables robust, type-safe event streaming with Redis in NestJS, supporting both publishing and consuming from multiple streams with a unified consumer approach. The multi-stream architecture allows efficient processing of related event streams using a single consumer group and optimized Redis operations.
