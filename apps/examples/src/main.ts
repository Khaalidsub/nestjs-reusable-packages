import { NestFactory } from '@nestjs/core';
import { ExamplesModule } from './examples.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { RedisStreamsServer } from '@app/redis-stream-events';

async function bootstrap() {
  const app = await NestFactory.create(ExamplesModule);
  app.connectMicroservice<MicroserviceOptions>({
    // transport: Transport.TCP,
    strategy: new RedisStreamsServer({
      streams: [{ name: process.env.STREAM || 'mystream' }],
      group: process.env.GROUP,
      consumer: process.env.CONSUMER,
    }),
  });
  console.log('Starting application...');
  app.enableShutdownHooks();
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
