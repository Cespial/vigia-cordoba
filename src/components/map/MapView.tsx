'use client';

import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { municipalities, monitoringPoints, CORDOBA_BOUNDS } from '@/data/municipalities';
import type { MunicipalAlert } from '@/types';
import { formatNumber } from '@/lib/utils';
import { alertLevels } from '@/data/thresholds';
import MapLegend from './MapLegend';
import Link from 'next/link';

// Tile layers
const SATELLITE_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const SATELLITE_ATTR = 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics';
const LABELS_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

const alertColors: Record<string, string> = {
  rojo: '#ef4444',
  naranja: '#f97316',
  amarillo: '#eab308',
  verde: '#22c55e',
};

const monitoringColor = '#2563eb';

function createAlertIcon(level: string, priority: string): L.DivIcon {
  const size = priority === 'Alta' ? 18 : priority === 'Media' ? 14 : 10;
  const color = alertColors[level] || alertColors.verde;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 6px ${color}80;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createMonitoringIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:24px;height:24px;background:${monitoringColor};border-radius:6px;border:2px solid #60a5fa;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Component to set bounds
function SetBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([
      [CORDOBA_BOUNDS.south, CORDOBA_BOUNDS.west],
      [CORDOBA_BOUNDS.north, CORDOBA_BOUNDS.east],
    ], { padding: [20, 20] });
  }, [map]);
  return null;
}

interface MapViewProps {
  alerts: MunicipalAlert[];
  onSelectMunicipality?: (slug: string) => void;
}

export default function MapView({ alerts }: MapViewProps) {
  const [useSatellite, setUseSatellite] = useState(true);
  const alertMap = new Map(alerts.map(a => [a.municipality.slug, a]));

  return (
    <div className="h-full w-full relative" style={{ minHeight: '400px' }}>
      <MapLegend />

      {/* Layer toggle */}
      <div className="absolute top-3 right-3 z-[1000] flex gap-1 rounded-lg border border-zinc-700 bg-zinc-900/90 backdrop-blur p-1">
        <button
          onClick={() => setUseSatellite(true)}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
            useSatellite
              ? 'bg-blue-600 text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Satélite
        </button>
        <button
          onClick={() => setUseSatellite(false)}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
            !useSatellite
              ? 'bg-blue-600 text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Mapa
        </button>
      </div>

      <MapContainer
        center={[CORDOBA_BOUNDS.center.lat, CORDOBA_BOUNDS.center.lon]}
        zoom={8}
        zoomControl={false}
        style={{ width: '100%', height: '100%', background: '#0a0a0a' }}
        maxBounds={[
          [CORDOBA_BOUNDS.south - 0.5, CORDOBA_BOUNDS.west - 0.5],
          [CORDOBA_BOUNDS.north + 0.5, CORDOBA_BOUNDS.east + 0.5],
        ]}
        minZoom={7}
        maxZoom={16}
      >
        <SetBounds />
        <ZoomControl position="bottomright" />

        {/* Base layer */}
        {useSatellite ? (
          <>
            <TileLayer url={SATELLITE_TILES} attribution={SATELLITE_ATTR} />
            <TileLayer url={LABELS_TILES} />
          </>
        ) : (
          <TileLayer url={DARK_TILES} attribution={DARK_ATTR} />
        )}

        {/* Municipality markers */}
        {municipalities.map((muni) => {
          const alert = alertMap.get(muni.slug);
          const level = alert?.alertLevel.level ?? 'verde';
          const alertData = alert ? alertLevels[alert.alertLevel.level] : alertLevels.verde;

          return (
            <Marker
              key={muni.slug}
              position={[muni.lat, muni.lon]}
              icon={createAlertIcon(level, muni.priority)}
            >
              <Popup className="sat-popup">
                <div className="min-w-[180px]">
                  <h4 className="font-bold text-sm mb-1">{muni.name}</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: alertData.color }}
                      />
                      <span className="font-medium">{alertData.label}</span>
                    </div>
                    {alert && (
                      <>
                        <div>Precip. 24h: {formatNumber(alert.precipitationForecast24h, 1)} mm</div>
                        <div>Caudal: {formatNumber(alert.riverDischarge, 1)} m³/s</div>
                      </>
                    )}
                    <div className="text-zinc-500">Cuenca: {muni.cuenca}</div>
                    <div className="text-zinc-500">Población: {formatNumber(muni.population || 0)}</div>
                    <Link
                      href={`/municipio/${muni.slug}`}
                      className="inline-block mt-1 text-blue-400 hover:text-blue-300 underline"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Monitoring points */}
        {monitoringPoints.map((point) => (
          <Marker
            key={point.name}
            position={[point.lat, point.lon]}
            icon={createMonitoringIcon()}
          >
            <Popup className="sat-popup">
              <div className="min-w-[150px]">
                <h4 className="font-bold text-sm mb-1">{point.name}</h4>
                <div className="text-xs">
                  <div className="capitalize">{point.type.replace('_', ' ')}</div>
                  <div className="text-zinc-500">
                    {point.lat.toFixed(4)}°N, {Math.abs(point.lon).toFixed(4)}°W
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
