import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

export class CrawlerCreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsString()
  @IsOptional()
  storeAddress?: string;

  @IsDateString()
  @IsOptional()
  dateTicket?: string;

  @IsDateString()
  @IsOptional()
  timeTicket?: string;

  @IsString()
  @IsOptional()
  urlNfe?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  subcategoryId: string;

  @IsString()
  @IsNotEmpty()
  transactionTypeId: string;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsString()
  @IsNotEmpty()
  cnpj: string;
}
