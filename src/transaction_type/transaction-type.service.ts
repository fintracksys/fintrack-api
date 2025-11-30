import { Injectable } from '@nestjs/common';
import { CreateTransactionTypeDto } from './dto/create-transaction-type.dto';
import { UpdateTransactionTypeDto } from './dto/update-transaction-type.dto';
import { TransactionTypeRepository } from './repositories/transaction-type.repository';

@Injectable()
export class TransactionTypeService {
  constructor(private readonly repository: TransactionTypeRepository) {}

  create(dto: CreateTransactionTypeDto, userId: string) {
    return this.repository.create(dto, userId);
  }

  findAll(userId: string) {
    return this.repository.findAllByUser(userId);
  }

  findOne(id: string, userId: string) {
    return this.repository.findOneById(id, userId);
  }

  update(id: string, dto: UpdateTransactionTypeDto, userId: string) {
    return this.repository.update(id, dto, userId);
  }

  remove(id: string, userId: string) {
    return this.repository.softDelete(id, userId);
  }
}
