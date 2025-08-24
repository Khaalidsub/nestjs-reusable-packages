import { Controller, Get } from '@nestjs/common';
import { ExamplesService } from './examples.service';
// import { RedisStreamsClient } from '@app/redis-stream-events/redis-stream.client';
import { EventPattern } from '@nestjs/microservices';
import { z } from 'zod';
import { InjectRedisStreamClient } from '@app/redis-stream-events';
import type { IRedisStreamEventsClient } from '@app/redis-stream-events/interfaces';

const schema = z.object({
  value: z.string(),
  userId: z.number(),
});

@Controller()
export class ExamplesController {
  private userId: number = 0;
  constructor(
    private readonly examplesService: ExamplesService,
    @InjectRedisStreamClient()
    private readonly redisStreamsClient: IRedisStreamEventsClient,
  ) {}

  @Get()
  getHello() {
    this.userId++;
    // this.redisStreamsClient.emit('user_created', {
    //   payload: { value: 'hello world', userId: this.userId },
    //   schema,
    // });
    return this.redisStreamsClient.sendPayload('user_created', {
      data: { value: 'hello world', userId: this.userId },
      schema,
    });
  }

  @EventPattern('user_created', {
    schema: schema,
  })
  handleUserCreatedEvent(data: any) {
    console.log('User created event received:', data);
  }
}
