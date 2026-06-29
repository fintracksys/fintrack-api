import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import {
  ALLOWED_RECEIPT_IMAGE_MIME_TYPES,
  MAX_RECEIPT_IMAGE_SIZE_BYTES,
  OPENAI_RECEIPT_MODEL,
  RECEIPT_GPT_JSON_SCHEMA,
  RECEIPT_GPT_SYSTEM_PROMPT,
  ReceiptGptResponse,
} from './receipt-gpt.config';

@Injectable()
export class ReceiptGptService {
  private readonly _logger = new Logger(ReceiptGptService.name);
  private readonly _client: OpenAI | null;

  constructor(private readonly _configService: ConfigService) {
    const apiKey = this._configService.get<string>('OPENAI_API_KEY');
    this._client = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async extractFromImageAsync(
    file: Express.Multer.File,
  ): Promise<ReceiptGptResponse> {
    this.assertValidImage(file);

    if (!this._client) {
      throw new ServiceUnavailableException(
        'OPENAI_API_KEY não configurada no servidor.',
      );
    }

    const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const response = await this._client.chat.completions.create({
      model: OPENAI_RECEIPT_MODEL,
      messages: [
        { role: 'system', content: RECEIPT_GPT_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extraia os itens deste cupom fiscal.',
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl, detail: 'high' },
            },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'receipt_items',
          strict: true,
          schema: RECEIPT_GPT_JSON_SCHEMA,
        },
      },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new ServiceUnavailableException(
        'OpenAI não retornou dados do cupom.',
      );
    }

    const parsed = JSON.parse(content) as ReceiptGptResponse;

    this._logger.log('GPT receipt response:\n' + JSON.stringify(parsed, null, 2));

    return parsed;
  }

  private assertValidImage(file: Express.Multer.File): void {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Arquivo de imagem é obrigatório.');
    }

    if (
      !ALLOWED_RECEIPT_IMAGE_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_RECEIPT_IMAGE_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException(
        'Formato inválido. Use JPEG, PNG ou WebP.',
      );
    }

    if (file.size > MAX_RECEIPT_IMAGE_SIZE_BYTES) {
      throw new BadRequestException('Imagem excede 10 MB.');
    }
  }
}
