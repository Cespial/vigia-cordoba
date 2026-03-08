'use client';

import { useState } from 'react';
import { alertLevels } from '@/data/thresholds';
import { cuencas } from '@/data/municipalities';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';

export default function MapLegend() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="absolute bottom-8 left-3 z-10 select-none">
      <div className="rounded-lg border border-zinc-700 bg-zinc-900/95 backdrop-blur shadow-lg overflow-hidden max-w-[200px]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Layers size={12} />
            Leyenda
          </span>
          {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>

        {expanded && (
          <div className="px-3 pb-3 space-y-3">
            {/* Alert levels */}
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Niveles de alerta</p>
              <div className="space-y-1">
                {(['rojo', 'naranja', 'amarillo', 'verde'] as const).map(level => (
                  <div key={level} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: alertLevels[level].color }}
                    />
                    <span className="text-[11px] text-zinc-300">{alertLevels[level].label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Marker sizes */}
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Prioridad</p>
              <div className="space-y-1">
                {[
                  { label: 'Alta', size: 14 },
                  { label: 'Media', size: 10 },
                  { label: 'Baja', size: 7 },
                ].map(p => (
                  <div key={p.label} className="flex items-center gap-2">
                    <span
                      className="rounded-full bg-zinc-400 shrink-0"
                      style={{ width: p.size, height: p.size }}
                    />
                    <span className="text-[11px] text-zinc-300">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cuencas */}
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Cuencas</p>
              <div className="space-y-1">
                {cuencas.map(c => (
                  <div key={c.name} className="flex items-center gap-2">
                    <span
                      className="h-2 w-4 rounded-sm shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-[11px] text-zinc-300">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monitoring points */}
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Puntos de monitoreo</p>
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-blue-600 shrink-0">
                  <span className="text-white text-[8px]">M</span>
                </span>
                <span className="text-[11px] text-zinc-300">Estación / Embalse</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
