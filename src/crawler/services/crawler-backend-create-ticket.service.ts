import { Injectable } from '@nestjs/common';
import { CrawlerCreateTicketDto, CrawlerCreateTransactionDto } from '../dto';
import { CrawlerCreateDto } from '../dto/crawler-create.dto';
import {
  CrawlerTicketRepository,
  CrawlerTransactionRepository,
} from '../repositories';
import { normalizeMeasure } from '../utils/field-cleaner.util';
import { CrawlerGetUrlDataService } from './crawler-get-url-data.service';
import { CrawlerVerifyUrlService } from './crawler-verify-url.service';

@Injectable()
export class CrawlerBackendCreateTicketService {
  constructor(
    private crawlerValidateUrlService: CrawlerVerifyUrlService,
    private crawlerGetUrlDataService: CrawlerGetUrlDataService,
    private crawlerTransactionRepository: CrawlerTransactionRepository,
    private crawlerTicketRepository: CrawlerTicketRepository,
  ) {}
  async executeAsync(dto: CrawlerCreateDto, userId: string) {
    const validUrl = await this.crawlerValidateUrlService.executeAsync(dto.url);

    if (!validUrl) {
      throw new Error('Invalid URL');
    }

    const data = await this.crawlerGetUrlDataService.executeAsync(dto.url);

    // Criar a transação
    const transactionDto = {
      storeName: data.storeName,
      storeAddress: data.storeAddress,
      dateTicket: data.dateTicket ? data.dateTicket.toISOString() : undefined,
      timeTicket: data.timeTicket || new Date().toISOString(),
      paymentMethod: data.paymentMethod,
      cnpj: data.cnpj,
      urlNfe: data.url,
      userId,
      accountId: dto.accountId,
      categoryId: dto.categoryId,
      subcategoryId: dto.subcategoryId,
      transactionTypeId: dto.transactionTypeId,
    } as CrawlerCreateTransactionDto;

    const transaction =
      await this.crawlerTransactionRepository.create(transactionDto);

    // Criar os tickets
    const ticketsDto = data.items.map((item) => ({
      codProduct: item.codProduct,
      nameProduct: item.nameProduct,
      quantity: Number(item.quantity),
      measure: normalizeMeasure(String(item.measure ?? '')) || 'UN',
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
  }
}
