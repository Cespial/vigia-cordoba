'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertDot } from '@/components/ui/AlertBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { MunicipalAlert } from '@/types';
import { formatNumber } from '@/lib/utils';
import { Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface MunicipalityListProps {
  alerts: MunicipalAlert[];
  loading: boolean;
}

const levelOrder = { rojo: 0, naranja: 1, amarillo: 2, verde: 3 };

export default function MunicipalityList({ alerts, loading }: MunicipalityListProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const sorted = [...alerts].sort((a, b) =>
      levelOrder[a.alertLevel.level] - levelOrder[b.alertLevel.level]
    );
    if (!search) return sorted;
    return sorted.filter(a =>
      a.municipality.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [alerts, search]);

  if (loading) {
    return (
      <Card>
        <Skeleton className="h-6 w-40 mb-3" />
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full mb-2" />)}
      </Card>
    );
  }

  return (
    <Card className="flex flex-col max-h-[400px]">
      <CardHeader>
        <CardTitle>Municipios</CardTitle>
        <span className="text-xs text-zinc-400">{alerts.length} municipios</span>
      </CardHeader>

      <div className="relative mb-3">
        <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar municipio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-8 pr-3 text-sm text-zinc-800 placeholder-zinc-400 focus:border-blue-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>

      <div className="overflow-y-auto flex-1 space-y-1 -mx-1 px-1">
        {filtered.map((alert) => (
          <Link
            key={alert.municipality.slug}
            href={`/municipio/${alert.municipality.slug}`}
            className="flex items-center justify-between rounded-lg p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <AlertDot level={alert.alertLevel.level} size={10} />
              <div className="min-w-0">
                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  {alert.municipality.name}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {alert.municipality.cuenca} · {formatNumber(alert.precipitationForecast24h, 1)} mm
                </div>
              </div>
            </div>
            <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-500 shrink-0" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
