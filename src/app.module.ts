import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { TransactionTypeModule } from './transaction_type/transaction-type.module';
import { CategoryModule } from './category/category.module';
import { SubcategoryModule } from './subcategory/subcategory.module';
import { TransactionModule } from './transaction/transaction.module';
import { TicketModule } from './ticket/ticket.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CrawlerModule } from './crawler/crawler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    AccountModule,
    TransactionTypeModule,
    CategoryModule,
    SubcategoryModule,
    TransactionModule,
    TicketModule,
    CrawlerModule,
  ],
})
export class AppModule {}
