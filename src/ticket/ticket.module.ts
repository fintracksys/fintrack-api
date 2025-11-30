import { Module } from '@nestjs/common';
import { TicketService } from './services/ticket.service';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './repositories/ticket.repository';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository],
  exports: [TicketService],
})
export class TicketModule {}
