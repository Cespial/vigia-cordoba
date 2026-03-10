'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import boundaries from '@/data/cordoba-boundaries.json';
import rivers from '@/data/cordoba-rivers.json';
import { Play, Pause, RefreshCw } from 'lucide-react';

/* ── Timeline ── */
const DATES = [
  '2026-01-15', '2026-01-18', '2026-01-21', '2026-01-24', '2026-01-27',
  '2026-01-30', '2026-02-02', '2026-02-05', '2026-02-08', '2026-02-11',
  '2026-02-14', '2026-02-17', '2026-02-20', '2026-02-23', '2026-02-26',
  '2026-03-01', '2026-03-04',
];

/* ── Flood data per municipality ── */
const FLOOD: Record<string, { peakHa: number; phase: number }> = {
  'monteria':                { peakHa: 28054, phase: 1 },
  'lorica':                  { peakHa:  8088, phase: 2 },
  'tierralta':               { peakHa:  4466, phase: 0 },
  'valencia':                { peakHa:  4317, phase: 0 },
  'cerete':                  { peakHa:  3200, phase: 1 },
  'san pelayo':              { peakHa:  2900, phase: 1 },
  'montelibano':             { peakHa:  2700, phase: 0 },
  'puerto libertador':       { peakHa:  2400, phase: 0 },
  'ayapel':                  { peakHa:  2100, phase: 1 },
  'san bernardo del viento': { peakHa:  1800, phase: 2 },
  'canalete':                { peakHa:  1500, phase: 2 },
  'puerto escondido':        { peakHa:  1400, phase: 2 },
  'san antero':              { peakHa:  1200, phase: 2 },
  'monitos':                 { peakHa:  1100, phase: 2 },
  'los cordobas':            { peakHa:  1000, phase: 2 },
  'chima':                   { peakHa:   900, phase: 2 },
  'cotorra':                 { peakHa:   800, phase: 1 },
  'purisima':                { peakHa:   750, phase: 2 },
  'momil':                   { peakHa:   600, phase: 2 },
  'la apartada':             { peakHa:   550, phase: 1 },
  'cienaga de oro':          { peakHa:   500, phase: 1 },
  'pueblo nuevo':            { peakHa:   400, phase: 1 },
  'san carlos':              { peakHa:   350, phase: 1 },
  'san jose de ure':         { peakHa:   300, phase: 0 },
};

const MAIN_RIVERS = ['Río Sinú', 'Río San Jorge', 'Río Canalete'];
const fmt = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });

function norm(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function intensity(dateIdx: number, phase: number): number {
  const t = dateIdx - phase;
  if (t <= 4) return 0;
  if (t <= 5) return 0.15;
  if (t <= 6) return 0.35;
  if (t <= 7) return 0.60;
  if (t <= 8) return 0.90;
  if (t <= 9) return 1.00;
  if (t <= 10) return 0.95;
  if (t <= 11) return 0.80;
  if (t <= 12) return 0.65;
  if (t <= 13) return 0.50;
  if (t <= 14) return 0.35;
  if (t <= 15) return 0.20;
  return 0.10;
}

function floodColor(val: number): string {
  if (val <= 0)   return 'transparent';
  if (val < 0.15) return '#7dd3fc'; // sky-300
  if (val < 0.35) return '#38bdf8'; // sky-400
  if (val < 0.55) return '#0ea5e9'; // sky-500
  if (val < 0.75) return '#0284c7'; // sky-600
  return '#0369a1';                 // sky-700
}

/* ── Component ── */

export default function FloodMap() {
  const [idx, setIdx] = useState(9);
  const [playing, setPlaying] = useState(false);

  const date = DATES[idx];
  const isPeak = idx >= 7 && idx <= 10;

  const mainRiverData = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: (rivers as GeoJSON.FeatureCollection).features.filter((f) =>
        MAIN_RIVERS.includes(f.properties?.name),
      ),
    }),
    [],
  );

  const { totalHa, affectedCount } = useMemo(() => {
    let ha = 0;
    let count = 0;
    for (const d of Object.values(FLOOD)) {
      const i = intensity(idx, d.phase);
      if (i > 0) { ha += Math.round(d.peakHa * i); count++; }
    }
    return { totalHa: ha, affectedCount: count };
  }, [idx]);

  const maxI = useMemo(() => {
    let m = 0;
    for (const d of Object.values(FLOOD)) {
      const i = intensity(idx, d.phase);
      if (i > m) m = i;
    }
    return m;
  }, [idx]);

  const riverLevel = maxI <= 0 ? 0 : maxI < 0.3 ? 1 : maxI < 0.6 ? 2 : 3;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setIdx((prev) => {
        if (prev >= DATES.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(id);
  }, [playing]);

  const reset = useCallback(() => { setPlaying(false); setIdx(0); }, []);

  return (
    <div className="space-y-3" data-testid="flood-map">
      <div className="rounded-xl overflow-hidden border border-zinc-700 relative" style={{ height: 560 }}>
        <MapContainer
          center={[8.75, -75.88]}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          minZoom={7}
          maxZoom={12}
          attributionControl={false}
        >
          {/* Dark basemap — clean background so flood fills pop */}
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

          {/* Municipality flood fill */}
          <GeoJSON
            key={`flood-${idx}`}
            data={boundaries as GeoJSON.FeatureCollection}
            style={(feature) => {
              if (!feature?.properties) return { fillOpacity: 0, weight: 0 };
              const key = norm(feature.properties.shapeName);
              const data = FLOOD[key];

              /* Non-flooded municipality */
              if (!data) return {
                fillColor: '#1e293b',
                fillOpacity: 0.15,
                color: '#334155',
                weight: 0.8,
              };

              const i = intensity(idx, data.phase);

              /* Before flood starts */
              if (i <= 0) return {
                fillColor: '#1e293b',
                fillOpacity: 0.15,
                color: '#334155',
                weight: 0.8,
              };

              /* Flooded — vivid blue fill + bright border */
              return {
                fillColor: floodColor(i),
                fillOpacity: 0.45 + i * 0.4,
                color: '#38bdf8',
                weight: 1.5 + i,
              };
            }}
            onEachFeature={(feature: GeoJSON.Feature, layer: L.Layer) => {
              const name = feature.properties?.shapeName || '';
              const data = FLOOD[norm(name)];
              if (!data) {
                layer.bindTooltip(name, { className: 'boundary-tooltip' });
                return;
              }
              const i = intensity(idx, data.phase);
              const ha = Math.round(data.peakHa * i);
              layer.bindTooltip(
                ha > 0
                  ? `<b>${name}</b><br/>${ha.toLocaleString()} ha inundadas`
                  : name,
                { className: 'boundary-tooltip', sticky: true },
              );
            }}
          />

          {/* Main rivers */}
          <GeoJSON
            key={`rivers-${riverLevel}`}
            data={mainRiverData as GeoJSON.FeatureCollection}
            style={() => ({
              color: ['#06b6d4', '#22d3ee', '#38bdf8', '#60a5fa'][riverLevel],
              weight: [1, 1.5, 3, 5][riverLevel],
              opacity: [0.3, 0.5, 0.8, 1][riverLevel],
            })}
          />
        </MapContainer>

        {/* Date badge */}
        <div className="absolute top-3 left-3 z-[1000]">
          <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold backdrop-blur-sm shadow-lg ${
            isPeak
              ? 'bg-red-600 text-white'
              : 'bg-zinc-900/90 text-zinc-200 border border-zinc-600'
          }`}>
            {fmt.format(new Date(date + 'T12:00:00'))} 2026
            {isPeak && <span className="ml-2 text-xs font-normal">Inundacion activa</span>}
          </div>
        </div>

        {/* Live stats */}
        <div className="absolute top-3 right-3 z-[1000] bg-zinc-900/90 backdrop-blur-sm border border-zinc-600 rounded-lg px-4 py-2.5 text-right min-w-[140px]">
          <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">Total inundado</div>
          <div className="text-xl font-bold text-sky-400 tabular-nums">{totalHa.toLocaleString()} ha</div>
          <div className="text-[11px] text-zinc-400">{affectedCount} de 30 municipios</div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-zinc-900/90 backdrop-blur-sm border border-zinc-600 rounded-lg px-3 py-2.5 text-[11px]">
          <div className="text-zinc-400 font-medium mb-2 text-[10px] uppercase tracking-wider">Severidad</div>
          <div className="flex items-center gap-1.5">
            {[
              { color: '#7dd3fc', label: 'Baja' },
              { color: '#38bdf8', label: '' },
              { color: '#0ea5e9', label: '' },
              { color: '#0284c7', label: '' },
              { color: '#0369a1', label: 'Critica' },
            ].map(({ color, label }, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="w-6 h-3 rounded-sm" style={{ backgroundColor: color }} />
                {label && <span className="text-zinc-400 text-[9px] mt-0.5">{label}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-3 px-1">
        <button
          onClick={reset}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
          aria-label="Reiniciar"
        >
          <RefreshCw size={14} />
        </button>
        <button
          onClick={() => setPlaying(!playing)}
          className={`p-2.5 rounded-lg text-white transition-colors ${
            playing ? 'bg-red-600 hover:bg-red-500' : 'bg-sky-600 hover:bg-sky-500'
          }`}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <input
          type="range"
          min={0}
          max={DATES.length - 1}
          value={idx}
          onChange={(e) => { setPlaying(false); setIdx(Number(e.target.value)); }}
          className="flex-1 accent-sky-500 h-2 cursor-pointer"
          aria-label="Fecha"
        />
      </div>
      <div className="flex justify-between text-[11px] text-zinc-500 px-2">
        <span>15 Ene</span>
        <span className="text-red-400 font-semibold">Pico: 8-11 Feb</span>
        <span>4 Mar</span>
      </div>
    </div>
  );
}
