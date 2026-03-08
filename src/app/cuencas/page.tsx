'use client';

import { useMemo } from 'react';
import Header from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertDot } from '@/components/ui/AlertBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAlerts } from '@/lib/hooks';
import { cuencas, municipalities } from '@/data/municipalities';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { Droplets, Users, MapPin, Activity, ChevronRight } from 'lucide-react';
import type { MunicipalAlert } from '@/types';

const levelOrder = { rojo: 0, naranja: 1, amarillo: 2, verde: 3 };

export default function CuencasPage() {
  const { alerts, loading } = useAlerts();

  const cuencaData = useMemo(() => {
    return cuencas.map(cuenca => {
      const munis = municipalities.filter(m => m.cuenca === cuenca.name);
      const muniAlerts = munis.map(m => alerts.find(a => a.municipality.slug === m.slug)).filter(Boolean) as MunicipalAlert[];

      const maxLevel = muniAlerts.reduce((max, a) => {
        return levelOrder[a.alertLevel.level] < levelOrder[max] ? a.alertLevel.level : max;
      }, 'verde' as MunicipalAlert['alertLevel']['level']);

      const avgPrecip = muniAlerts.length
        ? muniAlerts.reduce((s, a) => s + a.precipitationForecast24h, 0) / muniAlerts.length
        : 0;

      const maxDischarge = muniAlerts.length
        ? Math.max(...muniAlerts.map(a => a.riverDischarge))
        : 0;

      const totalPop = munis.reduce((s, m) => s + (m.population || 0), 0);

      return {
        ...cuenca,
        municipalities: munis,
        alerts: muniAlerts,
        maxLevel,
        avgPrecip,
        maxDischarge,
        totalPop,
      };
    });
  }, [alerts]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Header />
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-100 mb-1">Cuencas Hidrográficas</h2>
          <p className="text-sm text-zinc-400">Monitoreo por cuenca — Departamento de Córdoba</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cuencaData.map(c => (
              <Card key={c.name} className="hover:border-zinc-600 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-6 rounded-sm"
                      style={{ backgroundColor: c.color }}
                    />
                    <h3 className="font-semibold text-zinc-100 text-sm">{c.name}</h3>
                  </div>
                  <AlertDot level={c.maxLevel} size={12} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <MapPin size={12} />
                    <span>{c.municipalities.length} municipios</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Users size={12} />
                    <span>{formatNumber(c.totalPop)} hab.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Droplets size={12} />
                    <span>{formatNumber(c.avgPrecip, 1)} mm prom.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Activity size={12} />
                    <span>{formatNumber(c.maxDischarge, 1)} m³/s máx.</span>
                  </div>
                </div>

                <div className="space-y-1 border-t border-zinc-800 pt-2">
                  {c.municipalities
                    .sort((a, b) => {
                      const aAlert = c.alerts.find(al => al.municipality.slug === a.slug);
                      const bAlert = c.alerts.find(al => al.municipality.slug === b.slug);
                      return levelOrder[aAlert?.alertLevel.level ?? 'verde'] - levelOrder[bAlert?.alertLevel.level ?? 'verde'];
                    })
                    .map(m => {
                      const alert = c.alerts.find(a => a.municipality.slug === m.slug);
                      return (
                        <Link
                          key={m.slug}
                          href={`/municipio/${m.slug}`}
                          className="flex items-center justify-between py-1 px-1 rounded hover:bg-zinc-800 transition-colors group"
                        >
                          <div className="flex items-center gap-1.5">
                            <AlertDot level={alert?.alertLevel.level ?? 'verde'} size={8} />
                            <span className="text-xs text-zinc-300">{m.name}</span>
                          </div>
                          <ChevronRight size={12} className="text-zinc-500 group-hover:text-zinc-300" />
                        </Link>
                      );
                    })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
