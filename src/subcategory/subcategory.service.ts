import { Injectable } from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { SubcategoryRepository } from './repositories/subcategory.repository';

@Injectable()
export class SubcategoryService {
  constructor(private readonly repository: SubcategoryRepository) {}

  create(dto: CreateSubcategoryDto, userId: string) {
    return this.repository.create(dto, userId);
  }

  findAll(userId: string) {
    return this.repository.findAllByUser(userId);
  }

  findOne(id: string, userId: string) {
    return this.repository.findOneById(id, userId);
  }

  update(id: string, dto: UpdateSubcategoryDto, userId: string) {
    return this.repository.update(id, dto, userId);
  }

  remove(id: string, userId: string) {
    return this.repository.softDelete(id, userId);
  }
}
