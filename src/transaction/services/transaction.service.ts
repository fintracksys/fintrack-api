import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { ClassifyTransactionDto } from '../dto/classify-transaction.dto';
import { TransactionRepository } from '../repositories/transaction.repository';

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  create(dto: CreateTransactionDto, userId: string) {
    return this.transactionRepository.create(dto, userId);
  }

  findAll(userId: string) {
    return this.transactionRepository.findAllByUser(userId);
  }

  findOne(id: string, userId: string) {
    return this.transactionRepository.findOneById(id, userId);
  }

  update(id: string, dto: UpdateTransactionDto, userId: string) {
    return this.transactionRepository.update(id, dto, userId);
  }

  remove(id: string, userId: string) {
    return this.transactionRepository.softDelete(id, userId);
  }

  async executeAsync(dto: ClassifyTransactionDto, userId: string) {
    return await this.transactionRepository.classify(dto, userId);
  }
}
