import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateAccountDto } from '@/account/dto/create-account.dto';
import { UpdateAccountDto } from '@/account/dto/update-account.dto';

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAccountDto, userId: string) {
    return this.prisma.account.create({
      data: {
        name: dto.name,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.account.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneById(id: string, userId: string) {
    const account = await this.prisma.account.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    return account;
  }

  async update(id: string, dto: UpdateAccountDto, userId: string) {
    await this.findOneById(id, userId); // garante que pertence ao usuário

    return this.prisma.account.update({
      where: { id },
      data: {
        name: dto.name,
      },
    });
  }

  async softDelete(id: string, userId: string) {
    await this.findOneById(id, userId); // garante que pertence ao usuário

    return this.prisma.account.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
