import { Injectable } from '@nestjs/common';

@Injectable()
export class ExamplesService {
  getHello(): string {
    return 'Hello World!';
  }
}
