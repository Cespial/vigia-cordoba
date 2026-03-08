'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertTriangle } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import emergencyData from '@/data/ungrd-emergencies.json';

interface EmergencyRecord {
  date: string;
  municipality: string;
  event_type: string;
  deaths: number;
  injuries: number;
  affected: number;
  destroyed_homes: number;
  damaged_homes: number;
  resources: number;
}

export default function EmergencyHistory() {
  const data = emergencyData as EmergencyRecord[];

  const analysis = useMemo(() => {
    if (data.length === 0) return null;

    const totalAffected = data.reduce((s, e) => s + (e.affected || 0), 0);
    const totalDeaths = data.reduce((s, e) => s + (e.deaths || 0), 0);
    const totalDestroyed = data.reduce((s, e) => s + (e.destroyed_homes || 0), 0);
    const totalDamaged = data.reduce((s, e) => s + (e.damaged_homes || 0), 0);

    // Events by municipality
    const byMuni = new Map<string, number>();
    data.forEach(e => {
      byMuni.set(e.municipality, (byMuni.get(e.municipality) || 0) + 1);
    });
    const topMunis = [...byMuni.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Events by year
    const byYear = new Map<number, number>();
    data.forEach(e => {
      const year = new Date(e.date).getFullYear();
      if (!isNaN(year)) byYear.set(year, (byYear.get(year) || 0) + 1);
    });
    const yearlyData = [...byYear.entries()].sort((a, b) => a[0] - b[0]);

    return {
      totalEvents: data.length,
      totalAffected,
      totalDeaths,
      totalDestroyed,
      totalDamaged,
      topMunis,
      yearlyData,
    };
  }, [data]);

  if (!analysis) return null;

  const maxYearCount = Math.max(...analysis.yearlyData.map(([, c]) => c), 1);

  return (
    <Card className="!p-3">
      <CardHeader className="!mb-2">
        <CardTitle>
          <span className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            Historial de Emergencias
          </span>
        </CardTitle>
        <span className="text-[10px] text-zinc-500">Fuente: UNGRD</span>
      </CardHeader>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg border border-zinc-700 p-2 text-center">
          <div className="text-lg font-bold text-zinc-100">{analysis.totalEvents}</div>
          <div className="text-[10px] text-zinc-500">Eventos registrados</div>
        </div>
        <div className="rounded-lg border border-zinc-700 p-2 text-center">
          <div className="text-lg font-bold text-zinc-100">{formatNumber(analysis.totalAffected)}</div>
          <div className="text-[10px] text-zinc-500">Personas afectadas</div>
        </div>
        <div className="rounded-lg border border-zinc-700 p-2 text-center">
          <div className="text-lg font-bold text-zinc-100">{formatNumber(analysis.totalDestroyed + analysis.totalDamaged)}</div>
          <div className="text-[10px] text-zinc-500">Viviendas impactadas</div>
        </div>
        <div className="rounded-lg border border-zinc-700 p-2 text-center">
          <div className="text-lg font-bold text-red-400">{analysis.totalDeaths}</div>
          <div className="text-[10px] text-zinc-500">Fallecidos</div>
        </div>
      </div>

      {/* Yearly chart */}
      <div className="mb-3">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Eventos por año</div>
        <div className="flex items-end gap-1 h-12">
          {analysis.yearlyData.map(([year, count]) => (
            <div key={year} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full rounded-sm bg-amber-500/60"
                style={{ height: `${(count / maxYearCount) * 40}px` }}
              />
              <span className="text-[8px] text-zinc-600">{String(year).slice(-2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top municipalities */}
      <div>
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Municipios más afectados</div>
        <div className="space-y-1">
          {analysis.topMunis.map(([name, count]) => (
            <div key={name} className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 capitalize">{name.toLowerCase()}</span>
              <span className="text-zinc-500">{count} eventos</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
