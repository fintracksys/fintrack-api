import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Transporte', description: 'Novo nome da categoria' })
  @IsString()
  name: string;
}
