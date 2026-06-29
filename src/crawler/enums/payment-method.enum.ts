export enum PaymentMethod {
  DEBIT_CARD = 'DEBIT_CARD',
  CREDIT_CARD = 'CREDIT_CARD',
  VOUCHER_CARD = 'VOUCHER_CARD',
  PIX = 'PIX',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  OTHER = 'OTHER',
}

export function getPaymentMethodFromText(text: string): PaymentMethod | null {
  const normalizedText = text.toLowerCase().trim();

  if (normalizedText.includes('pix')) {
    return PaymentMethod.PIX;
  }

  if (normalizedText.includes('débito') || normalizedText.includes('debito')) {
    return PaymentMethod.DEBIT_CARD;
  }

  if (
    normalizedText.includes('crédito') ||
    normalizedText.includes('credito')
  ) {
    return PaymentMethod.CREDIT_CARD;
  }

  if (normalizedText.includes('voucher')) {
    return PaymentMethod.VOUCHER_CARD;
  }

  if (
    normalizedText.includes('dinheiro') ||
    normalizedText.includes('espécie') ||
    normalizedText.includes('especie')
  ) {
    return PaymentMethod.CASH;
  }

  if (
    normalizedText.includes('transferência') ||
    normalizedText.includes('transferencia')
  ) {
    return PaymentMethod.BANK_TRANSFER;
  }

  if (normalizedText.includes('cheque')) {
    return PaymentMethod.CHECK;
  }

  return null;
}
