import { z } from 'zod';
export interface IRedisStreamEventsClient {
  sendPayload<T>(
    pattern: string,
    payload: {
      schema: z.ZodSchema<T>;
      data: T;
    },
  ): Promise<void>;
}
