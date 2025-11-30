import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ example: 'Supermercado XYZ' })
  @IsString()
  storeName: string;

  @ApiProperty({ example: 'Rua das Flores, 123', required: false })
  @IsOptional()
  @IsString()
  storeAddress?: string;

  @ApiProperty({ example: '2025-07-01T15:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dateTicket?: string;

  @ApiProperty({ example: '2025-07-01T15:30:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  timeTicket?: string;

  @ApiProperty({
    example: 'https://nfe.fazenda.gov.br/nota/123',
    required: false,
  })
  @IsOptional()
  @IsString()
  urlNfe?: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CREDIT_CARD })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: '12.345.678/0001-90' })
  @IsString()
  cnpj: string;

  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsString()
  subcategoryId: string;

  @ApiProperty()
  @IsString()
  transactionTypeId: string;
}
