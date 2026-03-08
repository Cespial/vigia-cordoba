'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAlerts } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertDot } from '@/components/ui/AlertBadge';
import { ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-zinc-900">
      <div className="text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <p className="text-sm text-zinc-500">Cargando mapa...</p>
      </div>
    </div>
  ),
});

const levelOrder = { rojo: 0, naranja: 1, amarillo: 2, verde: 3 };

export default function Home() {
  const { alerts, loading } = useAlerts();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const sortedAlerts = [...alerts].sort((a, b) =>
    levelOrder[a.alertLevel.level] - levelOrder[b.alertLevel.level]
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile, shown on md+ */}
        <div className="hidden md:flex">
          <Sidebar alerts={alerts} loading={loading} />
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0">
            <MapView alerts={alerts} />
          </div>

          {/* Mobile bottom sheet */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 z-10 bg-zinc-900/95 backdrop-blur border-t border-zinc-700">
            <button
              onClick={() => setMobileExpanded(!mobileExpanded)}
              className="flex w-full items-center justify-between p-3"
            >
              <div className="flex items-center gap-3">
                {['rojo', 'naranja', 'amarillo', 'verde'].map(level => {
                  const count = alerts.filter(a => a.alertLevel.level === level).length;
                  if (count === 0) return null;
                  const colors: Record<string, string> = {
                    rojo: 'bg-red-500', naranja: 'bg-orange-500',
                    amarillo: 'bg-yellow-500', verde: 'bg-green-500',
                  };
                  return (
                    <span key={level} className="flex items-center gap-1">
                      <span className={`h-2.5 w-2.5 rounded-full ${colors[level]}`} />
                      <span className="text-zinc-300 font-medium text-sm">{count}</span>
                    </span>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-xs">{alerts.length} municipios</span>
                {mobileExpanded ? <ChevronDown size={16} className="text-zinc-400" /> : <ChevronUp size={16} className="text-zinc-400" />}
              </div>
            </button>

            {mobileExpanded && (
              <div className="max-h-[40vh] overflow-y-auto px-3 pb-3 space-y-1">
                {sortedAlerts.map(alert => (
                  <Link
                    key={alert.municipality.slug}
                    href={`/municipio/${alert.municipality.slug}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertDot level={alert.alertLevel.level} size={10} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-zinc-200 truncate">
                          {alert.municipality.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate">
                          {alert.municipality.cuenca} · {formatNumber(alert.precipitationForecast24h, 1)} mm
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-zinc-500 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
