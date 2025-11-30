import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CrawlerVerifyUrlService {
  async executeAsync(url: string): Promise<boolean> {
    const response = await axios.head(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    const contentLength = parseInt(response.headers['content-length'] || '0');

    if (contentLength < 5000) {
      return false;
    }

    return true;
  }
}
