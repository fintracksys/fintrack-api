import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionRepository } from './repositories/transaction.repository';

@Injectable()
export class TransactionService {
  constructor(private readonly repository: TransactionRepository) {}

  create(dto: CreateTransactionDto, userId: string) {
    return this.repository.create(dto, userId);
  }

  findAll(userId: string) {
    return this.repository.findAllByUser(userId);
  }

  findOne(id: string, userId: string) {
    return this.repository.findOneById(id, userId);
  }

  update(id: string, dto: UpdateTransactionDto, userId: string) {
    return this.repository.update(id, dto, userId);
  }

  remove(id: string, userId: string) {
    return this.repository.softDelete(id, userId);
  }
}
