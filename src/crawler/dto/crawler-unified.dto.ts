import { ApiProperty } from '@nestjs/swagger';
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

export class CrawlerUnifiedDto {
  // Propriedades do CrawlerCreateDto
  @ApiProperty({ example: 'hdbpzsTeYvYgP0YZ' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ example: 'DF97PDxGSUtAHXDL' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'yRGcHtWLuMSmqaeY' })
  @IsString()
  @IsNotEmpty()
  subcategoryId: string;

  @ApiProperty({ example: 'gud1o548W6SACCaA' })
  @IsString()
  @IsNotEmpty()
  transactionTypeId: string;

  @ApiProperty({ example: '', required: false })
  @IsString()
  @IsOptional()
  urlNfe?: string;

  // Propriedades do CrawlerGetNfeDataDto
  @ApiProperty({ example: 'Loja Exemplo' })
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @ApiProperty({ example: 'Rua das Flores, 123', required: false })
  @IsString()
  @IsOptional()
  storeAddress?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @IsString()
  @IsNotEmpty()
  @Type(() => Date)
  dateTicket?: Date | null;

  @ApiProperty({ example: '10:30' })
  @IsString()
  @IsNotEmpty()
  timeTicket?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: '12.345.678/0001-90' })
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @ApiProperty({ example: 'Lista de itens da compra' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemListDto)
  nfeItems: ItemListDto[];
}
