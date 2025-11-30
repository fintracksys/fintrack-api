import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CrawlerCreateTicketDto } from '../dto/crawler-create-ticket.dto';

@Injectable()
export class CrawlerTicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CrawlerCreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        codProduct: dto.codProduct,
        nameProduct: dto.nameProduct,
        quantity: dto.quantity,
        measure: dto.measure || '',
        price: dto.price,
        totalValue: dto.totalValue,
        transactionId: dto.transactionId,
      },
    });
  }

  async createMany(tickets: CrawlerCreateTicketDto[]) {
    return this.prisma.ticket.createMany({
      data: tickets.map((ticket) => ({
        codProduct: ticket.codProduct,
        nameProduct: ticket.nameProduct,
        quantity: ticket.quantity,
        measure: ticket.measure || '',
        price: ticket.price,
        totalValue: ticket.totalValue,
        transactionId: ticket.transactionId,
      })),
    });
  }

  async findByTransactionId(transactionId: string) {
    return this.prisma.ticket.findMany({
      where: {
        transactionId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.ticket.findMany({
      where: {
        transaction: {
          userId,
        },
        deletedAt: null,
      },
      include: {
        transaction: {
          select: {
            id: true,
            storeName: true,
            dateTicket: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: {
        transaction: true,
      },
    });
  }
}
