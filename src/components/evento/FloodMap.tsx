'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import boundaries from '@/data/cordoba-boundaries.json';
import rivers from '@/data/cordoba-rivers.json';
import { Play, Pause, RefreshCw } from 'lucide-react';

/* ── Timeline: every 3 days from Jan 15 to Mar 4 ── */
const DATES = [
  '2026-01-15', '2026-01-18', '2026-01-21', '2026-01-24', '2026-01-27',
  '2026-01-30', '2026-02-02', '2026-02-05', '2026-02-08', '2026-02-11',
  '2026-02-14', '2026-02-17', '2026-02-20', '2026-02-23', '2026-02-26',
  '2026-03-01', '2026-03-04',
];

/* ── Flood severity data per municipality ──
 *  peakHa  = max hectares flooded at the event peak
 *  phase   = 0 upstream (floods first) · 1 mid · 2 downstream (floods last) */
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

const MAX_HA = 28054;
const MAIN_RIVERS = ['Río Sinú', 'Río San Jorge', 'Río Canalete'];
const fmt = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });

/* ── Helpers ── */

function norm(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/** Smooth flood-intensity curve: 0 → ramp-up → 1.0 peak → gradual decline */
function intensity(dateIdx: number, phase: number): number {
  const t = dateIdx - phase;
  if (t <= 4)  return 0;
  if (t <= 5)  return 0.15;
  if (t <= 6)  return 0.35;
  if (t <= 7)  return 0.60;
  if (t <= 8)  return 0.90;
  if (t <= 9)  return 1.00;
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
  if (val < 0.15) return '#bfdbfe'; // blue-200
  if (val < 0.35) return '#93c5fd'; // blue-300
  if (val < 0.55) return '#60a5fa'; // blue-400
  if (val < 0.75) return '#3b82f6'; // blue-500
  return '#1d4ed8';                 // blue-700
}

/* ── Component ── */

export default function FloodMap() {
  const [idx, setIdx] = useState(9); // start at peak (Feb 11)
  const [playing, setPlaying] = useState(false);

  const date = DATES[idx];
  const isPeak = idx >= 7 && idx <= 10;

  /* Pre-filter the three main rivers */
  const mainRiverData = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: (rivers as GeoJSON.FeatureCollection).features.filter((f) =>
        MAIN_RIVERS.includes(f.properties?.name),
      ),
    }),
    [],
  );

  /* Aggregate stats for the current date */
  const { totalHa, affectedCount } = useMemo(() => {
    let ha = 0;
    let count = 0;
    for (const d of Object.values(FLOOD)) {
      const i = intensity(idx, d.phase);
      if (i > 0) {
        ha += Math.round(d.peakHa * i);
        count++;
      }
    }
    return { totalHa: ha, affectedCount: count };
  }, [idx]);

  /* Max intensity across all munis (for river styling) */
  const maxI = useMemo(() => {
    let m = 0;
    for (const d of Object.values(FLOOD)) {
      const i = intensity(idx, d.phase);
      if (i > m) m = i;
    }
    return m;
  }, [idx]);

  /* River visual level (quantised so GeoJSON doesn't remount every frame) */
  const riverLevel = maxI <= 0 ? 0 : maxI < 0.3 ? 1 : maxI < 0.6 ? 2 : 3;

  /* Auto-play */
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setIdx((prev) => {
        if (prev >= DATES.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing]);

  const reset = useCallback(() => {
    setPlaying(false);
    setIdx(0);
  }, []);

  return (
    <div className="space-y-3" data-testid="flood-map">
      <div
        className="rounded-xl overflow-hidden border border-zinc-800 relative"
        style={{ height: 520 }}
      >
        <MapContainer
          center={[8.75, -75.88]}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          minZoom={7}
          maxZoom={12}
          attributionControl={false}
        >
          {/* Satellite basemap */}
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />

          {/* Municipality flood fill — key forces re-render per date */}
          <GeoJSON
            key={`flood-${idx}`}
            data={boundaries as GeoJSON.FeatureCollection}
            style={(feature) => {
              if (!feature?.properties)
                return { fillOpacity: 0, color: '#475569', weight: 0.5 };
              const key = norm(feature.properties.shapeName);
              const data = FLOOD[key];
              if (!data)
                return {
                  fillOpacity: 0,
                  color: '#475569',
                  weight: 0.5,
                  dashArray: '3 2',
                };
              const i = intensity(idx, data.phase);
              return {
                fillColor: floodColor(i),
                fillOpacity: i * 0.7,
                color: i > 0.3 ? '#2563eb' : '#64748b',
                weight: i > 0.3 ? 1.5 : 0.5,
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

          {/* Main rivers — thicker & brighter during flood */}
          <GeoJSON
            key={`rivers-${riverLevel}`}
            data={mainRiverData as GeoJSON.FeatureCollection}
            style={() => {
              const w = [1, 1.5, 2.5, 4][riverLevel];
              const o = [0.3, 0.45, 0.7, 0.9][riverLevel];
              const c = riverLevel >= 2 ? '#3b82f6' : '#06b6d4';
              return { color: c, weight: w, opacity: o };
            }}
          />
        </MapContainer>

        {/* ── Overlays ── */}

        {/* Date badge */}
        <div className="absolute top-3 left-3 z-[1000]">
          <div
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold backdrop-blur shadow-lg ${
              isPeak
                ? 'bg-red-600/90 text-white'
                : 'bg-zinc-900/80 text-zinc-200 border border-zinc-700'
            }`}
          >
            {fmt.format(new Date(date + 'T12:00:00'))} 2026
            {isPeak && (
              <span className="ml-2 text-xs font-normal opacity-90">
                Inundacion activa
              </span>
            )}
          </div>
        </div>

        {/* Live stats */}
        <div className="absolute top-3 right-3 z-[1000] bg-zinc-900/90 backdrop-blur border border-zinc-700 rounded-lg px-3 py-2 text-right">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
            Total inundado
          </div>
          <div className="text-lg font-bold text-blue-400">
            {totalHa.toLocaleString()} ha
          </div>
          <div className="text-[10px] text-zinc-500">
            {affectedCount}/30 municipios
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 z-[1000] bg-zinc-900/90 backdrop-blur border border-zinc-700 rounded-lg px-3 py-2.5 text-[11px]">
          <div className="text-zinc-400 font-medium mb-1.5">
            Severidad de inundacion
          </div>
          <div className="space-y-1">
            {[
              { color: '#1d4ed8', label: 'Critica (> 20,000 ha)' },
              { color: '#3b82f6', label: 'Alta (5,000–20,000 ha)' },
              { color: '#60a5fa', label: 'Moderada (2,000–5,000 ha)' },
              { color: '#93c5fd', label: 'Baja (500–2,000 ha)' },
              { color: '#bfdbfe', label: 'Minima (< 500 ha)' },
            ].map(({ color, label }) => (
              <div key={color} className="flex items-center gap-2">
                <span
                  className="w-4 h-3 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-zinc-300">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-zinc-700">
              <span className="w-4 h-0.5 rounded bg-blue-500" />
              <span className="text-zinc-300">
                Rios Sinu, San Jorge, Canalete
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Playback controls ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
          aria-label="Reiniciar"
        >
          <RefreshCw size={14} />
        </button>
        <button
          onClick={() => setPlaying(!playing)}
          className={`p-2 rounded-lg text-white transition-colors ${
            playing
              ? 'bg-red-600 hover:bg-red-500'
              : 'bg-blue-600 hover:bg-blue-500'
          }`}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <input
          type="range"
          min={0}
          max={DATES.length - 1}
          value={idx}
          onChange={(e) => {
            setPlaying(false);
            setIdx(Number(e.target.value));
          }}
          className="flex-1 accent-blue-500 h-2"
          aria-label="Fecha"
        />
      </div>
      <div className="flex justify-between text-[11px] text-zinc-500 px-1">
        <span>15 Ene</span>
        <span className="text-red-400 font-medium">Pico: 8–11 Feb</span>
        <span>4 Mar</span>
      </div>
    </div>
  );
}
