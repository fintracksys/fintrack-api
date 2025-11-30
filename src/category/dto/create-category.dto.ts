import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Moradia', description: 'Nome da categoria' })
  @IsString()
  name: string;
}
