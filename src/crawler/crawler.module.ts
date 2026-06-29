import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { CrawlerController } from './crawler.controller';
import { ParseNfeFromImageService } from './receipt-gpt/parse-nfe-from-image.service';
import { ReceiptGptService } from './receipt-gpt/receipt-gpt.service';
import {
  CrawlerTicketRepository,
  CrawlerTransactionRepository,
} from './repositories';
import {
  CrawlerBackendCreateTicketService,
  CrawlerCreateTicketService,
  CrawlerGetUrlDataService,
  CrawlerValidateUrlService,
  CrawlerVerifyUrlService,
} from './services';

@Module({
  imports: [PrismaModule],
  controllers: [CrawlerController],
  providers: [
    CrawlerCreateTicketService,
    CrawlerBackendCreateTicketService,
    CrawlerValidateUrlService,
    CrawlerVerifyUrlService,
    CrawlerGetUrlDataService,
    ReceiptGptService,
    ParseNfeFromImageService,
    CrawlerTransactionRepository,
    CrawlerTicketRepository,
  ],
  exports: [
    CrawlerCreateTicketService,
    CrawlerBackendCreateTicketService,
    CrawlerValidateUrlService,
    CrawlerVerifyUrlService,
    CrawlerGetUrlDataService,
    ReceiptGptService,
    ParseNfeFromImageService,
    CrawlerTransactionRepository,
    CrawlerTicketRepository,
  ],
})
export class CrawlerModule {}
