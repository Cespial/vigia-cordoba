'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAlerts } from '@/lib/hooks';
import { formatNumber } from '@/lib/utils';
import { municipalities } from '@/data/municipalities';
import {
  Scale, Users, Droplets, Activity, Shield, X,
  GraduationCap, Hospital, Beef, AlertTriangle, TrendingDown,
} from 'lucide-react';

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

const levelColors: Record<string, string> = {
  rojo: '#ef4444', naranja: '#f97316', amarillo: '#eab308', verde: '#22c55e',
};

const MAX_SELECTIONS = 3;

export default function ComparadorPage() {
  const { alerts, loading } = useAlerts();
  const [selected, setSelected] = useState<string[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const toggleMuni = (slug: string) => {
    setSelected(prev => {
      if (prev.includes(slug)) return prev.filter(s => s !== slug);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, slug];
    });
  };

  const removeMuni = (slug: string) => {
    setSelected(prev => prev.filter(s => s !== slug));
  };

  const comparison = useMemo(() => {
    if (selected.length < 2) return null;

    return selected.map(slug => {
      const muni = municipalities.find(m => m.slug === slug)!;
      const alert = alerts.find(a => a.municipality.slug === slug);
      const nbi = (nbiData as NBIRecord[]).find(n => matchMuni(n.municipality, muni.name));
      const edu = (educationData as EduRecord[]).find(e => matchMuni(e.municipality, muni.name));
      const health = (healthData as HealthRecord[]).find(h => matchMuni(h.municipality, muni.name));
      const cattle = (livestockData as LivestockRecord[]).find(l => matchMuni(l.municipality, muni.name));
      const emergencies = (emergencyData as EmergencyRecord[]).filter(e => matchMuni(e.municipality, muni.name));

      return {
        slug: muni.slug,
        name: muni.name,
        cuenca: muni.cuenca,
        population: muni.population || 0,
        alertLevel: alert?.alertLevel.level ?? 'verde',
        alertLabel: alert?.alertLevel.label ?? 'Sin Alerta',
        precipitationForecast24h: alert?.precipitationForecast24h ?? 0,
        riverDischarge: alert?.riverDischarge ?? 0,
        nbi: nbi?.nbi_total ?? 0,
        educationInstitutions: edu?.count ?? 0,
        healthFacilities: health?.total ?? 0,
        cattleHeads: cattle?.cattle_heads ?? 0,
        historicalEmergencies: emergencies.length,
      };
    });
  }, [selected, alerts]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex-1 p-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Comparador de Municipios</h2>
              <p className="text-sm text-zinc-500">
                Seleccione 2 a 3 municipios para comparar indicadores lado a lado
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Scale size={20} className="text-blue-400" />
              <span className="text-sm text-zinc-400">{selected.length}/{MAX_SELECTIONS}</span>
            </div>
          </div>

          {/* Municipality selector */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Shield size={14} className="text-blue-400" />
                  Seleccionar municipios
                </span>
              </CardTitle>
            </CardHeader>

            {/* Selected chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {selected.map(slug => {
                const muni = municipalities.find(m => m.slug === slug);
                return (
                  <button
                    key={slug}
                    onClick={() => removeMuni(slug)}
                    className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-300 hover:bg-blue-500/20 transition-colors"
                  >
                    {muni?.name}
                    <X size={14} />
                  </button>
                );
              })}
              {selected.length < MAX_SELECTIONS && (
                <button
                  onClick={() => setSelectorOpen(!selectorOpen)}
                  className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
                  data-testid="add-municipality-btn"
                >
                  + Agregar municipio
                </button>
              )}
            </div>

            {/* Dropdown selector */}
            {selectorOpen && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 max-h-60 overflow-y-auto rounded-lg border border-zinc-800 p-2" data-testid="municipality-selector">
                {municipalities.map(m => {
                  const isSelected = selected.includes(m.slug);
                  const isDisabled = !isSelected && selected.length >= MAX_SELECTIONS;
                  return (
                    <button
                      key={m.slug}
                      onClick={() => {
                        toggleMuni(m.slug);
                        if (!isSelected && selected.length + 1 >= MAX_SELECTIONS) {
                          setSelectorOpen(false);
                        }
                      }}
                      disabled={isDisabled}
                      className={`text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                        isSelected
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : isDisabled
                            ? 'text-zinc-600 cursor-not-allowed'
                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Comparison prompt */}
          {selected.length < 2 && (
            <div className="flex items-center justify-center py-12 text-zinc-500" data-testid="comparison-prompt">
              <div className="text-center space-y-2">
                <Scale size={40} className="mx-auto text-zinc-600" />
                <p className="text-sm">Seleccione al menos 2 municipios para comenzar la comparacion</p>
              </div>
            </div>
          )}

          {/* Comparison cards */}
          {comparison && (
            <div className="space-y-4" data-testid="comparison-results">
              {/* Alert level row */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                  <Shield size={14} className="text-red-400" />
                  Nivel de Alerta
                </h3>
                <div className={`grid gap-4 ${comparison.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {comparison.map(c => (
                    <Card key={c.slug} className="!p-4 text-center">
                      <div className="text-xs text-zinc-500 mb-1">{c.name}</div>
                      <div
                        className="text-lg font-bold"
                        style={{ color: levelColors[c.alertLevel] }}
                      >
                        {c.alertLabel}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Hydro-meteorological indicators */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                  <Droplets size={14} className="text-blue-400" />
                  Indicadores Hidrometeorologicos
                </h3>
                <div className={`grid gap-4 ${comparison.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {comparison.map(c => (
                    <Card key={c.slug} className="!p-4">
                      <div className="text-xs text-zinc-500 mb-3">{c.name}</div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Droplets size={12} className="text-blue-400" />
                            <span className="text-[10px] text-zinc-500">Precipitacion 24h</span>
                          </div>
                          <div className="text-lg font-bold text-zinc-100">
                            {formatNumber(c.precipitationForecast24h, 1)} mm
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Activity size={12} className="text-cyan-400" />
                            <span className="text-[10px] text-zinc-500">Caudal</span>
                          </div>
                          <div className="text-lg font-bold text-zinc-100">
                            {formatNumber(c.riverDischarge, 1)} m3/s
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Demographics */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                  <Users size={14} className="text-purple-400" />
                  Demografia y Vulnerabilidad
                </h3>
                <div className={`grid gap-4 ${comparison.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {comparison.map(c => (
                    <Card key={c.slug} className="!p-4">
                      <div className="text-xs text-zinc-500 mb-3">{c.name}</div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Users size={12} className="text-purple-400" />
                            <span className="text-[10px] text-zinc-500">Poblacion</span>
                          </div>
                          <div className="text-lg font-bold text-zinc-100">
                            {formatNumber(c.population)}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingDown size={12} className="text-amber-400" />
                            <span className="text-[10px] text-zinc-500">NBI</span>
                          </div>
                          <div className="text-lg font-bold text-amber-400">
                            {c.nbi.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Infrastructure */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                  <GraduationCap size={14} className="text-indigo-400" />
                  Infraestructura y Exposicion
                </h3>
                <div className={`grid gap-4 ${comparison.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {comparison.map(c => (
                    <Card key={c.slug} className="!p-4">
                      <div className="text-xs text-zinc-500 mb-3">{c.name}</div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <GraduationCap size={12} className="text-indigo-400" />
                            <span className="text-[10px] text-zinc-500">Sedes educativas</span>
                          </div>
                          <div className="text-lg font-bold text-zinc-100">
                            {formatNumber(c.educationInstitutions)}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Hospital size={12} className="text-red-400" />
                            <span className="text-[10px] text-zinc-500">Centros de salud</span>
                          </div>
                          <div className="text-lg font-bold text-zinc-100">
                            {formatNumber(c.healthFacilities)}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Beef size={12} className="text-green-400" />
                            <span className="text-[10px] text-zinc-500">Cabezas de ganado</span>
                          </div>
                          <div className="text-lg font-bold text-zinc-100">
                            {formatNumber(c.cattleHeads)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Historical emergencies */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-orange-400" />
                  Historial de Emergencias
                </h3>
                <div className={`grid gap-4 ${comparison.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {comparison.map(c => (
                    <Card key={c.slug} className="!p-4 text-center">
                      <div className="text-xs text-zinc-500 mb-1">{c.name}</div>
                      <div className="text-2xl font-bold text-zinc-100">
                        {c.historicalEmergencies}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">emergencias registradas</div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Summary comparison table */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <span className="flex items-center gap-2">
                      <Scale size={14} className="text-blue-400" />
                      Resumen Comparativo
                    </span>
                  </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs" data-testid="comparison-table">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-2 px-2 text-zinc-500 font-medium">Indicador</th>
                        {comparison.map(c => (
                          <th key={c.slug} className="text-right py-2 px-2 text-zinc-300 font-medium">
                            {c.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      <tr>
                        <td className="py-2 px-2 text-zinc-400">Nivel de alerta</td>
                        {comparison.map(c => (
                          <td key={c.slug} className="py-2 px-2 text-right font-medium" style={{ color: levelColors[c.alertLevel] }}>
                            {c.alertLabel}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-zinc-400">Precipitacion 24h</td>
                        {comparison.map(c => (
                          <td key={c.slug} className="py-2 px-2 text-right text-zinc-300">
                            {formatNumber(c.precipitationForecast24h, 1)} mm
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-zinc-400">Caudal</td>
                        {comparison.map(c => (
                          <td key={c.slug} className="py-2 px-2 text-right text-zinc-300">
                            {formatNumber(c.riverDischarge, 1)} m3/s
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-zinc-400">Poblacion</td>
                        {comparison.map(c => (
                          <td key={c.slug} className="py-2 px-2 text-right text-zinc-300">
                            {formatNumber(c.population)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-zinc-400">NBI</td>
                        {comparison.map(c => (
                          <td key={c.slug} className="py-2 px-2 text-right text-amber-400">
                            {c.nbi.toFixed(1)}%
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-zinc-400">Sedes educativas</td>
                        {comparison.map(c => (
                          <td key={c.slug} className="py-2 px-2 text-right text-zinc-300">
                            {formatNumber(c.educationInstitutions)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-zinc-400">Centros de salud</td>
                        {comparison.map(c => (
                          <td key={c.slug} className="py-2 px-2 text-right text-zinc-300">
                            {formatNumber(c.healthFacilities)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-zinc-400">Cabezas de ganado</td>
                        {comparison.map(c => (
                          <td key={c.slug} className="py-2 px-2 text-right text-zinc-300">
                            {formatNumber(c.cattleHeads)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-zinc-400">Emergencias historicas</td>
                        {comparison.map(c => (
                          <td key={c.slug} className="py-2 px-2 text-right text-zinc-300">
                            {c.historicalEmergencies}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
