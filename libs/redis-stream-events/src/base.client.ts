import { OnApplicationShutdown, Logger } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';
import {
  RedisConfig,
  RedisConfigSchema,
  RedisConfigurationError,
} from './schemas';

export class BaseClient implements OnApplicationShutdown {
  private logger = new Logger(BaseClient.name);
  private internalClient: RedisClientType;
  private config: RedisConfig;

  constructor(configInput: string | Partial<RedisConfig>) {
    // If string is provided, treat it as URL
    const inputConfig =
      typeof configInput === 'string' ? { url: configInput } : configInput;

    // Parse and validate configuration with defaults
    const configResult = RedisConfigSchema.safeParse(inputConfig);
    if (!configResult.success) {
      throw RedisConfigurationError.fromZodError(configResult.error);
    }
    this.config = configResult.data;

    this.internalClient = createClient({
      url: this.config.url,
      socket: {
        host: this.config.host,
        port: this.config.port,
        connectTimeout: this.config.connectTimeout,
      },
      password: this.config.password,
      username: this.config.username,
      database: this.config.database,
    });

    this.internalClient.on('error', (err) => {
      this.logger.error('Redis client error:', err);
    });

    this.internalClient.on('connect', () => {
      this.logger.debug?.('Connected to Redis');
    });

    this.internalClient.on('disconnect', () => {
      this.logger.debug?.('Disconnected from Redis');
    });
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.debug?.(`Shutting down due to ${signal}`);
    await this.client.quit();
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw new RedisConfigurationError(
        'connection',
        this.config.url,
        'Successful Redis connection',
      );
    }
  }

  async close() {
    await this.client.quit();
  }

  get client(): RedisClientType {
    return this.internalClient;
  }

  get configuration(): RedisConfig {
    return { ...this.config };
  }
}
