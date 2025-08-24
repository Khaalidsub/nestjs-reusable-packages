import { Inject } from '@nestjs/common';
import { REDIS_STREAMS_CLIENT } from './constants';

export const InjectRedisStreamClient = () => {
  return Inject(REDIS_STREAMS_CLIENT);
};
