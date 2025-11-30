import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  create(dto: CreateCategoryDto, userId: string) {
    return this.repository.create(dto, userId);
  }

  findAll(userId: string) {
    return this.repository.findAllByUser(userId);
  }

  findOne(id: string, userId: string) {
    return this.repository.findOneById(id, userId);
  }

  update(id: string, dto: UpdateCategoryDto, userId: string) {
    return this.repository.update(id, dto, userId);
  }

  remove(id: string, userId: string) {
    return this.repository.softDelete(id, userId);
  }
}
