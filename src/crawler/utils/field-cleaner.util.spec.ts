import { cleanMeasure, normalizeMeasure } from './field-cleaner.util';

describe('cleanMeasure', () => {
  it('should extract unit after UN: prefix', () => {
    expect(cleanMeasure('UN: UNID')).toBe('UNID');
  });

  it('should return trimmed value when UN: prefix is absent', () => {
    expect(cleanMeasure('  Litro  ')).toBe('Litro');
  });
});

describe('normalizeMeasure', () => {
  it('should truncate UNID to UN', () => {
    expect(normalizeMeasure('UNID')).toBe('UN');
  });

  it('should truncate Litro to LI', () => {
    expect(normalizeMeasure('Litro')).toBe('LI');
  });

  it('should normalize short units to uppercase', () => {
    expect(normalizeMeasure('kg')).toBe('KG');
    expect(normalizeMeasure('Un')).toBe('UN');
  });

  it('should extract and truncate value after UN: prefix', () => {
    expect(normalizeMeasure('UN: UNID')).toBe('UN');
    expect(normalizeMeasure('UN: Kg')).toBe('KG');
  });

  it('should return empty string when measure is empty', () => {
    expect(normalizeMeasure('')).toBe('');
  });
});
