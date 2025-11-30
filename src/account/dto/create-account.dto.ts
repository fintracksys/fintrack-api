import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({
    example: 'Conta Corrente Nubank',
    description: 'Nome da conta que será vinculada ao usuário logado.',
  })
  @IsString()
  name: string;
}
