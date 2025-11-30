export enum PaymentMethod {
  DEBIT_CARD = 'DEBIT_CARD',
  CREDIT_CARD = 'CREDIT_CARD',
  VOUCHER_CARD = 'VOUCHER_CARD',
}

export function getPaymentMethodFromText(text: string): PaymentMethod | null {
  const normalizedText = text.toLowerCase().trim();

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

  return null;
}
