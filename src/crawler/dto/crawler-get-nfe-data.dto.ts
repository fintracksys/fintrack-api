import { Decimal } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

class ItemListDto {
  @IsString()
  @IsNotEmpty()
  nameProduct: string;

  @IsString()
  @IsNotEmpty()
  codProduct: string;

  @IsString()
  @IsNotEmpty()
  quantity: Decimal;

  @IsString()
  @IsNotEmpty()
  measure: string;

  @IsString()
  @IsNotEmpty()
  price: Decimal;

  @IsString()
  @IsNotEmpty()
  totalValue: Decimal;
}

export class CrawlerGetNfeDataDto {
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsString()
  @IsOptional()
  storeAddress?: string;

  @IsString()
  @IsNotEmpty()
  @Type(() => Date)
  dateTicket?: Date | null;

  @IsString()
  @IsNotEmpty()
  timeTicket?: string;

  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemListDto)
  items: ItemListDto[];
}
