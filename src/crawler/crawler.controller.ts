import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CrawlerGetNfeDataDto, CrawlerUnifiedDto } from './dto';
import { CrawlerCreateDto } from './dto/crawler-create.dto';
import {
  CrawlerBackendCreateTicketService,
  CrawlerCreateTicketService,
  CrawlerValidateUrlService,
} from './services';

@ApiTags('Crawler')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('crawler')
export class CrawlerController {
  constructor(
    private crawlerBackendCreateTicketService: CrawlerBackendCreateTicketService,
    private crawlerValidateUrlService: CrawlerValidateUrlService,
    private crawlerCreateTicketService: CrawlerCreateTicketService,
  ) {}

  @Post('backend-create-ticket')
  @ApiOperation({
    summary: 'Realizar lançamento de nota fiscal eletronica',
    description: 'Realizar lançamento de nota fiscal eletronica',
  })
  async backendCreateTicket(
    @Body() dto: CrawlerCreateDto,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.userId;
    await this.crawlerBackendCreateTicketService.executeAsync(dto, userId);
  }

  @Patch('validate-nfe-url/:nfe_url')
  @ApiOperation({
    summary: 'Realizar lançamento de nota fiscal eletronica',
    description: 'Realizar lançamento de nota fiscal eletronica',
  })
  async validateNfeUrl(
    @Param('nfe_url') nfeUrl: string,
  ): Promise<CrawlerGetNfeDataDto> {
    return await this.crawlerValidateUrlService.executeAsync(nfeUrl);
  }

  @Post('create-ticket')
  async createTicket(
    @Body() dto: CrawlerUnifiedDto,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.userId;
    await this.crawlerCreateTicketService.executeAsync(dto, userId);
  }
}
