'use client';

import { useState } from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';

export interface MapLayer {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  visible: boolean;
}

interface LayerControlProps {
  layers: MapLayer[];
  onToggle: (layerId: string) => void;
}

export default function LayerControl({ layers, onToggle }: LayerControlProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="absolute top-14 right-3 z-[1000]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/90 backdrop-blur px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
      >
        <Layers size={13} />
        Capas
      </button>

      {expanded && (
        <div className="absolute right-0 mt-1 w-52 rounded-lg border border-zinc-700 bg-zinc-900/95 backdrop-blur shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-zinc-700">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
              Capas del mapa
            </span>
          </div>
          <div className="py-1">
            {layers.map(layer => (
              <button
                key={layer.id}
                onClick={() => onToggle(layer.id)}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-zinc-800 transition-colors"
              >
                {layer.visible ? (
                  <Eye size={12} className="text-blue-400 shrink-0" />
                ) : (
                  <EyeOff size={12} className="text-zinc-500 shrink-0" />
                )}
                {layer.color && (
                  <span
                    className="h-2 w-4 rounded-sm shrink-0"
                    style={{ backgroundColor: layer.color, opacity: layer.visible ? 1 : 0.3 }}
                  />
                )}
                <span className={layer.visible ? 'text-zinc-200' : 'text-zinc-500'}>
                  {layer.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
