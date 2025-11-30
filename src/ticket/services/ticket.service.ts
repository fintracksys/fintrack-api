import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketRepository } from '../repositories/ticket.repository';

@Injectable()
export class TicketService {
  constructor(private readonly repository: TicketRepository) {}

  create(dto: CreateTicketDto, userId: string) {
    return this.repository.create(dto, userId);
  }

  findAll(userId: string) {
    return this.repository.findAllByUser(userId);
  }

  findOne(id: string, userId: string) {
    return this.repository.findOneById(id, userId);
  }

  update(id: string, dto: UpdateTicketDto, userId: string) {
    return this.repository.update(id, dto, userId);
  }

  remove(id: string, userId: string) {
    return this.repository.softDelete(id, userId);
  }
}
