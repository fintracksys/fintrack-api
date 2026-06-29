import { Injectable } from '@nestjs/common';

import { ParseNfeImageResponseDto } from '../dto/parse-nfe-image-response.dto';
import { mapReceiptGptToNfeData } from './map-receipt-gpt-to-nfe-data.util';
import { ReceiptGptService } from './receipt-gpt.service';

@Injectable()
export class ParseNfeFromImageService {
  constructor(private readonly _receiptGptService: ReceiptGptService) {}

  async executeAsync(
    file: Express.Multer.File,
  ): Promise<ParseNfeImageResponseDto> {
    const extraction =
      await this._receiptGptService.extractFromImageAsync(file);

    const mapped = mapReceiptGptToNfeData(extraction);

    return {
      data: mapped.data,
      warnings: mapped.warnings,
      confidenceGeral: mapped.confidenceGeral,
      lowConfidenceItemIndexes: mapped.lowConfidenceItemIndexes,
    };
  }
}
