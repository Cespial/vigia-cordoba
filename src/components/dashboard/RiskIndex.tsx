'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatNumber } from '@/lib/utils';
import { municipalities } from '@/data/municipalities';
import Link from 'next/link';
import { Shield, TrendingDown, Users, Droplets, AlertTriangle, ChevronRight } from 'lucide-react';
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

function normalize(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '')
    .trim();
}

function matchMuni(recordMuni: string, targetName: string): boolean {
  const a = normalize(recordMuni);
  const b = normalize(targetName);
  return a.includes(b) || b.includes(a) || a === b;
}

interface RiskIndexProps {
  alerts: MunicipalAlert[];
}

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

export default function RiskIndex({ alerts }: RiskIndexProps) {
  const rankings = useMemo(() => {
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
  }, [alerts]);

  const getRiskColor = (score: number) => {
    if (score >= 70) return '#ef4444';
    if (score >= 50) return '#f97316';
    if (score >= 30) return '#eab308';
    return '#22c55e';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'Crítico';
    if (score >= 50) return 'Alto';
    if (score >= 30) return 'Moderado';
    return 'Bajo';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Shield size={14} className="text-purple-400" />
            Índice de Riesgo Compuesto
          </span>
        </CardTitle>
        <span className="text-[10px] text-zinc-500">
          Amenaza (40%) + Vulnerabilidad (30%) + Exposición (30%)
        </span>
      </CardHeader>

      {/* Column headers */}
      <div className="flex items-center text-[10px] text-zinc-500 px-2 pb-1.5 border-b border-zinc-800 gap-2">
        <span className="w-5 text-right">#</span>
        <span className="flex-1">Municipio</span>
        <span className="w-14 text-center">Riesgo</span>
        <span className="w-12 text-center hidden md:block">
          <Droplets size={10} className="inline" /> Amen.
        </span>
        <span className="w-12 text-center hidden md:block">
          <TrendingDown size={10} className="inline" /> Vuln.
        </span>
        <span className="w-12 text-center hidden md:block">
          <AlertTriangle size={10} className="inline" /> Exp.
        </span>
        <span className="w-4" />
      </div>

      <div className="space-y-0.5 max-h-[480px] overflow-y-auto">
        {rankings.map((r, i) => {
          const color = getRiskColor(r.score);
          return (
            <Link
              key={r.slug}
              href={`/municipio/${r.slug}`}
              className="flex items-center py-1.5 px-2 rounded hover:bg-zinc-800/50 transition-colors text-xs gap-2 group"
            >
              <span className="w-5 text-right text-zinc-600 font-mono shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <span className="text-zinc-200 font-medium">{r.name}</span>
                <span className="text-zinc-600 ml-1 hidden sm:inline">{r.cuenca}</span>
              </div>
              <div className="w-14 flex items-center justify-center gap-1 shrink-0">
                <div className="w-8 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${r.score}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-zinc-300 font-medium" style={{ color }}>
                  {r.score}
                </span>
              </div>
              <span className="w-12 text-center text-zinc-400 hidden md:block">{r.hazard}</span>
              <span className="w-12 text-center text-zinc-400 hidden md:block">{r.vulnerability}</span>
              <span className="w-12 text-center text-zinc-400 hidden md:block">{r.exposure}</span>
              <ChevronRight size={12} className="text-zinc-600 group-hover:text-zinc-300 shrink-0 w-4" />
            </Link>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-zinc-800 flex flex-wrap gap-3 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Crítico (70+)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Alto (50-69)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Moderado (30-49)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Bajo (&lt;30)
        </span>
      </div>
    </Card>
  );
}
