/**
 * Formata uma string de CNPJ removendo caracteres de formatação indesejados
 * como tabs (\t), quebras de linha (\n) e outros caracteres especiais.
 *
 * @param cnpj - String do CNPJ com possíveis caracteres de formatação
 * @returns String do CNPJ formatada e limpa (apenas números)
 */
export function formatCnpj(cnpj: string): string {
  if (!cnpj) {
    return '';
  }

  return cnpj
    .split(/[\t\n]+/) // Divide por tabs e quebras de linha
    .map((part) => part.trim()) // Remove espaços de cada parte
    .filter((part) => part && part !== ',' && part !== '.') // Remove partes vazias, vírgulas e pontos isolados
    .join('') // Junta sem separadores
    .replace(/[^0-9]/g, '') // Remove todos os caracteres que não são números
    .trim(); // Remove espaços no início e fim
}
