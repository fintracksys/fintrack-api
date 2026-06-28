import { readFileSync } from 'fs';
import { join } from 'path';
import { PaymentMethod } from '../enums/payment-method.enum';
import { parseNfceNationalLayout } from './parse-nfce-national-layout.util';

const FIXTURES_DIR = join(__dirname, '..', 'fixtures');

describe('parseNfceNationalLayout', () => {
  it('should parse PR NFCe sample', () => {
    const html = readFileSync(join(FIXTURES_DIR, 'pr-nfce-sample.html'), 'utf8');
    const url =
      'https://www.fazenda.pr.gov.br/nfce/qrcode?p=41260676430438003944650250004990441025617777';

    const result = parseNfceNationalLayout(html, url);

    expect(result.storeName).toBe('IRMAOS MUFFATO E CIA LTDA');
    expect(result.cnpj).toBe('76430438003944');
    expect(result.paymentMethod).toBe(PaymentMethod.DEBIT_CARD);
    expect(result.items).toHaveLength(13);
    expect(result.items[0].nameProduct).toBe('PAO PULLMAN 480G');
    expect(result.items[0].codProduct).toBe('17246');
    expect(result.items[0].totalValue.toString()).toBe('8.99');
    expect(result.dateTicket).toEqual(new Date(2026, 5, 8));
    expect(result.timeTicket).toBe('19:46:34');
    expect(result.url).toBe(url);
  });

  it('should parse SC NFCe sample', () => {
    const html = readFileSync(join(FIXTURES_DIR, 'sc-nfce-sample.html'), 'utf8');
    const url =
      'https://sat.sef.sc.gov.br/tax.NET/Sat.DFe.NFCe.Web/Consultas/NFCe_Detalhes.aspx?rq=abc';

    const result = parseNfceNationalLayout(html, url);

    expect(result.storeName).toBe('MINIMERCADO RODAN LTDA');
    expect(result.cnpj).toBe('36496018000173');
    expect(result.paymentMethod).toBe(PaymentMethod.DEBIT_CARD);
    expect(result.items.length).toBeGreaterThan(0);
  });
});
