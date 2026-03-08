'use client';

import { useState, useMemo } from 'react';
import AlertsSummary from './AlertsSummary';
import MunicipalityList from './MunicipalityList';
import PrecipitationChart from '@/components/charts/PrecipitationChart';
import FloodChart from '@/components/charts/FloodChart';
import type { MunicipalAlert } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const levelOrder = { rojo: 0, naranja: 1, amarillo: 2, verde: 3 };

interface SidebarProps {
  alerts: MunicipalAlert[];
  loading: boolean;
}

export default function Sidebar({ alerts, loading }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Show charts for the most critical municipality (or Montería by default)
  const focusMuni = useMemo(() => {
    if (alerts.length === 0) return { name: 'Montería', lat: 8.75, lon: -75.8833 };
    const sorted = [...alerts].sort((a, b) =>
      levelOrder[a.alertLevel.level] - levelOrder[b.alertLevel.level]
    );
    // Pick most severe; if all verde, use Montería
    const mostSevere = sorted[0];
    if (mostSevere.alertLevel.level === 'verde') {
      const monteria = alerts.find(a => a.municipality.slug === 'monteria');
      if (monteria) return { name: monteria.municipality.name, lat: monteria.municipality.lat, lon: monteria.municipality.lon };
    }
    return { name: mostSevere.municipality.name, lat: mostSevere.municipality.lat, lon: mostSevere.municipality.lon };
  }, [alerts]);

  return (
    <div className={`relative flex flex-col transition-all duration-300 ${collapsed ? 'w-0 overflow-hidden' : 'w-[380px]'}`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="flex flex-col gap-4 overflow-y-auto p-4 h-full">
        <AlertsSummary alerts={alerts} loading={loading} />
        <PrecipitationChart lat={focusMuni.lat} lon={focusMuni.lon} title={`Precipitación — ${focusMuni.name}`} />
        <FloodChart lat={focusMuni.lat} lon={focusMuni.lon} title={`Caudal — ${focusMuni.name}`} />
        <MunicipalityList alerts={alerts} loading={loading} />
      </div>
    </div>
  );
}
