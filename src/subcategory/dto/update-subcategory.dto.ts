import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubcategoryDto {
  @ApiProperty({
    example: 'Internet',
    description: 'Novo nome da subcategoria',
  })
  @IsString()
  name: string;
}
