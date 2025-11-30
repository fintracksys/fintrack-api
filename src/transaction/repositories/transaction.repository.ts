import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassifyTransactionDto } from '../dto/classify-transaction.dto';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto, userId: string) {
    return this.prisma.transaction.create({
      data: {
        storeName: dto.storeName,
        storeAddress: dto.storeAddress || '',
        dateTicket: dto.dateTicket || new Date().toISOString(),
        timeTicket: dto.timeTicket || new Date().toISOString(),
        paymentMethod: dto.paymentMethod,
        cnpj: dto.cnpj,
        urlNfe: dto.urlNfe || '',
        userId,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId,
        transactionTypeId: dto.transactionTypeId,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneById(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  async update(id: string, dto: UpdateTransactionDto, userId: string) {
    await this.findOneById(id, userId);

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...dto,
        dateTicket: dto.dateTicket || undefined,
        timeTicket: dto.timeTicket || undefined,
      },
    });
  }

  async softDelete(id: string, userId: string) {
    await this.findOneById(id, userId);

    return this.prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async classify(dto: ClassifyTransactionDto, userId: string) {
    // Verifica se a transação existe e pertence ao usuário
    await this.findOneById(dto.transactionId, userId);

    // Atualiza a transação com os dados de classificação
    return this.prisma.transaction.update({
      where: { id: dto.transactionId },
      data: {
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId,
        transactionTypeId: dto.transactionTypeId,
        urlNfe: dto.urlNfe,
      },
    });
  }
}
