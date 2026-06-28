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

type NfceItem = CrawlerGetNfeDataDto['items'][number];

function extractCnpjText($: cheerio.Root): string {
  const textDivs = $('#conteudo .txtCenter .text');
  let cnpjText = '';

  textDivs.each((_, element) => {
    const text = $(element).text();
    if (text.includes('CNPJ')) {
      cnpjText = text;
      return false;
    }
  });

  return cnpjText || textDivs.first().text();
}

function extractStoreAddress($: cheerio.Root): string {
  const textDivs = $('#conteudo .txtCenter .text');
  let address = '';
  let foundCnpj = false;

  textDivs.each((_, element) => {
    const text = $(element).text().trim();
    if (text.includes('CNPJ')) {
      foundCnpj = true;
      return;
    }
    if (foundCnpj && text) {
      address = text;
      return false;
    }
  });

  if (!address && textDivs.length >= 2) {
    address = textDivs.eq(1).text();
  }

  return address;
}

function extractItems($: cheerio.Root): NfceItem[] {
  const itemList: NfceItem[] = [];

  $('#tabResult tr').each((_, element) => {
    const spans = $(element).find('td:first-child span');
    if (spans.length === 0) {
      return;
    }

    const nameProduct = spans.eq(0).text().trim();
    const codProductRaw = spans.eq(1).text().trim();
    const quantityRaw = spans.eq(2).text().trim();
    const measureRaw = spans.eq(3).text().trim();
    const priceRaw = spans.eq(4).text().trim();
    const totalValueRaw = $(element)
      .find('td:nth-child(2) span.valor')
      .text()
      .trim();

    if (!nameProduct) {
      return;
    }

    itemList.push({
      nameProduct,
      codProduct: cleanCodProduct(codProductRaw),
      quantity: new Decimal(cleanQuantity(quantityRaw)),
      measure: cleanMeasure(measureRaw),
      price: new Decimal(cleanPrice(priceRaw)),
      totalValue: new Decimal(cleanPrice(totalValueRaw)),
    });
  });

  return itemList;
}

export function parseNfceNationalLayout(
  html: string,
  url: string,
): CrawlerGetNfeDataDto {
  const $ = cheerio.load(html);
  const storeName = $('#u20').text().trim();
  const cnpj = extractCnpjText($);
  const storeAddress = extractStoreAddress($);
  const paymentMethodText = $('#linhaTotal label.tx').first().text().trim();
  const paymentMethod = getPaymentMethodFromText(paymentMethodText);
  const { dateTicket, timeTicket } = extractDateTimeFromElement($);
  const items = extractItems($);

  return {
    storeName,
    storeAddress: formatAddress(storeAddress),
    dateTicket: dateTicket ? new Date(dateTicket) : null,
    timeTicket,
    paymentMethod,
    cnpj: formatCnpj(cnpj),
    url,
    items,
  } as CrawlerGetNfeDataDto;
}
