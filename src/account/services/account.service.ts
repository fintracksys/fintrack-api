import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { AccountRepository } from '../repositories/account.repository';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  create(dto: CreateAccountDto, userId: string) {
    return this.accountRepository.create(dto, userId);
  }

  findAll(userId: string) {
    return this.accountRepository.findAllByUser(userId);
  }

  findOne(id: string, userId: string) {
    return this.accountRepository.findOneById(id, userId);
  }

  update(id: string, dto: UpdateAccountDto, userId: string) {
    return this.accountRepository.update(id, dto, userId);
  }

  remove(id: string, userId: string) {
    return this.accountRepository.softDelete(id, userId);
  }
}
