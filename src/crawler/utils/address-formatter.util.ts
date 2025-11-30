/**
 * Formata uma string de endereço removendo caracteres de formatação indesejados
 * como tabs (\t) e quebras de linha (\n), organizando o endereço de forma legível.
 *
 * @param address - String do endereço com possíveis caracteres de formatação
 * @returns String do endereço formatada e limpa
 */
export function formatAddress(address: string): string {
  if (!address) {
    return '';
  }

  return address
    .split(/[\t\n]+/) // Divide por tabs e quebras de linha
    .map((part) => part.trim()) // Remove espaços de cada parte
    .filter((part) => part && part !== ',') // Remove partes vazias e vírgulas isoladas
    .join(', ') // Junta com vírgula e espaço
    .replace(/,\s*,/g, ',') // Limpa vírgulas duplas
    .trim(); // Remove espaços no início e fim
}
