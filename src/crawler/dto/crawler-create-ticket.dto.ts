import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CrawlerCreateTicketDto {
  @IsString()
  @IsNotEmpty()
  codProduct: string;

  @IsString()
  @IsNotEmpty()
  nameProduct: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  measure?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  totalValue: number;

  @IsString()
  @IsNotEmpty()
  transactionId: string;
}
