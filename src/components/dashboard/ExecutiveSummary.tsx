'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import type { MunicipalAlert } from '@/types';
import { formatNumber } from '@/lib/utils';
import { cuencas, municipalities } from '@/data/municipalities';
import {
  AlertTriangle, Users, Droplets, Activity,
  TrendingUp, TrendingDown, Minus, Shield
} from 'lucide-react';

interface ExecutiveSummaryProps {
  alerts: MunicipalAlert[];
}

const levelSeverity: Record<string, number> = { rojo: 4, naranja: 3, amarillo: 2, verde: 1 };
const levelLabels: Record<string, string> = { rojo: 'ROJO', naranja: 'NARANJA', amarillo: 'AMARILLO', verde: 'VERDE' };
const levelColors: Record<string, string> = { rojo: '#ef4444', naranja: '#f97316', amarillo: '#eab308', verde: '#22c55e' };
const levelBg: Record<string, string> = {
  rojo: 'bg-red-500/10 border-red-500/30',
  naranja: 'bg-orange-500/10 border-orange-500/30',
  amarillo: 'bg-yellow-500/10 border-yellow-500/30',
  verde: 'bg-green-500/10 border-green-500/30',
};

export default function ExecutiveSummary({ alerts }: ExecutiveSummaryProps) {
  const analysis = useMemo(() => {
    if (alerts.length === 0) return null;

    const counts = { rojo: 0, naranja: 0, amarillo: 0, verde: 0 };
    let totalPrecip = 0;
    let maxPrecip = 0;
    let maxPrecipMuni = '';
    let maxDischarge = 0;
    let maxDischargeMuni = '';
    let populationAtRisk = 0;
    let populationHighRisk = 0;

    alerts.forEach(a => {
      const lvl = a.alertLevel.level;
      counts[lvl]++;
      totalPrecip += a.precipitationForecast24h;
      if (a.precipitationForecast24h > maxPrecip) {
        maxPrecip = a.precipitationForecast24h;
        maxPrecipMuni = a.municipality.name;
      }
      if (a.riverDischarge > maxDischarge) {
        maxDischarge = a.riverDischarge;
        maxDischargeMuni = a.municipality.name;
      }
      if (lvl !== 'verde') {
        populationAtRisk += a.municipality.population || 0;
      }
      if (lvl === 'rojo' || lvl === 'naranja') {
        populationHighRisk += a.municipality.population || 0;
      }
    });

    // Overall severity: highest alert level found
    const overallLevel = counts.rojo > 0 ? 'rojo'
      : counts.naranja > 0 ? 'naranja'
      : counts.amarillo > 0 ? 'amarillo'
      : 'verde';

    // Cuenca analysis
    const cuencaData = cuencas.map(c => {
      const cuencaAlerts = alerts.filter(a => a.municipality.cuenca === c.name);
      const cuencaMunis = municipalities.filter(m => m.cuenca === c.name);
      const worstAlert = cuencaAlerts.reduce((worst, a) => {
        return levelSeverity[a.alertLevel.level] > levelSeverity[worst] ? a.alertLevel.level : worst;
      }, 'verde' as string);
      const avgPrecip = cuencaAlerts.length
        ? cuencaAlerts.reduce((s, a) => s + a.precipitationForecast24h, 0) / cuencaAlerts.length
        : 0;
      const pop = cuencaMunis.reduce((s, m) => s + (m.population || 0), 0);
      return { ...c, worstAlert, avgPrecip, population: pop, alertCount: cuencaAlerts.length };
    });

    // Top 5 most critical municipalities
    const criticalMunis = [...alerts]
      .sort((a, b) => {
        const diff = levelSeverity[b.alertLevel.level] - levelSeverity[a.alertLevel.level];
        if (diff !== 0) return diff;
        return b.precipitationForecast24h - a.precipitationForecast24h;
      })
      .slice(0, 5);

    const totalPopulation = municipalities.reduce((s, m) => s + (m.population || 0), 0);

    return {
      counts,
      overallLevel,
      avgPrecip: totalPrecip / alerts.length,
      maxPrecip,
      maxPrecipMuni,
      maxDischarge,
      maxDischargeMuni,
      populationAtRisk,
      populationHighRisk,
      totalPopulation,
      cuencaData,
      criticalMunis,
      alertsWithRisk: counts.rojo + counts.naranja + counts.amarillo,
    };
  }, [alerts]);

  if (!analysis) return null;

  return (
    <div className="space-y-3">
      {/* Overall status banner */}
      <div className={`rounded-xl border p-3 ${levelBg[analysis.overallLevel]}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: levelColors[analysis.overallLevel] + '20' }}
            >
              <Shield size={20} style={{ color: levelColors[analysis.overallLevel] }} />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Nivel departamental</div>
              <div className="text-sm font-bold" style={{ color: levelColors[analysis.overallLevel] }}>
                ALERTA {levelLabels[analysis.overallLevel]}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-zinc-100">{analysis.alertsWithRisk}</div>
            <div className="text-[10px] text-zinc-500">municipios en alerta</div>
          </div>
        </div>
      </div>

      {/* Key indicators grid */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="!p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Users size={12} className="text-red-400" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Población alto riesgo</span>
          </div>
          <div className="text-lg font-bold text-zinc-100">{formatNumber(analysis.populationHighRisk)}</div>
          <div className="text-[10px] text-zinc-500">
            {((analysis.populationHighRisk / analysis.totalPopulation) * 100).toFixed(1)}% del departamento
          </div>
        </Card>

        <Card className="!p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle size={12} className="text-orange-400" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Población en riesgo</span>
          </div>
          <div className="text-lg font-bold text-zinc-100">{formatNumber(analysis.populationAtRisk)}</div>
          <div className="text-[10px] text-zinc-500">
            {((analysis.populationAtRisk / analysis.totalPopulation) * 100).toFixed(1)}% del departamento
          </div>
        </Card>

        <Card className="!p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Droplets size={12} className="text-blue-400" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Precip. máxima</span>
          </div>
          <div className="text-lg font-bold text-zinc-100">{formatNumber(analysis.maxPrecip, 1)} mm</div>
          <div className="text-[10px] text-zinc-500 truncate">{analysis.maxPrecipMuni}</div>
        </Card>

        <Card className="!p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity size={12} className="text-cyan-400" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Caudal máximo</span>
          </div>
          <div className="text-lg font-bold text-zinc-100">{formatNumber(analysis.maxDischarge, 1)} m³/s</div>
          <div className="text-[10px] text-zinc-500 truncate">{analysis.maxDischargeMuni}</div>
        </Card>
      </div>

      {/* Critical municipalities */}
      <Card className="!p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle size={12} className="text-red-400" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
            Municipios críticos
          </span>
        </div>
        <div className="space-y-1.5">
          {analysis.criticalMunis.map((a, i) => (
            <div key={a.municipality.slug} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-zinc-600 w-3 text-right shrink-0">{i + 1}</span>
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: levelColors[a.alertLevel.level] }}
                />
                <span className="text-zinc-200 truncate">{a.municipality.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-zinc-400">{formatNumber(a.precipitationForecast24h, 1)} mm</span>
                <span className="text-zinc-500">{formatNumber(a.riverDischarge, 0)} m³/s</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cuenca overview */}
      <Card className="!p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Activity size={12} className="text-blue-400" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
            Estado por cuenca
          </span>
        </div>
        <div className="space-y-1.5">
          {analysis.cuencaData.map(c => (
            <div key={c.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2 w-4 rounded-sm shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-zinc-200 truncate">{c.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: levelColors[c.worstAlert] }}
                />
                <span className="text-zinc-400 w-16 text-right">{formatNumber(c.avgPrecip, 1)} mm</span>
                <span className="text-zinc-500 w-16 text-right">{formatNumber(c.population)} hab</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
