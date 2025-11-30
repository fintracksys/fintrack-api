import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ example: 1234567890, required: false })
  @IsOptional()
  @IsString()
  codProduct?: string;

  @ApiProperty({ example: 'Arroz Tio João 1kg' })
  @IsString()
  nameProduct: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'kg' })
  @IsString()
  measure: string;

  @ApiProperty({ example: 9.99 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 24.98 })
  @IsNumber()
  totalValue: number;

  @ApiProperty()
  @IsString()
  transactionId: string;
}
