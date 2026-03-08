'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAlerts } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/Skeleton';

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

export default function Home() {
  const { alerts, loading } = useAlerts();

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

          {/* Mobile bottom sheet summary */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 z-10 bg-zinc-900/95 backdrop-blur border-t border-zinc-700 p-3">
            <div className="flex items-center justify-between text-sm">
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
                      <span className="text-zinc-300 font-medium">{count}</span>
                    </span>
                  );
                })}
              </div>
              <span className="text-zinc-400 text-xs">{alerts.length} municipios</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
