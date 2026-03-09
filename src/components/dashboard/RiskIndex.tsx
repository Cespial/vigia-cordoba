'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { Shield, TrendingDown, Users, Droplets, AlertTriangle, ChevronRight } from 'lucide-react';
import type { MunicipalAlert } from '@/types';
import { computeRiskScores, getRiskColor, getRiskLabel } from '@/lib/risk-score';
export type { RiskScore } from '@/lib/risk-score';

interface RiskIndexProps {
  alerts: MunicipalAlert[];
}

export default function RiskIndex({ alerts }: RiskIndexProps) {
  const rankings = useMemo(() => computeRiskScores(alerts), [alerts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Shield size={14} className="text-purple-400" />
            Índice de Riesgo Compuesto
          </span>
        </CardTitle>
        <span className="text-[10px] text-zinc-500">
          Amenaza (40%) + Vulnerabilidad (30%) + Exposición (30%)
        </span>
      </CardHeader>

      {/* Column headers */}
      <div className="flex items-center text-[10px] text-zinc-500 px-2 pb-1.5 border-b border-zinc-800 gap-2">
        <span className="w-5 text-right">#</span>
        <span className="flex-1">Municipio</span>
        <span className="w-14 text-center">Riesgo</span>
        <span className="w-12 text-center hidden md:block">
          <Droplets size={10} className="inline" /> Amen.
        </span>
        <span className="w-12 text-center hidden md:block">
          <TrendingDown size={10} className="inline" /> Vuln.
        </span>
        <span className="w-12 text-center hidden md:block">
          <AlertTriangle size={10} className="inline" /> Exp.
        </span>
        <span className="w-4" />
      </div>

      <div className="space-y-0.5 max-h-[480px] overflow-y-auto">
        {rankings.map((r, i) => {
          const color = getRiskColor(r.score);
          return (
            <Link
              key={r.slug}
              href={`/municipio/${r.slug}`}
              className="flex items-center py-1.5 px-2 rounded hover:bg-zinc-800/50 transition-colors text-xs gap-2 group"
            >
              <span className="w-5 text-right text-zinc-600 font-mono shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <span className="text-zinc-200 font-medium">{r.name}</span>
                <span className="text-zinc-600 ml-1 hidden sm:inline">{r.cuenca}</span>
              </div>
              <div className="w-14 flex items-center justify-center gap-1 shrink-0">
                <div className="w-8 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${r.score}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-zinc-300 font-medium" style={{ color }}>
                  {r.score}
                </span>
              </div>
              <span className="w-12 text-center text-zinc-400 hidden md:block">{r.hazard}</span>
              <span className="w-12 text-center text-zinc-400 hidden md:block">{r.vulnerability}</span>
              <span className="w-12 text-center text-zinc-400 hidden md:block">{r.exposure}</span>
              <ChevronRight size={12} className="text-zinc-600 group-hover:text-zinc-300 shrink-0 w-4" />
            </Link>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-zinc-800 flex flex-wrap gap-3 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Crítico (70+)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Alto (50-69)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Moderado (30-49)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Bajo (&lt;30)
        </span>
      </div>
    </Card>
  );
}
