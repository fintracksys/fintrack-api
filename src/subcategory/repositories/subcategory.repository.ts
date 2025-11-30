import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSubcategoryDto } from '../dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from '../dto/update-subcategory.dto';

@Injectable()
export class SubcategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubcategoryDto, userId: string) {
    return this.prisma.subcategory.create({
      data: {
        name: dto.name,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.subcategory.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneById(id: string, userId: string) {
    const subcategory = await this.prisma.subcategory.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!subcategory) {
      throw new NotFoundException('Subcategoria não encontrada');
    }

    return subcategory;
  }

  async update(id: string, dto: UpdateSubcategoryDto, userId: string) {
    await this.findOneById(id, userId);

    return this.prisma.subcategory.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async softDelete(id: string, userId: string) {
    await this.findOneById(id, userId);

    return this.prisma.subcategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
