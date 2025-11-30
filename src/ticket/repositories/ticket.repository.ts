import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';

@Injectable()
export class TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTicketDto, userId: string) {
    return this.prisma.ticket.create({
      data: {
        codProduct: dto.codProduct,
        nameProduct: dto.nameProduct,
        quantity: dto.quantity,
        measure: dto.measure,
        price: dto.price,
        totalValue: dto.totalValue,
        transactionId: dto.transactionId,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.ticket.findMany({
      where: {
        transaction: {
          userId,
        },
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneById(id: string, userId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id,
        transaction: {
          userId,
        },
        deletedAt: null,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, userId: string) {
    await this.findOneById(id, userId);

    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...dto,
        codProduct: dto.codProduct ?? undefined,
        nameProduct: dto.nameProduct,
        quantity: dto.quantity,
        measure: dto.measure,
        price: dto.price,
        totalValue: dto.totalValue,
        transactionId: dto.transactionId,
      },
    });
  }

  async softDelete(id: string, userId: string) {
    await this.findOneById(id, userId);

    return this.prisma.ticket.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
