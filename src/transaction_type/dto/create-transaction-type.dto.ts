import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionTypeDto {
  @ApiProperty({
    example: 'Receita',
    description: 'Tipo da transação (ex: Receita, Despesa, Transferência)',
  })
  @IsString()
  name: string;
}
