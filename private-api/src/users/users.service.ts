import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { MostConsumedNutrientDto } from './dto/most-consumed-nutrient';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.usersRepository.save(createUserDto);
  }

  findAll(skip = 0, take = 25) {
    return this.usersRepository.find({
      skip,
      take,
    });
  }

  findOne(id: number) {
    return this.usersRepository.findOneOrFail(id);
  }

  async topNutrient(id: number): Promise<MostConsumedNutrientDto> {
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.userFoods', 'uf')
      .innerJoinAndSelect('uf.food', 'f')
      .innerJoinAndSelect('f.foodNutrients', 'fn')
      .innerJoinAndSelect('fn.nutrient', 'n')
      .where('u.id = :id AND fn.amountPerServing > 0', { id })
      .orderBy('uf.servings_per_week * fn.amount_per_serving', 'DESC')
      .limit(1)
      .getOneOrFail();

    const [userFood] = result.userFoods;
    const [foodNutrient] = userFood.food.foodNutrients;
    const { nutrient } = foodNutrient;

    const retVal: MostConsumedNutrientDto = {
      id: nutrient.id,
      name: nutrient.name,
      unitName: nutrient.unitName,
      weeklyAmount: userFood.servingsPerWeek * foodNutrient.amountPerServing,
    };
    return retVal;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update({ id }, updateUserDto);
    return this.usersRepository.findOneOrFail(id);
  }

  remove(id: number) {
    return this.usersRepository.delete({ id });
  }
}
