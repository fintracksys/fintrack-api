import { Module } from '@nestjs/common';
import { TransactionTypeService } from './services/transaction-type.service';
import { TransactionTypeRepository } from './repositories/transaction-type.repository';
import { TransactionTypeController } from './transaction-type.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionTypeController],
  providers: [TransactionTypeService, TransactionTypeRepository],
})
export class TransactionTypeModule {}
