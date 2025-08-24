import { Test, TestingModule } from '@nestjs/testing';
import { ExamplesController } from './examples.controller';
import { ExamplesService } from './examples.service';

describe('ExamplesController', () => {
  let examplesController: ExamplesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ExamplesController],
      providers: [ExamplesService],
    }).compile();

    examplesController = app.get<ExamplesController>(ExamplesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(examplesController.getHello()).toBe('Hello World!');
    });
  });
});
