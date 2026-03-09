'use client';

import { useMemo } from 'react';
import Header from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAlerts } from '@/lib/hooks';
import { formatNumber } from '@/lib/utils';
import { municipalities, cuencas } from '@/data/municipalities';
import { alertLevels } from '@/data/thresholds';
import ENSOIndicator from '@/components/charts/ENSOIndicator';
import EmergencyHistory from '@/components/charts/EmergencyHistory';
import PrecipitationChart from '@/components/charts/PrecipitationChart';
import FloodChart from '@/components/charts/FloodChart';
import Link from 'next/link';
import {
  Shield, Users, Droplets, Activity, AlertTriangle,
  MapPin, TrendingUp, Building2, GraduationCap, Beef, TrendingDown, Hospital
} from 'lucide-react';
import stationsData from '@/data/ideam-stations.json';
import nbiData from '@/data/nbi-data.json';
import livestockData from '@/data/livestock-data.json';
import educationData from '@/data/education-institutions.json';
import healthData from '@/data/health-institutions.json';

type StationRecord = { municipality: string; active: boolean };
type NBIRecord = { municipality: string; nbi_total: number };
type LivestockRecord = { municipality: string; cattle_heads: number };
type EduRecord = { municipality: string; count: number };
type HealthRecord = { municipality: string; total: number };

const levelColors: Record<string, string> = {
  rojo: '#ef4444', naranja: '#f97316', amarillo: '#eab308', verde: '#22c55e'
};
const levelBg: Record<string, string> = {
  rojo: 'border-red-500/30 bg-red-500/5',
  naranja: 'border-orange-500/30 bg-orange-500/5',
  amarillo: 'border-yellow-500/30 bg-yellow-500/5',
  verde: 'border-green-500/30 bg-green-500/5',
};
const levelSeverity: Record<string, number> = { rojo: 4, naranja: 3, amarillo: 2, verde: 1 };

export default function EjecutivoPage() {
  const { alerts, loading } = useAlerts();

  const analysis = useMemo(() => {
    if (alerts.length === 0) return null;

    const counts = { rojo: 0, naranja: 0, amarillo: 0, verde: 0 };
    let totalPrecip = 0;
    let maxPrecip = 0;
    let maxPrecipMuni = '';
    let maxDischarge = 0;
    let maxDischargeMuni = '';
    let popAtRisk = 0;
    let popHighRisk = 0;

    alerts.forEach(a => {
      counts[a.alertLevel.level]++;
      totalPrecip += a.precipitationForecast24h;
      if (a.precipitationForecast24h > maxPrecip) {
        maxPrecip = a.precipitationForecast24h;
        maxPrecipMuni = a.municipality.name;
      }
      if (a.riverDischarge > maxDischarge) {
        maxDischarge = a.riverDischarge;
        maxDischargeMuni = a.municipality.name;
      }
      if (a.alertLevel.level !== 'verde') popAtRisk += a.municipality.population || 0;
      if (a.alertLevel.level === 'rojo' || a.alertLevel.level === 'naranja') popHighRisk += a.municipality.population || 0;
    });

    const overallLevel = counts.rojo > 0 ? 'rojo'
      : counts.naranja > 0 ? 'naranja'
      : counts.amarillo > 0 ? 'amarillo' : 'verde';

    const totalPop = municipalities.reduce((s, m) => s + (m.population || 0), 0);

    const cuencaAnalysis = cuencas.map(c => {
      const munis = municipalities.filter(m => m.cuenca === c.name);
      const cuencaAlerts = alerts.filter(a => a.municipality.cuenca === c.name);
      const worst = cuencaAlerts.reduce((w, a) =>
        levelSeverity[a.alertLevel.level] > levelSeverity[w] ? a.alertLevel.level : w, 'verde');
      const avgP = cuencaAlerts.length
        ? cuencaAlerts.reduce((s, a) => s + a.precipitationForecast24h, 0) / cuencaAlerts.length : 0;
      const maxD = cuencaAlerts.reduce((m, a) => Math.max(m, a.riverDischarge), 0);
      const pop = munis.reduce((s, m) => s + (m.population || 0), 0);
      return { ...c, worst, avgPrecip: avgP, maxDischarge: maxD, population: pop, muniCount: munis.length };
    });

    const critical = [...alerts]
      .sort((a, b) => {
        const d = levelSeverity[b.alertLevel.level] - levelSeverity[a.alertLevel.level];
        return d !== 0 ? d : b.precipitationForecast24h - a.precipitationForecast24h;
      })
      .slice(0, 10);

    // Most critical municipality for charts
    const focusMuni = critical[0]?.municipality || municipalities[0];

    return {
      counts, overallLevel, avgPrecip: totalPrecip / alerts.length,
      maxPrecip, maxPrecipMuni, maxDischarge, maxDischargeMuni,
      popAtRisk, popHighRisk, totalPop, cuencaAnalysis, critical, focusMuni
    };
  }, [alerts]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex-1 p-6">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-zinc-500">
          Sin datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          {/* Header bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Panel Ejecutivo</h2>
              <p className="text-sm text-zinc-500">
                Resumen de situación — Departamento de Córdoba
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-500">Última actualización</div>
              <div className="text-sm text-zinc-300">
                {new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          </div>

          {/* Overall status banner */}
          <div className={`rounded-xl border-2 p-4 ${levelBg[analysis.overallLevel]}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: levelColors[analysis.overallLevel] + '20' }}>
                  <Shield size={28} style={{ color: levelColors[analysis.overallLevel] }} />
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">Estado departamental</div>
                  <div className="text-2xl font-bold" style={{ color: levelColors[analysis.overallLevel] }}>
                    ALERTA {analysis.overallLevel.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                {(['rojo', 'naranja', 'amarillo', 'verde'] as const).map(level => (
                  <div key={level} className="text-center">
                    <div className="text-2xl font-bold text-zinc-100">{analysis.counts[level]}</div>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: levelColors[level] }} />
                      {alertLevels[level].label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="!p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-red-400" />
                <span className="text-xs text-zinc-500">Población alto riesgo</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{formatNumber(analysis.popHighRisk)}</div>
              <div className="text-xs text-zinc-500 mt-1">
                {((analysis.popHighRisk / analysis.totalPop) * 100).toFixed(1)}% del departamento
              </div>
            </Card>

            <Card className="!p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-orange-400" />
                <span className="text-xs text-zinc-500">Población en riesgo</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{formatNumber(analysis.popAtRisk)}</div>
              <div className="text-xs text-zinc-500 mt-1">
                {((analysis.popAtRisk / analysis.totalPop) * 100).toFixed(1)}% del departamento
              </div>
            </Card>

            <Card className="!p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets size={16} className="text-blue-400" />
                <span className="text-xs text-zinc-500">Precipitación máx.</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{formatNumber(analysis.maxPrecip, 1)} mm</div>
              <div className="text-xs text-zinc-500 mt-1 truncate">{analysis.maxPrecipMuni}</div>
            </Card>

            <Card className="!p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-cyan-400" />
                <span className="text-xs text-zinc-500">Caudal máximo</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{formatNumber(analysis.maxDischarge, 1)} m³/s</div>
              <div className="text-xs text-zinc-500 mt-1 truncate">{analysis.maxDischargeMuni}</div>
            </Card>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Critical municipalities */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    Top 10 Municipios Críticos
                  </span>
                </CardTitle>
              </CardHeader>
              <div className="space-y-1.5">
                {analysis.critical.map((a, i) => (
                  <Link
                    key={a.municipality.slug}
                    href={`/municipio/${a.municipality.slug}`}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-zinc-800/50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-zinc-600 w-4 text-right shrink-0 font-mono">{i + 1}</span>
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: levelColors[a.alertLevel.level] }}
                      />
                      <div className="min-w-0">
                        <span className="text-zinc-200 font-medium">{a.municipality.name}</span>
                        <span className="text-zinc-600 ml-1.5">{a.municipality.cuenca}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Droplets size={10} />
                        {formatNumber(a.precipitationForecast24h, 1)} mm
                      </span>
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Activity size={10} />
                        {formatNumber(a.riverDischarge, 0)} m³/s
                      </span>
                      <span className="text-zinc-600 flex items-center gap-1">
                        <Users size={10} />
                        {formatNumber(a.municipality.population || 0)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Cuenca analysis */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-blue-400" />
                    Análisis por Cuenca Hidrográfica
                  </span>
                </CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {analysis.cuencaAnalysis.map(c => (
                  <div key={c.name} className="rounded-lg border border-zinc-800 p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: c.color }} />
                        <span className="text-sm font-medium text-zinc-200">{c.name}</span>
                      </div>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{
                          backgroundColor: levelColors[c.worst] + '20',
                          color: levelColors[c.worst],
                        }}
                      >
                        {alertLevels[c.worst as keyof typeof alertLevels]?.label || 'Normal'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <div className="text-zinc-500">Municipios</div>
                        <div className="text-zinc-300 font-medium">{c.muniCount}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500">Precip. prom.</div>
                        <div className="text-zinc-300 font-medium">{formatNumber(c.avgPrecip, 1)} mm</div>
                      </div>
                      <div>
                        <div className="text-zinc-500">Caudal máx.</div>
                        <div className="text-zinc-300 font-medium">{formatNumber(c.maxDischarge, 0)} m³/s</div>
                      </div>
                      <div>
                        <div className="text-zinc-500">Población</div>
                        <div className="text-zinc-300 font-medium">{formatNumber(c.population)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <PrecipitationChart
              lat={analysis.focusMuni.lat}
              lon={analysis.focusMuni.lon}
              title={`Precipitación — ${analysis.focusMuni.name}`}
            />
            <FloodChart
              lat={analysis.focusMuni.lat}
              lon={analysis.focusMuni.lon}
              title={`Caudal — ${analysis.focusMuni.name}`}
            />
            <ENSOIndicator />
          </div>

          {/* Emergency history */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EmergencyHistory />
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <Building2 size={14} className="text-purple-400" />
                    Capacidad y Exposición Departamental
                  </span>
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {(() => {
                  const stations = stationsData as StationRecord[];
                  const totalStations = stations.length;
                  const activeStations = stations.filter(s => s.active).length;
                  const nbi = nbiData as NBIRecord[];
                  const avgNBI = nbi.length ? nbi.reduce((s, n) => s + n.nbi_total, 0) / nbi.length : 0;
                  const totalCattle = (livestockData as LivestockRecord[]).reduce((s, l) => s + l.cattle_heads, 0);
                  const totalEdu = (educationData as EduRecord[]).reduce((s, e) => s + e.count, 0);
                  const totalHealth = (healthData as HealthRecord[]).reduce((s, h) => s + h.total, 0);

                  return (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg border border-zinc-700 p-2.5 text-center">
                          <div className="text-lg font-bold text-zinc-100">{totalStations}</div>
                          <div className="text-[10px] text-zinc-500">Estaciones IDEAM</div>
                        </div>
                        <div className="rounded-lg border border-zinc-700 p-2.5 text-center">
                          <div className="text-lg font-bold text-emerald-400">{activeStations}</div>
                          <div className="text-[10px] text-zinc-500">Estaciones activas</div>
                        </div>
                        <div className="rounded-lg border border-zinc-700 p-2.5 text-center">
                          <div className="text-lg font-bold text-zinc-100">{cuencas.length}</div>
                          <div className="text-[10px] text-zinc-500">Cuencas</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-zinc-700 p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingDown size={12} className="text-amber-400" />
                            <span className="text-[10px] text-zinc-500">NBI Promedio</span>
                          </div>
                          <div className="text-lg font-bold text-amber-400">{avgNBI.toFixed(1)}%</div>
                        </div>
                        <div className="rounded-lg border border-zinc-700 p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Beef size={12} className="text-green-400" />
                            <span className="text-[10px] text-zinc-500">Cabezas ganado</span>
                          </div>
                          <div className="text-lg font-bold text-zinc-100">{formatNumber(totalCattle)}</div>
                        </div>
                        <div className="rounded-lg border border-zinc-700 p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <GraduationCap size={12} className="text-indigo-400" />
                            <span className="text-[10px] text-zinc-500">Sedes educativas</span>
                          </div>
                          <div className="text-lg font-bold text-zinc-100">{formatNumber(totalEdu)}</div>
                        </div>
                        <div className="rounded-lg border border-zinc-700 p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Hospital size={12} className="text-red-400" />
                            <span className="text-[10px] text-zinc-500">Centros de salud</span>
                          </div>
                          <div className="text-lg font-bold text-zinc-100">{formatNumber(totalHealth)}</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
                <div className="text-xs text-zinc-500 leading-relaxed">
                  Datos integrados de Open-Meteo, GloFAS, IDEAM, UNGRD, NOAA, DANE, datos.gov.co y OSM.
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Open-Meteo', 'GloFAS', 'IDEAM', 'UNGRD', 'NOAA', 'DANE', 'Esri', 'OSM'].map(src => (
                    <span key={src} className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400">
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
