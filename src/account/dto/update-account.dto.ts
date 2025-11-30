import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty({
    example: 'Conta Alterada XP',
    description: 'Novo nome da conta',
  })
  @IsString()
  name: string;
}
