import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CrawlerCreateDto {
  @ApiProperty({ example: 'hdbpzsTeYvYgP0YZ' })
  @IsString()
  accountId: string;

  @ApiProperty({ example: 'DF97PDxGSUtAHXDL' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 'yRGcHtWLuMSmqaeY' })
  @IsString()
  subcategoryId: string;

  @ApiProperty({ example: 'gud1o548W6SACCaA' })
  @IsString()
  transactionTypeId: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  url: string;
}
