import { Injectable } from '@nestjs/common';
import { assertSupportedNfceHost } from '../config/supported-nfce-hosts.config';
import { CrawlerGetNfeDataDto } from '../dto';
import { CrawlerGetUrlDataService } from './crawler-get-url-data.service';
import { CrawlerVerifyUrlService } from './crawler-verify-url.service';

@Injectable()
export class CrawlerValidateUrlService {
  constructor(
    private crawlerVerifyUrlService: CrawlerVerifyUrlService,
    private crawlerGetUrlDataService: CrawlerGetUrlDataService,
  ) {}

  async executeAsync(url: string): Promise<CrawlerGetNfeDataDto> {
    assertSupportedNfceHost(url);

    const validUrl = await this.crawlerVerifyUrlService.executeAsync(url);

    if (!validUrl) {
      throw new Error('Invalid URL');
    }

    return this.crawlerGetUrlDataService.executeAsync(url);
  }
}
