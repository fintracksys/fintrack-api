import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ALLOWED_RECEIPT_IMAGE_MIME_TYPES,
  MAX_RECEIPT_IMAGE_SIZE_BYTES,
  ReceiptGptResponse,
} from './receipt-gpt/receipt-gpt.config';
import { ParseNfeFromImageService } from './receipt-gpt/parse-nfe-from-image.service';
import { ReceiptGptService } from './receipt-gpt/receipt-gpt.service';
import {
  CrawlerGetNfeDataDto,
  CrawlerUnifiedDto,
  ParseNfeImageResponseDto,
} from './dto';
import { CrawlerCreateDto } from './dto/crawler-create.dto';
import {
  CrawlerBackendCreateTicketService,
  CrawlerCreateTicketService,
  CrawlerValidateUrlService,
} from './services';

function receiptImageFileFilter(
  _request: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  if (
    !ALLOWED_RECEIPT_IMAGE_MIME_TYPES.includes(
      file.mimetype as (typeof ALLOWED_RECEIPT_IMAGE_MIME_TYPES)[number],
    )
  ) {
    callback(
      new BadRequestException('Formato inválido. Use JPEG, PNG ou WebP.'),
      false,
    );
    return;
  }

  callback(null, true);
}

@ApiTags('Crawler')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('crawler')
export class CrawlerController {
  constructor(
    private crawlerBackendCreateTicketService: CrawlerBackendCreateTicketService,
    private crawlerValidateUrlService: CrawlerValidateUrlService,
    private crawlerCreateTicketService: CrawlerCreateTicketService,
    private receiptGptService: ReceiptGptService,
    private parseNfeFromImageService: ParseNfeFromImageService,
  ) {}

  @Post('backend-create-ticket')
  @ApiOperation({
    summary: 'Realizar lançamento de nota fiscal eletronica',
  })
  async backendCreateTicket(
    @Body() dto: CrawlerCreateDto,
    @Request() req: { user: { userId: string } },
  ): Promise<void> {
    await this.crawlerBackendCreateTicketService.executeAsync(
      dto,
      req.user.userId,
    );
  }

  @Patch('validate-nfe-url/:nfe_url')
  @ApiOperation({ summary: 'Validar URL da NFCe e extrair dados' })
  async validateNfeUrl(
    @Param('nfe_url') nfeUrl: string,
  ): Promise<CrawlerGetNfeDataDto> {
    return this.crawlerValidateUrlService.executeAsync(nfeUrl);
  }

  @Post('parse-nfe-image')
  @ApiOperation({
    summary: 'Extrair NFCe a partir de imagem para revisão e lançamento',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_RECEIPT_IMAGE_SIZE_BYTES },
      fileFilter: receiptImageFileFilter,
    }),
  )
  async parseNfeImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ParseNfeImageResponseDto> {
    return this.parseNfeFromImageService.executeAsync(file);
  }

  @Post('receipt-gpt')
  @ApiOperation({
    summary: 'Extrair itens do cupom via GPT (debug - JSON bruto)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_RECEIPT_IMAGE_SIZE_BYTES },
      fileFilter: receiptImageFileFilter,
    }),
  )
  async receiptGpt(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ReceiptGptResponse> {
    return this.receiptGptService.extractFromImageAsync(file);
  }

  @Post('create-ticket')
  async createTicket(
    @Body() dto: CrawlerUnifiedDto,
    @Request() req: { user: { userId: string } },
  ): Promise<void> {
    await this.crawlerCreateTicketService.executeAsync(dto, req.user.userId);
  }
}
