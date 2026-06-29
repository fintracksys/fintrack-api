import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PaymentMethod as PrismaPaymentMethod } from '@prisma/client';
import { CrawlerCreateTransactionDto } from '../dto/crawler-create-transaction.dto';
import { PaymentMethod as CrawlerPaymentMethod } from '../enums/payment-method.enum';

@Injectable()
export class CrawlerTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private convertPaymentMethod(
    crawlerMethod: CrawlerPaymentMethod,
  ): PrismaPaymentMethod {
    switch (crawlerMethod) {
      case CrawlerPaymentMethod.DEBIT_CARD:
        return PrismaPaymentMethod.DEBIT_CARD;
      case CrawlerPaymentMethod.CREDIT_CARD:
        return PrismaPaymentMethod.CREDIT_CARD;
      case CrawlerPaymentMethod.PIX:
        return PrismaPaymentMethod.PIX;
      case CrawlerPaymentMethod.CASH:
        return PrismaPaymentMethod.CASH;
      case CrawlerPaymentMethod.BANK_TRANSFER:
        return PrismaPaymentMethod.BANK_TRANSFER;
      case CrawlerPaymentMethod.CHECK:
        return PrismaPaymentMethod.CHECK;
      case CrawlerPaymentMethod.VOUCHER_CARD:
        return PrismaPaymentMethod.OTHER;
      case CrawlerPaymentMethod.OTHER:
        return PrismaPaymentMethod.OTHER;
      default:
        return PrismaPaymentMethod.OTHER;
    }
  }

  async create(dto: CrawlerCreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        storeName: dto.storeName,
        storeAddress: dto.storeAddress || '',
        dateTicket: dto.dateTicket || new Date().toISOString(),
        timeTicket: dto.timeTicket || new Date().toISOString(),
        paymentMethod: this.convertPaymentMethod(dto.paymentMethod),
        cnpj: dto.cnpj,
        urlNfe: dto.urlNfe || '',
        userId: dto.userId,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId,
        transactionTypeId: dto.transactionTypeId,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        account: true,
        category: true,
        subcategory: true,
        transactionType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        account: true,
        category: true,
        subcategory: true,
        transactionType: true,
        tickets: true,
      },
    });
  }
}
