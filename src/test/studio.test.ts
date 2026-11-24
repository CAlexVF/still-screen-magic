import { describe, expect, it } from 'vitest';
import { appointmentSchema, priceLabel, services, timeOptions } from '@/lib/studio';

const valid = { name: 'Ana López', phone: '+52 33 1297 6834', service: 'corte', date: '2026-11-25', time: '10:00', notes: '' };

describe('appointment rules', () => {
  it('rejects a past date', () => {
    expect(appointmentSchema('2026-11-25').safeParse({ ...valid, date: '2026-11-24' }).success).toBe(false);
  });
  it('allows Sunday 8:30 AM and stops at 3:00 PM', () => {
    expect(timeOptions('2026-11-29')).toContain('08:30');
    expect(timeOptions('2026-11-29').at(-1)).toBe('15:00');
  });
  it('rejects Sunday 4:00 PM', () => {
    expect(appointmentSchema('2026-11-25').safeParse({ ...valid, date: '2026-11-29', time: '16:00' }).success).toBe(false);
  });
  it('accepts Mexican phone with country code and spaces', () => {
    expect(appointmentSchema('2026-11-25').safeParse(valid).success).toBe(true);
  });
});

describe('service prices', () => {
  it('gives every service an average price and a typical range', () => {
    for (const service of services) {
      expect(Number.isInteger(service.price), service.id).toBe(true);
      expect(service.price, service.id).toBeGreaterThan(0);
      expect(service.priceRange, service.id).toMatch(/^\$[\d,]+–\$[\d,]+$/);
    }
  });
  it('shows prices in Mexican pesos without cents', () => {
    expect(priceLabel(400)).toBe('$400');
    expect(priceLabel(1200)).toBe('$1,200');
  });
});