import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import * as cheerio from 'cheerio';
import { CrawlerGetNfeDataDto } from '../dto';
import { getPaymentMethodFromText } from '../enums/payment-method.enum';
import { formatAddress, formatCnpj } from '../utils';
import { extractDateTimeFromElement } from '../utils/date-time-extractor.util';
import {
  cleanCodProduct,
  cleanMeasure,
  cleanPrice,
  cleanQuantity,
} from '../utils/field-cleaner.util';

@Injectable()
export class CrawlerGetUrlDataService {
  async executeAsync(url: string): Promise<CrawlerGetNfeDataDto> {
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    const storeName = $('#u20').text();

    const cnpj = $('#conteudo > div:nth-child(2) > div:nth-child(2)').text();

    const storeAddress = $(
      '#conteudo > div:nth-child(2) > div:nth-child(3)',
    ).text();

    const paymentMethodText = $('#linhaTotal label').text().trim();
    const paymentMethod = getPaymentMethodFromText(paymentMethodText);
    const { dateTicket, timeTicket } = extractDateTimeFromElement($);

    const items = $('[id^="Item"]');
    const itemList: {
      nameProduct: string;
      codProduct: string;
      quantity: Decimal;
      measure: string;
      price: Decimal;
      totalValue: Decimal;
    }[] = [];

    items.each((index, element) => {
      const itemId = $(element).attr('id');

      const spans = $(element).find('td:first-child span');
      const nameProduct = spans.eq(0).text().trim();
      const codProductRaw = spans.eq(1).text().trim();
      const quantityRaw = spans.eq(2).text().trim();
      const measureRaw = spans.eq(3).text().trim();
      const priceRaw = spans.eq(4).text().trim();
      const totalValueRaw = $(element)
        .find('td:nth-child(2) span')
        .text()
        .trim();

      const codProduct = cleanCodProduct(codProductRaw);
      const quantity = cleanQuantity(quantityRaw);
      const measure = cleanMeasure(measureRaw);
      const price = cleanPrice(priceRaw);
      const totalValue = cleanPrice(totalValueRaw);

      if (spans.length > 0 && itemId) {
        itemList.push({
          nameProduct,
          codProduct,
          quantity: new Decimal(quantity),
          measure,
          price: new Decimal(price),
          totalValue: new Decimal(totalValue),
        });
      }
    });
    return {
      storeName: storeName.trim(),
      storeAddress: formatAddress(storeAddress),
      dateTicket: dateTicket ? new Date(dateTicket) : null,
      timeTicket,
      paymentMethod,
      cnpj: formatCnpj(cnpj),
      url,
      items: itemList,
    } as CrawlerGetNfeDataDto;
  }
}
