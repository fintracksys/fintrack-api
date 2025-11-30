import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubcategoryDto {
  @ApiProperty({ example: 'Aluguel', description: 'Nome da subcategoria' })
  @IsString()
  name: string;
}
