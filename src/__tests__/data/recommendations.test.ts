import { describe, it, expect } from 'vitest';
import { recommendations, emergencyContacts } from '@/data/recommendations';

describe('Recommendations', () => {
  it('should have recommendations for all 4 alert levels', () => {
    expect(recommendations.rojo).toBeDefined();
    expect(recommendations.naranja).toBeDefined();
    expect(recommendations.amarillo).toBeDefined();
    expect(recommendations.verde).toBeDefined();
  });

  it('rojo should have the most recommendations', () => {
    expect(recommendations.rojo.length).toBeGreaterThanOrEqual(recommendations.naranja.length);
    expect(recommendations.rojo.length).toBeGreaterThanOrEqual(recommendations.amarillo.length);
    expect(recommendations.rojo.length).toBeGreaterThanOrEqual(recommendations.verde.length);
  });

  it('verde should have the fewest recommendations', () => {
    expect(recommendations.verde.length).toBeLessThanOrEqual(recommendations.amarillo.length);
  });

  it('rojo should mention evacuation', () => {
    const hasEvacuation = recommendations.rojo.some(r =>
      r.action.toLowerCase().includes('evacu')
    );
    expect(hasEvacuation).toBe(true);
  });

  it('rojo should mention emergency line 123', () => {
    const has123 = recommendations.rojo.some(r =>
      r.action.includes('123')
    );
    expect(has123).toBe(true);
  });

  it('naranja should mention kit de emergencia', () => {
    const hasKit = recommendations.naranja.some(r =>
      r.action.toLowerCase().includes('kit')
    );
    expect(hasKit).toBe(true);
  });

  it('amarillo should mention monitoring', () => {
    const hasMonitor = recommendations.amarillo.some(r =>
      r.action.toLowerCase().includes('monitor')
    );
    expect(hasMonitor).toBe(true);
  });

  it('verde should indicate normal conditions', () => {
    const hasNormal = recommendations.verde.some(r =>
      r.action.toLowerCase().includes('normal')
    );
    expect(hasNormal).toBe(true);
  });

  it('all recommendations should have valid icon types', () => {
    const validIcons = ['shield', 'alert', 'phone', 'map', 'radio', 'home'];
    Object.values(recommendations).flat().forEach(rec => {
      expect(validIcons).toContain(rec.icon);
    });
  });

  it('all recommendations should have non-empty actions', () => {
    Object.values(recommendations).flat().forEach(rec => {
      expect(rec.action.length).toBeGreaterThan(10);
    });
  });

  it('rojo should have at least 5 recommendations', () => {
    expect(recommendations.rojo.length).toBeGreaterThanOrEqual(5);
  });

  it('naranja should have at least 4 recommendations', () => {
    expect(recommendations.naranja.length).toBeGreaterThanOrEqual(4);
  });

  it('amarillo should have at least 3 recommendations', () => {
    expect(recommendations.amarillo.length).toBeGreaterThanOrEqual(3);
  });

  it('verde should have at least 1 recommendation', () => {
    expect(recommendations.verde.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Emergency Contacts', () => {
  it('should have at least 4 contacts', () => {
    expect(emergencyContacts.length).toBeGreaterThanOrEqual(4);
  });

  it('should include línea de emergencias 123', () => {
    const has123 = emergencyContacts.some(c => c.number.includes('123'));
    expect(has123).toBe(true);
  });

  it('should include Defensa Civil', () => {
    const hasDefensaCivil = emergencyContacts.some(c =>
      c.name.toLowerCase().includes('defensa civil')
    );
    expect(hasDefensaCivil).toBe(true);
  });

  it('should include Cruz Roja', () => {
    const hasCruzRoja = emergencyContacts.some(c =>
      c.name.toLowerCase().includes('cruz roja')
    );
    expect(hasCruzRoja).toBe(true);
  });

  it('should include UNGRD', () => {
    const hasUngrd = emergencyContacts.some(c =>
      c.name.toUpperCase().includes('UNGRD')
    );
    expect(hasUngrd).toBe(true);
  });

  it('all contacts should have name and number', () => {
    emergencyContacts.forEach(c => {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.number.length).toBeGreaterThan(0);
    });
  });

  it('should include Bomberos', () => {
    const hasBomberos = emergencyContacts.some(c =>
      c.name.toLowerCase().includes('bomberos')
    );
    expect(hasBomberos).toBe(true);
  });
});
