import { Injectable } from '@nestjs/common';
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
    console.log('url', url);
    const validUrl = await this.crawlerVerifyUrlService.executeAsync(url);

    if (!validUrl) {
      throw new Error('Invalid URL');
    }

    const data = await this.crawlerGetUrlDataService.executeAsync(url);

    return data;
  }
}
