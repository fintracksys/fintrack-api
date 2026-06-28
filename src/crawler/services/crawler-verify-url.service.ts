import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  assertSupportedNfceHost,
  getNfceRequestHeaders,
  MIN_NFCE_HTML_LENGTH,
} from '../config/supported-nfce-hosts.config';

@Injectable()
export class CrawlerVerifyUrlService {
  async executeAsync(url: string): Promise<boolean> {
    assertSupportedNfceHost(url);

    const headers = getNfceRequestHeaders();
    const requestConfig = {
      timeout: 10000,
      headers,
      maxRedirects: 5,
    };

    try {
      const headResponse = await axios.head(url, requestConfig);
      if (headResponse.status !== 200) {
        return false;
      }

      const contentLength = parseInt(
        headResponse.headers['content-length'] || '0',
        10,
      );
      if (contentLength >= MIN_NFCE_HTML_LENGTH) {
        return true;
      }
    } catch {
      // PR and other portals may omit Content-Length on HEAD; fall back to GET.
    }

    const getResponse = await axios.get<string>(url, {
      ...requestConfig,
      responseType: 'text',
    });

    if (getResponse.status !== 200) {
      return false;
    }

    return (getResponse.data?.length ?? 0) >= MIN_NFCE_HTML_LENGTH;
  }
}
