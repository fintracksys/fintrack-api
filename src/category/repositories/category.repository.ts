import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto, userId: string) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.category.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneById(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, userId: string) {
    await this.findOneById(id, userId);

    return this.prisma.category.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async softDelete(id: string, userId: string) {
    await this.findOneById(id, userId);

    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
