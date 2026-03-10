'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import boundaries from '@/data/cordoba-boundaries.json';
import { Play, Pause, RefreshCw } from 'lucide-react';

const FLOOD_DATES = [
  '2026-01-15', '2026-01-18', '2026-01-21', '2026-01-24', '2026-01-27',
  '2026-01-30', '2026-02-02', '2026-02-05', '2026-02-08', '2026-02-11',
  '2026-02-14', '2026-02-17', '2026-02-20', '2026-02-23', '2026-02-26',
  '2026-03-01', '2026-03-04',
];

const PEAK_START = 7; // Feb 5
const PEAK_END = 10;  // Feb 11

const ESRI_SAT =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const modisFloodUrl = (d: string) =>
  `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Combined_Flood_3-Day/default/${d}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`;

const modisTrueColorUrl = (d: string) =>
  `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${d}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;

const fmt = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });

const boundaryStyle = () => ({
  color: '#94a3b8',
  weight: 1,
  fillOpacity: 0,
  dashArray: '4 2',
});

export default function FloodMap() {
  const [idx, setIdx] = useState(8); // start at Feb 8 (peak)
  const [playing, setPlaying] = useState(false);
  const [showTrueColor, setShowTrueColor] = useState(false);

  const date = FLOOD_DATES[idx];
  const isPeak = idx >= PEAK_START && idx <= PEAK_END;

  /* Auto-play animation */
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setIdx((prev) => {
        if (prev >= FLOOD_DATES.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(id);
  }, [playing]);

  const reset = useCallback(() => {
    setPlaying(false);
    setIdx(0);
  }, []);

  return (
    <div className="space-y-3" data-testid="flood-map">
      {/* Map container */}
      <div
        className="rounded-xl overflow-hidden border border-zinc-800 relative"
        style={{ height: 500 }}
      >
        <MapContainer
          center={[8.75, -75.88]}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          minZoom={7}
          maxZoom={9}
          attributionControl={false}
        >
          {/* Base layer */}
          {showTrueColor ? (
            <TileLayer key={`tc-${date}`} url={modisTrueColorUrl(date)} maxZoom={9} />
          ) : (
            <TileLayer url={ESRI_SAT} />
          )}

          {/* MODIS flood detection overlay */}
          <TileLayer
            key={`flood-${date}`}
            url={modisFloodUrl(date)}
            opacity={0.85}
            maxZoom={9}
          />

          {/* Municipal boundaries */}
          <GeoJSON
            data={boundaries as GeoJSON.FeatureCollection}
            style={boundaryStyle}
          />
        </MapContainer>

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

        {/* Base layer toggle */}
        <button
          onClick={() => setShowTrueColor(!showTrueColor)}
          className="absolute top-3 right-3 z-[1000] px-2.5 py-1.5 rounded-lg text-[11px] font-medium backdrop-blur transition-colors bg-zinc-900/80 border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          {showTrueColor ? 'Satelite Esri' : 'MODIS True Color'}
        </button>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 z-[1000] bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-lg px-3 py-2 text-[11px] space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-zinc-300">Agua detectada (MODIS)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-cyan-300/60" />
            <span className="text-zinc-300">Posible inundacion</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm border border-zinc-500"
              style={{ borderStyle: 'dashed' }}
            />
            <span className="text-zinc-300">Limites municipales</span>
          </div>
        </div>
      </div>

      {/* Playback controls */}
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
          aria-label={playing ? 'Pausar' : 'Reproducir animacion'}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <input
          type="range"
          min={0}
          max={FLOOD_DATES.length - 1}
          value={idx}
          onChange={(e) => {
            setPlaying(false);
            setIdx(Number(e.target.value));
          }}
          className="flex-1 accent-blue-500 h-2"
          aria-label="Fecha de la imagen satelital"
        />
      </div>

      {/* Date labels */}
      <div className="flex justify-between text-[11px] text-zinc-500 px-1">
        <span>15 Ene</span>
        <span className="text-red-400 font-medium">Pico: 8-11 Feb</span>
        <span>4 Mar</span>
      </div>
    </div>
  );
}
