import { RedisClientType } from 'redis';
import { z } from 'zod';
import { IRedisStreamEventsClient } from './interfaces';

export class RedisStreamsClient implements IRedisStreamEventsClient {
  constructor(
    private readonly client: RedisClientType,
    private readonly streamId: string = 'mystream',
  ) {}

  async sendPayload<T>(
    pattern: string,
    payload: {
      schema: z.ZodSchema<T>;
      data: T;
    },
  ): Promise<void> {
    const parsedResult = payload.schema.safeParse(payload.data);
    if (!parsedResult.success) {
      throw new Error('Invalid payload');
    }

    await this.client.xAdd(this.streamId, '*', {
      pattern,
      data: JSON.stringify(parsedResult.data),
    });
  }
}
