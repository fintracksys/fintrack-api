export const MAX_RECEIPT_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_RECEIPT_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const OPENAI_RECEIPT_MODEL = 'gpt-4o';

export const LOW_ITEM_CONFIDENCE_THRESHOLD = 0.85;

export const RECEIPT_GPT_SYSTEM_PROMPT = `Você é um assistente especializado em extrair dados de cupons fiscais brasileiros (NFC-e/DANFE) a partir de imagem.

Objetivo:
- Ler o ticket/nota fiscal completo.
- Extrair cabeçalho da loja e todos os itens comprados.
- Não inventar nada.
- Não agrupar itens repetidos.
- Manter a ordem original do cupom.

Regras para ITENS:
1. Leia linha por linha.
2. Para cada item, extraia: numero_do_item, codigo, descricao, quantidade, unidade, valor_unitario, valor_total, confidence.
3. Se algum campo estiver ilegível, use null.
4. Se houver duplicados, mantenha cada linha separada.
5. Se houver dúvida, não chute: marque confidence baixa.
6. Preserve os valores exatamente como aparecem no cupom.

Regras para CABEÇALHO:
- Extraia: loja, endereco, cnpj, data, hora, forma_pagamento, confidence.
- forma_pagamento quando legível: PIX, DEBIT_CARD, CREDIT_CARD, VOUCHER_CARD, CASH, BANK_TRANSFER, CHECK, OTHER.
- data no formato YYYY-MM-DD quando possível.
- hora no formato HH:mm:ss quando possível.
- Campos ilegíveis: null.

Ao final retorne também: total_itens, valor_total_cupom, confidence_geral.
Responda somente JSON válido, sem explicações extras.`;

export const RECEIPT_GPT_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'cabecalho',
    'itens',
    'total_itens',
    'valor_total_cupom',
    'confidence_geral',
  ],
  properties: {
    cabecalho: {
      type: 'object',
      additionalProperties: false,
      required: [
        'loja',
        'endereco',
        'cnpj',
        'data',
        'hora',
        'forma_pagamento',
        'confidence',
      ],
      properties: {
        loja: { type: ['string', 'null'] },
        endereco: { type: ['string', 'null'] },
        cnpj: { type: ['string', 'null'] },
        data: { type: ['string', 'null'] },
        hora: { type: ['string', 'null'] },
        forma_pagamento: { type: ['string', 'null'] },
        confidence: { type: 'number' },
      },
    },
    itens: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'numero_do_item',
          'codigo',
          'descricao',
          'quantidade',
          'unidade',
          'valor_unitario',
          'valor_total',
          'confidence',
        ],
        properties: {
          numero_do_item: { type: ['string', 'null'] },
          codigo: { type: ['string', 'null'] },
          descricao: { type: ['string', 'null'] },
          quantidade: { type: ['string', 'null'] },
          unidade: { type: ['string', 'null'] },
          valor_unitario: { type: ['string', 'null'] },
          valor_total: { type: ['string', 'null'] },
          confidence: { type: 'number' },
        },
      },
    },
    total_itens: { type: 'number' },
    valor_total_cupom: { type: ['string', 'null'] },
    confidence_geral: { type: 'number' },
  },
} as const;

export interface ReceiptGptHeader {
  loja: string | null;
  endereco: string | null;
  cnpj: string | null;
  data: string | null;
  hora: string | null;
  forma_pagamento: string | null;
  confidence: number;
}

export interface ReceiptGptItem {
  numero_do_item: string | null;
  codigo: string | null;
  descricao: string | null;
  quantidade: string | null;
  unidade: string | null;
  valor_unitario: string | null;
  valor_total: string | null;
  confidence: number;
}

export interface ReceiptGptResponse {
  cabecalho: ReceiptGptHeader;
  itens: ReceiptGptItem[];
  total_itens: number;
  valor_total_cupom: string | null;
  confidence_geral: number;
}
