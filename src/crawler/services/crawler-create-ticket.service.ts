import { Injectable } from '@nestjs/common';
import {
  CrawlerCreateTicketDto,
  CrawlerCreateTransactionDto,
  CrawlerUnifiedDto,
} from '../dto';
import {
  CrawlerTicketRepository,
  CrawlerTransactionRepository,
} from '../repositories';
import { normalizeMeasure } from '../utils/field-cleaner.util';

@Injectable()
export class CrawlerCreateTicketService {
  constructor(
    private readonly crawlerTicketRepository: CrawlerTicketRepository,
    private readonly crawlerTransactionRepository: CrawlerTransactionRepository,
  ) {}

  async executeAsync(dto: CrawlerUnifiedDto, userId: string) {
    console.log('É irmao, ta chegando aqui');

    console.log('\n\nEm tese ta aqui os dados do front ==> \n', dto.cnpj);
    console.log('\n\nEm tese ta aqui os dados do front ==> \n', dto);

    const transactionDto = {
      storeName: dto.storeName,
      storeAddress: dto.storeAddress,
      dateTicket: dto.dateTicket
        ? typeof dto.dateTicket === 'string'
          ? new Date(dto.dateTicket).toISOString()
          : dto.dateTicket.toISOString()
        : undefined,
      timeTicket: dto.timeTicket || new Date().toISOString(),
      paymentMethod: dto.paymentMethod,
      cnpj: dto.cnpj,
      urlNfe: dto.urlNfe,
      userId,
      accountId: dto.accountId,
      categoryId: dto.categoryId,
      subcategoryId: dto.subcategoryId,
      transactionTypeId: dto.transactionTypeId,
    } as CrawlerCreateTransactionDto;

    const transaction =
      await this.crawlerTransactionRepository.create(transactionDto);

    // Criar os tickets
    const items = Array.isArray(dto.nfeItems) ? dto.nfeItems : [];
    const ticketsDto = items.map((item) => ({
      codProduct: item.codProduct,
      nameProduct: item.nameProduct,
      quantity: Number(item.quantity),
      measure: normalizeMeasure(item.measure ?? '') || 'UN',
      price: Number(item.price),
      totalValue: Number(item.totalValue),
      transactionId: transaction.id,
    })) as CrawlerCreateTicketDto[];

    if (ticketsDto.length > 0) {
      await this.crawlerTicketRepository.createMany(ticketsDto);
    }

    return {
      transaction,
      ticketsCount: ticketsDto.length,
      message: 'Transaction successfully created',
    };
    // return true;
  }
}
