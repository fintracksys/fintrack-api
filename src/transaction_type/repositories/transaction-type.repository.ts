import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTransactionTypeDto } from '../dto/create-transaction-type.dto';
import { UpdateTransactionTypeDto } from '../dto/update-transaction-type.dto';

@Injectable()
export class TransactionTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionTypeDto, userId: string) {
    return this.prisma.transactionType.create({
      data: {
        name: dto.name,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.transactionType.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneById(id: string, userId: string) {
    const type = await this.prisma.transactionType.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!type) {
      throw new NotFoundException('Tipo de transação não encontrado');
    }

    return type;
  }

  async update(id: string, dto: UpdateTransactionTypeDto, userId: string) {
    await this.findOneById(id, userId);

    return this.prisma.transactionType.update({
      where: { id },
      data: {
        name: dto.name,
      },
    });
  }

  async softDelete(id: string, userId: string) {
    await this.findOneById(id, userId);

    return this.prisma.transactionType.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
