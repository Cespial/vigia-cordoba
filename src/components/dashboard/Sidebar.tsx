'use client';

import { useState } from 'react';
import AlertsSummary from './AlertsSummary';
import MunicipalityList from './MunicipalityList';
import PrecipitationChart from '@/components/charts/PrecipitationChart';
import FloodChart from '@/components/charts/FloodChart';
import type { MunicipalAlert } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  alerts: MunicipalAlert[];
  loading: boolean;
  selectedLat?: number;
  selectedLon?: number;
}

export default function Sidebar({ alerts, loading, selectedLat = 8.75, selectedLon = -75.8833 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

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
        <PrecipitationChart lat={selectedLat} lon={selectedLon} title="Precipitación — Montería" />
        <FloodChart lat={selectedLat} lon={selectedLon} title="Caudal Río Sinú — Montería" />
        <MunicipalityList alerts={alerts} loading={loading} />
      </div>
    </div>
  );
}
