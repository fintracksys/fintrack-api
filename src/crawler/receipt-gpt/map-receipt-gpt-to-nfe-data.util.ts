import { Decimal } from '@prisma/client/runtime/library';

import { CrawlerGetNfeDataDto } from '../dto';
import {
  getPaymentMethodFromText,
  PaymentMethod,
} from '../enums/payment-method.enum';
import { formatAddress } from '../utils/address-formatter.util';
import { formatCnpj } from '../utils/cnpj-formatter.util';
import {
  cleanCodProduct,
  cleanPrice,
  cleanQuantity,
  normalizeMeasure,
} from '../utils/field-cleaner.util';
import { LOW_ITEM_CONFIDENCE_THRESHOLD } from './receipt-gpt.config';
import { ReceiptGptResponse } from './receipt-gpt.config';

export interface MapReceiptGptResult {
  data: CrawlerGetNfeDataDto;
  warnings: string[];
  confidenceGeral: number;
  lowConfidenceItemIndexes: number[];
}

function parseDateTicket(dateValue: string | null): Date | null {
  if (!dateValue) {
    return null;
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function resolvePaymentMethod(
  paymentMethodText: string | null,
): PaymentMethod {
  if (!paymentMethodText) {
    return PaymentMethod.OTHER;
  }

  const mapped = getPaymentMethodFromText(paymentMethodText);

  if (mapped) {
    return mapped;
  }

  const upper = paymentMethodText.toUpperCase().trim();
  const enumValues = Object.values(PaymentMethod) as string[];

  if (enumValues.includes(upper)) {
    return upper as PaymentMethod;
  }

  return PaymentMethod.OTHER;
}

function toDecimal(value: string | null, fallback = '0'): Decimal {
  return new Decimal(cleanPrice(value ?? '') || fallback);
}

function parseBrazilianAmount(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function buildWarnings(
  extraction: ReceiptGptResponse,
  lowConfidenceItemIndexes: number[],
): string[] {
  const warnings: string[] = [];

  if (extraction.confidence_geral < LOW_ITEM_CONFIDENCE_THRESHOLD) {
    warnings.push(
      'Confiança geral baixa na leitura da nota. Revise os dados antes de lançar.',
    );
  }

  if (lowConfidenceItemIndexes.length > 0) {
    warnings.push(
      `${lowConfidenceItemIndexes.length} item(ns) com confiança baixa. Revise antes de lançar.`,
    );
  }

  if (!extraction.cabecalho.loja) {
    warnings.push('Nome da loja não identificado.');
  }

  if (!extraction.cabecalho.cnpj) {
    warnings.push('CNPJ não identificado.');
  }

  if (extraction.itens.length === 0) {
    warnings.push('Nenhum item foi identificado na nota.');
  }

  if (extraction.total_itens !== extraction.itens.length) {
    warnings.push(
      `Total informado (${extraction.total_itens}) difere da quantidade de linhas (${extraction.itens.length}).`,
    );
  }

  const itemsSum = extraction.itens.reduce((sum, item) => {
    const value = parseBrazilianAmount(item.valor_total);
    return sum + (value ?? 0);
  }, 0);

  const receiptTotal = parseBrazilianAmount(extraction.valor_total_cupom);

  if (receiptTotal !== null && extraction.itens.length > 0) {
    const difference = Math.abs(itemsSum - receiptTotal);

    if (difference > 0.05) {
      warnings.push(
        'A soma dos itens difere do total do cupom. Revise os valores.',
      );
    }
  }

  return warnings;
}

export function mapReceiptGptToNfeData(
  extraction: ReceiptGptResponse,
): MapReceiptGptResult {
  const lowConfidenceItemIndexes = extraction.itens
    .map((item, index) => ({ index, confidence: item.confidence }))
    .filter((item) => item.confidence < LOW_ITEM_CONFIDENCE_THRESHOLD)
    .map((item) => item.index);

  const items = extraction.itens.map((item) => ({
    nameProduct: item.descricao?.trim() || 'Item sem descrição',
    codProduct: cleanCodProduct(item.codigo ?? ''),
    quantity: toDecimal(item.quantidade),
    measure: normalizeMeasure(item.unidade ?? '') || 'UN',
    price: toDecimal(item.valor_unitario),
    totalValue: toDecimal(item.valor_total),
  }));

  const data: CrawlerGetNfeDataDto = {
    storeName: extraction.cabecalho.loja?.trim() || 'Loja não identificada',
    storeAddress: extraction.cabecalho.endereco
      ? formatAddress(extraction.cabecalho.endereco.trim())
      : undefined,
    dateTicket: parseDateTicket(extraction.cabecalho.data),
    timeTicket: extraction.cabecalho.hora?.trim() || undefined,
    paymentMethod: resolvePaymentMethod(extraction.cabecalho.forma_pagamento),
    cnpj: formatCnpj(extraction.cabecalho.cnpj ?? ''),
    items,
  };

  return {
    data,
    warnings: buildWarnings(extraction, lowConfidenceItemIndexes),
    confidenceGeral: extraction.confidence_geral,
    lowConfidenceItemIndexes,
  };
}
