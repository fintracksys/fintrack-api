import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './services/account.service';
import { AccountRepository } from './repositories/account.repository';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository],
})
export class AccountModule {}
