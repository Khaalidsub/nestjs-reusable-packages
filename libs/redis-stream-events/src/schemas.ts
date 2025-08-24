import { z } from 'zod';

// Redis connection configuration schema
export const RedisConfigSchema = z.object({
  url: z
    .url('Redis URL must be a valid URL (e.g., redis://localhost:6379)')
    .default('redis://localhost:6379'),
  host: z.string().min(1, 'Redis host cannot be empty').optional(),
  port: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535, 'Redis port must be between 1 and 65535')
    .optional(),
  password: z.string().optional(),
  username: z.string().optional(),
  database: z.coerce
    .number()
    .int()
    .min(0)
    .max(15, 'Redis database must be between 0 and 15')
    .optional(),
  connectTimeout: z.coerce
    .number()
    .int()
    .min(1000, 'Connect timeout must be at least 1000ms')
    .default(10000),
  commandTimeout: z.coerce
    .number()
    .int()
    .min(1000, 'Command timeout must be at least 1000ms')
    .default(5000),
});

// Stream configuration for individual streams
export const StreamConfigSchema = z.object({
  name: z.string().min(1, 'Stream name cannot be empty'),
});

// Redis Stream server configuration schema
export const RedisStreamServerConfigSchema = z.object({
  // Array of streams to consume from
  streams: z
    .array(StreamConfigSchema)
    .min(1, 'At least one stream must be configured'),

  // Single consumer group for all streams
  group: z
    .string()
    .min(1, 'Consumer group name cannot be empty')
    .default('nestjs_group'),

  // Single consumer name for all streams
  consumer: z
    .string()
    .min(1, 'Consumer name cannot be empty')
    .default('consumer-1'),

  blockTimeout: z.coerce
    .number()
    .int()
    .min(0, 'Block timeout must be non-negative')
    .default(5000),
  batchSize: z.coerce
    .number()
    .int()
    .min(1, 'Batch size must be at least 1')
    .default(1),
  redisConfig: RedisConfigSchema.optional(),
});

// Redis Stream registration schema
export const RedisStreamRegistrationSchema = z.object({
  streamId: z.string().min(1, 'Stream ID cannot be empty').default('mystream'),
});

export type RedisConfig = z.infer<typeof RedisConfigSchema>;
export type StreamConfig = z.infer<typeof StreamConfigSchema>;
export type RedisStreamServerConfig = z.infer<
  typeof RedisStreamServerConfigSchema
>;
export type RedisStreamRegistration = z.infer<
  typeof RedisStreamRegistrationSchema
>;

// Custom error class for configuration validation errors
export class RedisConfigurationError extends Error {
  constructor(
    public readonly field: string,
    public readonly value: unknown,
    public readonly expectedFormat: string,
    zodError?: z.ZodError,
  ) {
    const errorDetails =
      zodError?.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ') || '';

    super(
      `Redis configuration error for field "${field}": ${expectedFormat}. ` +
        `Received: ${JSON.stringify(value)}. ` +
        (errorDetails ? `Details: ${errorDetails}` : ''),
    );
    this.name = 'RedisConfigurationError';
  }

  static fromZodError(error: z.ZodError): RedisConfigurationError {
    const firstError = error.issues[0];
    return new RedisConfigurationError(
      firstError.path.join('.') || 'unknown',
      'received' in firstError ? firstError.received : 'unknown',
      firstError.message,
      error,
    );
  }
}
