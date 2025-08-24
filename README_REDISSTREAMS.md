
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

### 3. Consuming Events

Implement a custom server using `RedisStreamsServer` with configuration validation:

```typescript
import { RedisStreamsServer } from '@app/redis-stream-events';

// Basic configuration with defaults
const server = new RedisStreamsServer();

// Or with custom configuration
const server = new RedisStreamsServer({
  stream: 'user-events',
  group: 'user-service-group',
  consumer: 'consumer-1',
  blockTimeout: 10000, // Wait 10 seconds for new messages
  batchSize: 5, // Process up to 5 messages at once
  redisConfig: {
    url: 'redis://localhost:6379',
    password: 'your-password',
  },
});

server.listen(() => {
  console.log('Redis Streams server started successfully');
});
```

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

- `constructor(config?)`: Create server with optional configuration:
  ```typescript
  {
    stream?: string; // Stream name (default: 'mystream')
    group?: string; // Consumer group (default: 'nestjs_group')
    consumer?: string; // Consumer name (default: 'consumer-1')
    blockTimeout?: number; // Block timeout ≥0ms (default: 5000)
    batchSize?: number; // Batch size ≥1 (default: 1)
    redisConfig?: RedisConfig; // Redis connection config (optional)
  }
  ```
- `listen(callback)`: Starts consuming events from the stream with validation

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

- Use environment variables for sensitive config like passwords
- Validate all payloads with Zod schemas for type safety
- Handle `RedisConfigurationError` for clear debugging
- Set appropriate timeouts based on your network conditions
- Use meaningful stream, group, and consumer names
- Monitor Redis connection health in production

---

**Summary:**  
This library enables robust, type-safe event streaming with Redis in NestJS, supporting both publishing and consuming with easy configuration and dependency injection.
