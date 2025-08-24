import { Module, DynamicModule, Logger } from '@nestjs/common';
import { BaseClient } from './base.client';
import { RedisStreamsClient } from './redis-stream.client';
import { REDIS_BASE_CLIENT, REDIS_STREAMS_CLIENT } from './constants';

@Module({})
export class RedisStreamsModule {
  private readonly logger = new Logger(RedisStreamsModule.name);

  static forRoot(options: { url: string }): DynamicModule {
    return {
      module: RedisStreamsModule,
      global: true,
      providers: [
        {
          provide: 'REDIS_OPTIONS',
          useValue: options,
        },
        {
          provide: REDIS_BASE_CLIENT,
          useFactory: async (opts: { url: string }) => {
            const client = new BaseClient(opts.url);
            await client.connect();
            return client;
          },
          inject: ['REDIS_OPTIONS'],
        },
      ],
      exports: [REDIS_BASE_CLIENT],
    };
  }

  static register(options: { streamId: string }): DynamicModule {
    return {
      module: RedisStreamsModule,
      providers: [
        {
          provide: REDIS_STREAMS_CLIENT,
          useFactory: (client: BaseClient) => {
            return new RedisStreamsClient(client.client, options.streamId);
          },
          inject: [REDIS_BASE_CLIENT],
        },
      ],
      exports: [
        {
          provide: REDIS_STREAMS_CLIENT,
          useExisting: REDIS_STREAMS_CLIENT,
        },
      ],
    };
  }
}
