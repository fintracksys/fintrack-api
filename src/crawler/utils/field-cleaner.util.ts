/**
 * Utilitários para limpeza de campos extraídos do crawler
 */

/**
 * Extrai apenas números do código do produto
 * @param codProduct - String contendo o código do produto
 * @returns String contendo apenas números
 */
export function cleanCodProduct(codProduct: string): string {
  if (!codProduct) return '';
  return codProduct.replace(/\D/g, '');
}

/**
 * Extrai apenas números da quantidade, mantendo casa decimal com ponto e zeros à esquerda
 * @param quantity - String contendo a quantidade
 * @returns String formatada com números, ponto decimal e zeros à esquerda
 */
export function cleanQuantity(quantity: string): string {
  if (!quantity) return '';

  // Remove tudo exceto números, vírgula e ponto
  let numbersOnly = quantity.replace(/[^\d,\.]/g, '');

  // Substitui vírgula por ponto para padronizar decimal
  numbersOnly = numbersOnly.replace(',', '.');

  // Remove pontos extras no início
  numbersOnly = numbersOnly.replace(/^\.+/, '');

  return numbersOnly;
}

/**
 * Extrai apenas o que vem depois de "UN:"
 * @param measure - String contendo a unidade de medida
 * @returns String com a unidade limpa
 */
export function cleanMeasure(measure: string): string {
  if (!measure) return '';

  const unIndex = measure.indexOf('UN:');
  if (unIndex === -1) return measure.trim();

  return measure.substring(unIndex + 3).trim();
}

/**
 * Extrai apenas números do preço, mantendo casa decimal com ponto e zeros à esquerda
 * @param price - String contendo o preço
 * @returns String formatada com números, ponto decimal e zeros à esquerda
 */
export function cleanPrice(price: string): string {
  if (!price) return '';

  // Remove tudo exceto números, vírgula e ponto
  let numbersOnly = price.replace(/[^\d,\.]/g, '');

  // Substitui vírgula por ponto para padronizar decimal
  numbersOnly = numbersOnly.replace(',', '.');

  // Remove pontos extras no início
  numbersOnly = numbersOnly.replace(/^\.+/, '');

  return numbersOnly;
}
