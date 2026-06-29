import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CrawlerGetNfeDataDto } from './crawler-get-nfe-data.dto';

export class ParseNfeImageResponseDto {
  @ApiProperty({ type: () => CrawlerGetNfeDataDto })
  @ValidateNested()
  @Type(() => CrawlerGetNfeDataDto)
  data: CrawlerGetNfeDataDto;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  warnings?: string[];

  @ApiProperty({ example: 0.97 })
  @IsNumber()
  confidenceGeral: number;

  @ApiPropertyOptional({ type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  lowConfidenceItemIndexes?: number[];
}
