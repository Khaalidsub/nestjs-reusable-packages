import { Server, CustomTransportStrategy } from '@nestjs/microservices';
import { createClient, RedisClientType } from 'redis';
import { fromPromise } from 'neverthrow';
import { z } from 'zod';
import { OnApplicationShutdown } from '@nestjs/common';

const isZodSchema = (schema: unknown): schema is z.ZodSchema<unknown> => {
  return (
    typeof schema === 'object' &&
    schema !== null &&
    'parse' in schema &&
    typeof schema.parse === 'function'
  );
};

export class RedisStreamsServer
  extends Server
  implements CustomTransportStrategy, OnApplicationShutdown
{
  private isRunning = true;
  private client: RedisClientType;

  constructor(
    private stream = 'mystream',
    private group = 'nestjs_group',
    private consumer = 'consumer-1',
  ) {
    super();
    this.client = createClient({
      url: 'redis://localhost:6379',
    });
  }

  async listen(callback: () => void) {
    await this.client.connect();

    const result = await fromPromise(
      this.client.xGroupCreate(this.stream, this.group, '0', {
        MKSTREAM: true,
      }),
      (err) => {
        if (err instanceof Error) {
          //   console.error('Error creating group:', err);
          return err;
        }
        return new Error('Unknown error');
      },
    );

    if (result.isErr() && !result.error.message.includes('BUSYGROUP')) {
      // Handle error
      // console.error('Error creating group:', result.error);
      this.logger.error('Error creating group:', result.error);
      throw result.error;
    }

    // Poll loop
    void this.poll();

    callback();
  }

  async close() {
    await this.client.quit();
  }

  private async poll() {
    try {
      while (this.isRunning) {
        const res = await this.client.xReadGroup(
          this.group,
          this.consumer,
          [{ key: this.stream, id: '>' }],
          { BLOCK: 5000, COUNT: 1 },
        );

        this.logger.debug?.('Polled for new messages...');

        if (res) {
          this.logger.debug?.(JSON.stringify(res, null, 2));

          for (const stream of res) {
            for (const msg of stream.messages) {
              const pattern = msg.message.pattern;
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              const data = JSON.parse(msg.message.data);

              // Pass into NestJS message handlers
              await this.handleMessage(pattern, data);

              // Ack
              await this.client.xAck(this.stream, this.group, msg.id);
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('ClientClosedError')) {
        return;
      }
      // console.error('Polling error:', err);
    }
  }

  private async handleMessage(pattern: string, data: any) {
    // Implement your message handling logic here
    const messageHandler = this.messageHandlers.get(pattern);
    if (messageHandler) {
      const schema = isZodSchema(messageHandler.extras?.schema)
        ? messageHandler.extras?.schema
        : null;

      if (schema) {
        const parsedData = schema.parse(data);
        await messageHandler(parsedData);
      }
    }
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.debug?.(`Stopping poller due to ${signal}`);
    this.isRunning = false;
    // wait a tiny bit so the loop breaks before closing client
    await new Promise((r) => setTimeout(r, 6000));
    await this.client.quit();
  }

  on<
    EventKey extends string = string,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    EventCallback extends Function = Function,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  >(event: EventKey, callback: EventCallback) {
    throw new Error('Method not implemented.');
  }
  unwrap<T>(): T {
    throw new Error('Method not implemented.');
  }
}
