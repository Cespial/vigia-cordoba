import { municipalities } from '@/data/municipalities';
import type { MunicipalAlert } from '@/types';

import nbiData from '@/data/nbi-data.json';
import livestockData from '@/data/livestock-data.json';
import educationData from '@/data/education-institutions.json';
import healthData from '@/data/health-institutions.json';
import emergencyData from '@/data/ungrd-emergencies.json';

type NBIRecord = { municipality: string; nbi_total: number };
type LivestockRecord = { municipality: string; cattle_heads: number };
type EduRecord = { municipality: string; count: number };
type HealthRecord = { municipality: string; total: number };
type EmergencyRecord = { municipality: string; affected: number };

export interface RiskScore {
  slug: string;
  name: string;
  cuenca: string;
  population: number;
  score: number;
  hazard: number;
  vulnerability: number;
  exposure: number;
  precipForecast: number;
  nbi: number;
  historicalEvents: number;
}

export function normalize(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '')
    .trim();
}

export function matchMuni(recordMuni: string, targetName: string): boolean {
  const a = normalize(recordMuni);
  const b = normalize(targetName);
  return a.includes(b) || b.includes(a) || a === b;
}

export function getRiskColor(score: number): string {
  if (score >= 70) return '#ef4444';
  if (score >= 50) return '#f97316';
  if (score >= 30) return '#eab308';
  return '#22c55e';
}

export function getRiskLabel(score: number): string {
  if (score >= 70) return 'Critico';
  if (score >= 50) return 'Alto';
  if (score >= 30) return 'Moderado';
  return 'Bajo';
}

export function computeRiskScores(alerts: MunicipalAlert[]): RiskScore[] {
  // Collect all raw values for normalization
  const raw = municipalities.map(m => {
    const alert = alerts.find(a => a.municipality.slug === m.slug);
    const nbi = (nbiData as NBIRecord[]).find(n => matchMuni(n.municipality, m.name));
    const cattle = (livestockData as LivestockRecord[]).find(l => matchMuni(l.municipality, m.name));
    const edu = (educationData as EduRecord[]).find(e => matchMuni(e.municipality, m.name));
    const health = (healthData as HealthRecord[]).find(h => matchMuni(h.municipality, m.name));
    const emergencies = (emergencyData as EmergencyRecord[]).filter(e => matchMuni(e.municipality, m.name));

    return {
      slug: m.slug,
      name: m.name,
      cuenca: m.cuenca,
      population: m.population || 0,
      precipForecast: alert?.precipitationForecast24h ?? 0,
      riverDischarge: alert?.riverDischarge ?? 0,
      nbiTotal: nbi?.nbi_total ?? 50,
      cattleHeads: cattle?.cattle_heads ?? 0,
      eduCount: edu?.count ?? 0,
      healthCount: health?.total ?? 0,
      historicalEvents: emergencies.length,
      historicalAffected: emergencies.reduce((s, e) => s + (e.affected || 0), 0),
    };
  });

  // Min-max normalization helper
  const minMax = (values: number[]) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    return (v: number) => max === min ? 0.5 : (v - min) / (max - min);
  };

  const normPrecip = minMax(raw.map(r => r.precipForecast));
  const normDischarge = minMax(raw.map(r => r.riverDischarge));
  const normNBI = minMax(raw.map(r => r.nbiTotal));
  const normPop = minMax(raw.map(r => r.population));
  const normInfra = minMax(raw.map(r => r.eduCount + r.healthCount));
  const normHistory = minMax(raw.map(r => r.historicalEvents));
  const normCattle = minMax(raw.map(r => r.cattleHeads));

  return raw.map(r => {
    // Hazard: 40% precipitation + 30% discharge + 30% historical events
    const hazard = normPrecip(r.precipForecast) * 0.4
      + normDischarge(r.riverDischarge) * 0.3
      + normHistory(r.historicalEvents) * 0.3;

    // Vulnerability: 60% NBI + 40% population (larger = harder to evacuate)
    const vulnerability = normNBI(r.nbiTotal) * 0.6
      + normPop(r.population) * 0.4;

    // Exposure: 40% infrastructure + 30% cattle + 30% population
    const exposure = normInfra(r.eduCount + r.healthCount) * 0.4
      + normCattle(r.cattleHeads) * 0.3
      + normPop(r.population) * 0.3;

    // Composite: 40% hazard + 30% vulnerability + 30% exposure
    const score = hazard * 0.4 + vulnerability * 0.3 + exposure * 0.3;

    return {
      slug: r.slug,
      name: r.name,
      cuenca: r.cuenca,
      population: r.population,
      score: parseFloat((score * 100).toFixed(1)),
      hazard: parseFloat((hazard * 100).toFixed(1)),
      vulnerability: parseFloat((vulnerability * 100).toFixed(1)),
      exposure: parseFloat((exposure * 100).toFixed(1)),
      precipForecast: r.precipForecast,
      nbi: r.nbiTotal,
      historicalEvents: r.historicalEvents,
    } as RiskScore;
  }).sort((a, b) => b.score - a.score);
}
