import { Module, DynamicModule, Logger } from '@nestjs/common';
import { BaseClient } from './base.client';
import { RedisStreamsClient } from './redis-stream.client';
import { REDIS_BASE_CLIENT, REDIS_STREAMS_CLIENT } from './constants';
import {
  RedisConfig,
  RedisStreamRegistration,
  RedisStreamRegistrationSchema,
  RedisConfigurationError,
} from './schemas';

@Module({})
export class RedisStreamsModule {
  private readonly logger = new Logger(RedisStreamsModule.name);

  static forRoot(options: string | Partial<RedisConfig>): DynamicModule {
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
          useFactory: async (opts: string | Partial<RedisConfig>) => {
            const client = new BaseClient(opts);
            await client.connect();
            return client;
          },
          inject: ['REDIS_OPTIONS'],
        },
      ],
      exports: [REDIS_BASE_CLIENT],
    };
  }

  static register(options: Partial<RedisStreamRegistration>): DynamicModule {
    return {
      module: RedisStreamsModule,
      providers: [
        {
          provide: REDIS_STREAMS_CLIENT,
          useFactory: (baseClient: BaseClient) => {
            const validatedOptionsResult =
              RedisStreamRegistrationSchema.safeParse(options);
            if (!validatedOptionsResult.success) {
              throw RedisConfigurationError.fromZodError(
                validatedOptionsResult.error,
              );
            }
            return new RedisStreamsClient(
              baseClient.client,
              validatedOptionsResult.data.streamId,
            );
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
