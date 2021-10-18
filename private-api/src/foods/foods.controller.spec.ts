import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { Food } from './entities/food.entity';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';

const mockRepository = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
}));

describe('FoodsController', () => {
  let controller: FoodsController;
  let service: FoodsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodsController],
      providers: [
        FoodsService,
        { provide: getRepositoryToken(Food), useClass: mockRepository },
      ],
    }).compile();

    controller = module.get<FoodsController>(FoodsController);
    service = module.get<FoodsService>(FoodsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a food', async () => {
    let createFoodDto: CreateFoodDto;
    let returnedFood: Food;
    jest.spyOn(service, 'create').mockImplementation(async () => returnedFood);
    expect(await controller.create(createFoodDto)).toBe(returnedFood);
  });

  it('should return an array of food from get all', async () => {
    let returnedFoods: Food[];
    jest
      .spyOn(service, 'findAll')
      .mockImplementation(async () => returnedFoods);

    expect(await controller.findAll('search', 1, 1)).toBe(returnedFoods);
  });

  it('should return a food for get one', async () => {
    let returnedFood: Food;
    jest.spyOn(service, 'findOne').mockImplementation(async () => {
      return returnedFood;
    });

    expect(await controller.findOne(1)).toBe(returnedFood);
  });

  it('should return a food after an update', async () => {
    let returnedFood: Food;
    let updateFoodDto: UpdateFoodDto;
    jest.spyOn(service, 'update').mockImplementation(async () => returnedFood);
    jest.spyOn(service, 'findOne').mockImplementation(async () => returnedFood);

    expect(await controller.update(1, updateFoodDto)).toBe(returnedFood);
  });

  it('should return a delete result after delete', async () => {
    let returnedFood: DeleteResult;
    jest.spyOn(service, 'remove').mockImplementation(async () => returnedFood);

    expect(await controller.remove(1)).toBe(returnedFood);
  });
});
