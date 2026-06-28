import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { getNfceRequestHeaders } from '../config/supported-nfce-hosts.config';
import { CrawlerGetNfeDataDto } from '../dto';
import { parseNfceNationalLayout } from '../parsers/parse-nfce-national-layout.util';

@Injectable()
export class CrawlerGetUrlDataService {
  async executeAsync(url: string): Promise<CrawlerGetNfeDataDto> {
    const response = await axios.get<string>(url, {
      timeout: 10000,
      headers: getNfceRequestHeaders(),
      maxRedirects: 5,
      responseType: 'text',
    });

    return parseNfceNationalLayout(response.data, url);
  }
}
