import { OnApplicationShutdown, Logger } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';

export class BaseClient implements OnApplicationShutdown {
  private logger = new Logger(BaseClient.name);
  async onApplicationShutdown(signal?: string) {
    // optional: log the shutdown signal
    this.logger.debug?.(`Shutting down due to ${signal}`);
    // await new Promise((r) => setTimeout(r, 8000)); // wait a bit to let other things finish
    await this.client.quit();
  }

  private internalClient: RedisClientType;

  constructor(private readonly url: string) {
    this.internalClient = createClient({
      url: this.url,
    });
  }

  async connect() {
    await this.client.connect();
  }

  async close() {
    await this.client.quit();
  }

  get client(): RedisClientType {
    return this.internalClient;
  }
}
