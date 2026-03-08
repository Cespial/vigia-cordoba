'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertBadge, AlertDot } from '@/components/ui/AlertBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { MunicipalAlert } from '@/types';
import { alertLevels } from '@/data/thresholds';
import { formatNumber } from '@/lib/utils';
import { Shield, Users, Droplets, MapPin } from 'lucide-react';

interface AlertsSummaryProps {
  alerts: MunicipalAlert[];
  loading: boolean;
}

export default function AlertsSummary({ alerts, loading }: AlertsSummaryProps) {
  const summary = useMemo(() => {
    const counts = { rojo: 0, naranja: 0, amarillo: 0, verde: 0 };
    let totalPrecip = 0;
    let maxDischarge = 0;
    let populationAtRisk = 0;

    alerts.forEach(a => {
      counts[a.alertLevel.level]++;
      totalPrecip += a.precipitationForecast24h;
      if (a.riverDischarge > maxDischarge) maxDischarge = a.riverDischarge;
      if (a.alertLevel.level !== 'verde') {
        populationAtRisk += a.municipality.population || 0;
      }
    });

    return { counts, avgPrecip: alerts.length ? totalPrecip / alerts.length : 0, maxDischarge, populationAtRisk };
  }, [alerts]);

  if (loading) {
    return (
      <Card>
        <Skeleton className="h-6 w-40 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Shield size={16} className="text-blue-500" />
            Estado de Alertas
          </span>
        </CardTitle>
      </CardHeader>

      {/* Alert level counts */}
      <div className="grid grid-cols-2 gap-2">
        {(['rojo', 'naranja', 'amarillo', 'verde'] as const).map(level => (
          <div
            key={level}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 p-2"
          >
            <AlertDot level={level} />
            <div>
              <div className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{summary.counts[level]}</div>
              <div className="text-[10px] text-zinc-500">{alertLevels[level].label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Key metrics */}
      <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-zinc-500">
            <Users size={14} /> Población en riesgo
          </span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {formatNumber(summary.populationAtRisk)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-zinc-500">
            <Droplets size={14} /> Precip. prom. 24h
          </span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {formatNumber(summary.avgPrecip, 1)} mm
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-zinc-500">
            <MapPin size={14} /> Caudal máx.
          </span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {formatNumber(summary.maxDischarge, 1)} m³/s
          </span>
        </div>
      </div>
    </Card>
  );
}
