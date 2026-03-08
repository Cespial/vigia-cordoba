'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Thermometer } from 'lucide-react';
import ensoData from '@/data/enso-oni.json';

const seasonLabels: Record<string, string> = {
  DJF: 'Dic-Feb', JFM: 'Ene-Mar', FMA: 'Feb-Abr', MAM: 'Mar-May',
  AMJ: 'Abr-Jun', MJJ: 'May-Jul', JJA: 'Jun-Ago', JAS: 'Jul-Sep',
  ASO: 'Ago-Oct', SON: 'Sep-Nov', OND: 'Oct-Dic', NDJ: 'Nov-Ene',
};

interface ENSORecord {
  year: number;
  season: string;
  total: number;
  anomaly: number;
}

function getENSOPhase(anomaly: number): { phase: string; color: string; bg: string } {
  if (anomaly >= 0.5) return { phase: 'El Niño', color: '#ef4444', bg: 'bg-red-500/10' };
  if (anomaly <= -0.5) return { phase: 'La Niña', color: '#3b82f6', bg: 'bg-blue-500/10' };
  return { phase: 'Neutro', color: '#a3a3a3', bg: 'bg-zinc-500/10' };
}

export default function ENSOIndicator() {
  const data = ensoData as ENSORecord[];

  const analysis = useMemo(() => {
    if (data.length === 0) return null;
    const latest = data[data.length - 1];
    const prev = data[data.length - 2];
    const trend = latest.anomaly - (prev?.anomaly ?? 0);
    const last12 = data.slice(-12);
    return { latest, trend, last12 };
  }, [data]);

  if (!analysis) return null;

  const { phase, color, bg } = getENSOPhase(analysis.latest.anomaly);

  return (
    <Card className="!p-3">
      <CardHeader className="!mb-2">
        <CardTitle>
          <span className="flex items-center gap-2">
            <Thermometer size={14} className="text-orange-400" />
            ENSO / Índice ONI
          </span>
        </CardTitle>
      </CardHeader>

      <div className={`rounded-lg border border-zinc-700 p-2.5 ${bg}`}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Fase actual</div>
            <div className="text-sm font-bold" style={{ color }}>{phase}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-zinc-500">ONI</div>
            <div className="text-lg font-bold text-zinc-100">
              {analysis.latest.anomaly > 0 ? '+' : ''}{analysis.latest.anomaly.toFixed(2)}°C
            </div>
          </div>
        </div>
        <div className="text-[10px] text-zinc-500">
          {analysis.latest.year} · {seasonLabels[analysis.latest.season] || analysis.latest.season}
          {analysis.trend > 0 ? ' ↑' : analysis.trend < 0 ? ' ↓' : ' →'}
        </div>
      </div>

      {/* Mini sparkline */}
      <div className="mt-2">
        <div className="text-[10px] text-zinc-500 mb-1">Últimos 12 trimestres</div>
        <div className="flex items-end gap-[2px] h-8">
          {analysis.last12.map((d, i) => {
            const { color: barColor } = getENSOPhase(d.anomaly);
            const height = Math.max(2, Math.abs(d.anomaly) * 15);
            return (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  backgroundColor: barColor,
                  height: `${height}px`,
                  opacity: 0.7,
                  alignSelf: d.anomaly >= 0 ? 'flex-end' : 'flex-start',
                }}
                title={`${d.year} ${d.season}: ${d.anomaly > 0 ? '+' : ''}${d.anomaly.toFixed(2)}°C`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] text-zinc-600 mt-0.5">
          <span>{analysis.last12[0]?.year}</span>
          <span>{analysis.last12[analysis.last12.length - 1]?.year}</span>
        </div>
      </div>

      <div className="mt-2 text-[10px] text-zinc-500 leading-relaxed">
        {phase === 'La Niña' && 'La Niña incrementa precipitaciones en Córdoba. Mayor riesgo de inundaciones.'}
        {phase === 'El Niño' && 'El Niño reduce precipitaciones en Córdoba. Menor riesgo de inundaciones fluviales.'}
        {phase === 'Neutro' && 'Condiciones neutras. Precipitaciones dentro del rango normal esperado.'}
      </div>
    </Card>
  );
}
