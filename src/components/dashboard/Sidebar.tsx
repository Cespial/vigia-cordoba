'use client';

import { useState, useMemo } from 'react';
import ExecutiveSummary from './ExecutiveSummary';
import MunicipalityList from './MunicipalityList';
import PrecipitationChart from '@/components/charts/PrecipitationChart';
import FloodChart from '@/components/charts/FloodChart';
import ENSOIndicator from '@/components/charts/ENSOIndicator';
import EmergencyHistory from '@/components/charts/EmergencyHistory';
import type { MunicipalAlert } from '@/types';
import { ChevronLeft, ChevronRight, BarChart3, List } from 'lucide-react';

const levelOrder = { rojo: 0, naranja: 1, amarillo: 2, verde: 3 };

interface SidebarProps {
  alerts: MunicipalAlert[];
  loading: boolean;
}

export default function Sidebar({ alerts, loading }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<'executive' | 'list'>('executive');

  // Show charts for the most critical municipality (or Montería by default)
  const focusMuni = useMemo(() => {
    if (alerts.length === 0) return { name: 'Montería', lat: 8.75, lon: -75.8833 };
    const sorted = [...alerts].sort((a, b) =>
      levelOrder[a.alertLevel.level] - levelOrder[b.alertLevel.level]
    );
    const mostSevere = sorted[0];
    if (mostSevere.alertLevel.level === 'verde') {
      const monteria = alerts.find(a => a.municipality.slug === 'monteria');
      if (monteria) return { name: monteria.municipality.name, lat: monteria.municipality.lat, lon: monteria.municipality.lon };
    }
    return { name: mostSevere.municipality.name, lat: mostSevere.municipality.lat, lon: mostSevere.municipality.lon };
  }, [alerts]);

  return (
    <div className={`relative flex flex-col transition-all duration-300 ${collapsed ? 'w-0 overflow-hidden' : 'w-[400px]'}`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Tab switcher */}
      <div className="flex border-b border-zinc-800 shrink-0">
        <button
          onClick={() => setTab('executive')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
            tab === 'executive'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <BarChart3 size={13} />
          Resumen Ejecutivo
        </button>
        <button
          onClick={() => setTab('list')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
            tab === 'list'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <List size={13} />
          Municipios
        </button>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto p-3 h-full">
        {tab === 'executive' ? (
          <>
            <ExecutiveSummary alerts={alerts} />
            <ENSOIndicator />
            <PrecipitationChart lat={focusMuni.lat} lon={focusMuni.lon} title={`Precipitación — ${focusMuni.name}`} />
            <FloodChart lat={focusMuni.lat} lon={focusMuni.lon} title={`Caudal — ${focusMuni.name}`} />
            <EmergencyHistory />
          </>
        ) : (
          <MunicipalityList alerts={alerts} loading={loading} />
        )}
      </div>
    </div>
  );
}
