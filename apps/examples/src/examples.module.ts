import { Module } from '@nestjs/common';
import { ExamplesController } from './examples.controller';
import { ExamplesService } from './examples.service';
// import { RedisStreamsClient } from '@app/redis-stream-events/redis-stream.client';
import { RedisStreamsModule } from '@app/redis-stream-events';

@Module({
  imports: [
    RedisStreamsModule.forRoot({ url: 'redis://localhost:6379' }),
    RedisStreamsModule.register({ streamId: 'mystream' }),
  ],
  controllers: [ExamplesController],
  providers: [ExamplesService],
})
export class ExamplesModule {}
