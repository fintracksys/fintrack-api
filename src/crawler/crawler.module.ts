import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { CrawlerController } from './crawler.controller';
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
    CrawlerTransactionRepository,
    CrawlerTicketRepository,
  ],
  exports: [
    CrawlerCreateTicketService,
    CrawlerBackendCreateTicketService,
    CrawlerValidateUrlService,
    CrawlerVerifyUrlService,
    CrawlerGetUrlDataService,
    CrawlerTransactionRepository,
    CrawlerTicketRepository,
  ],
})
export class CrawlerModule {}
