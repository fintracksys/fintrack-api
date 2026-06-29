import { Decimal } from '@prisma/client/runtime/library';

import { PaymentMethod } from '../enums/payment-method.enum';
import { mapReceiptGptToNfeData } from './map-receipt-gpt-to-nfe-data.util';
import { ReceiptGptResponse } from './receipt-gpt.config';

describe('mapReceiptGptToNfeData', () => {
  it('should map gpt extraction to nfe data without url', () => {
    const extraction: ReceiptGptResponse = {
      cabecalho: {
        loja: 'Fort ATACADISTA',
        endereco: 'Rua Exemplo, 123',
        cnpj: '09.477.652/0066-31',
        data: '2026-06-28',
        hora: '14:29:10',
        forma_pagamento: 'PIX',
        confidence: 0.97,
      },
      itens: [
        {
          numero_do_item: '1',
          codigo: '218',
          descricao: 'CEBOLA KG',
          quantidade: '0,655',
          unidade: 'KG',
          valor_unitario: '6,98',
          valor_total: '4,57',
          confidence: 0.95,
        },
      ],
      total_itens: 1,
      valor_total_cupom: '4,57',
      confidence_geral: 0.97,
    };

    const result = mapReceiptGptToNfeData(extraction);

    expect(result.data.url).toBeUndefined();
    expect(result.data.storeName).toBe('Fort ATACADISTA');
    expect(result.data.paymentMethod).toBe(PaymentMethod.PIX);
    expect(result.data.items[0].quantity).toEqual(new Decimal('0.655'));
  });
});
