import {
  assertSupportedNfceHost,
  isSupportedNfceHost,
} from './supported-nfce-hosts.config';

describe('supported-nfce-hosts.config', () => {
  it('should accept SC NFCe host', () => {
    expect(
      isSupportedNfceHost(
        'https://sat.sef.sc.gov.br/tax.NET/Sat.DFe.NFCe.Web/Consultas/NFCe_Detalhes.aspx?rq=abc',
      ),
    ).toBe(true);
  });

  it('should accept PR NFCe host', () => {
    expect(
      isSupportedNfceHost(
        'https://www.fazenda.pr.gov.br/nfce/qrcode?p=41260676430438003944650250004990441025617777',
      ),
    ).toBe(true);
  });

  it('should reject unsupported host', () => {
    expect(isSupportedNfceHost('https://nfe.fazenda.gov.br/nota/123')).toBe(
      false,
    );
  });

  it('should throw for unsupported host', () => {
    expect(() =>
      assertSupportedNfceHost('https://nfe.fazenda.gov.br/nota/123'),
    ).toThrow('Estados habilitados: SC e PR');
  });
});
