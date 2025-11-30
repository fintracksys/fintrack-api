import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTransactionTypeDto {
  @ApiProperty({
    example: 'Nova Categoria',
    description: 'Novo nome do tipo de transação',
  })
  @IsString()
  name: string;
}
