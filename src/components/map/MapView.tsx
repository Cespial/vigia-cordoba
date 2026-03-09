'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap, GeoJSON, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { municipalities, monitoringPoints, CORDOBA_BOUNDS, cuencas } from '@/data/municipalities';
import type { MunicipalAlert } from '@/types';
import { formatNumber } from '@/lib/utils';
import { alertLevels } from '@/data/thresholds';
import { computeRiskScores, getRiskColor, getRiskLabel } from '@/lib/risk-score';
import MapLegend from './MapLegend';
import LayerControl, { type MapLayer } from './LayerControl';
import Link from 'next/link';

// Data imports
import boundariesData from '@/data/cordoba-boundaries.json';
import riversData from '@/data/cordoba-rivers.json';
import stationsData from '@/data/ideam-stations.json';

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

function createStationIcon(active: boolean): L.DivIcon {
  const color = active ? '#10b981' : '#6b7280';
  return L.divIcon({
    className: '',
    html: `<div style="width:8px;height:8px;background:${color};border-radius:50%;border:1.5px solid rgba(255,255,255,0.6);"></div>`,
    iconSize: [8, 8],
    iconAnchor: [4, 4],
  });
}

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

// Map municipality names to cuenca colors
function getCuencaColor(muniName: string): string {
  const muni = municipalities.find(m =>
    muniName.toLowerCase().includes(m.name.toLowerCase()) ||
    m.name.toLowerCase().includes(muniName.toLowerCase())
  );
  if (!muni) return '#374151';
  const cuenca = cuencas.find(c => c.name === muni.cuenca);
  return cuenca?.color || '#374151';
}

interface MapViewProps {
  alerts: MunicipalAlert[];
  onSelectMunicipality?: (slug: string) => void;
}

export default function MapView({ alerts }: MapViewProps) {
  const [useSatellite, setUseSatellite] = useState(true);
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'boundaries', label: 'Límites municipales', color: '#60a5fa', visible: true },
    { id: 'rivers', label: 'Red hídrica', color: '#38bdf8', visible: true },
    { id: 'stations', label: 'Estaciones IDEAM', color: '#10b981', visible: false },
    { id: 'alerts', label: 'Alertas municipales', color: '#f97316', visible: true },
    { id: 'monitoring', label: 'Puntos monitoreo', color: '#2563eb', visible: true },
    { id: 'risk', label: 'Riesgo', color: '#a855f7', visible: false },
  ]);

  const alertMap = useMemo(() => new Map(alerts.map(a => [a.municipality.slug, a])), [alerts]);

  const riskScores = useMemo(() => computeRiskScores(alerts), [alerts]);
  const riskMap = useMemo(() => new Map(riskScores.map(r => [r.slug, r])), [riskScores]);

  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l));
  }, []);

  const isVisible = useCallback((id: string) => layers.find(l => l.id === id)?.visible ?? true, [layers]);

  const riskLayerActive = isVisible('risk');

  // Style for municipality boundaries
  const boundaryStyle = useCallback((feature: GeoJSON.Feature | undefined) => {
    const name = feature?.properties?.shapeName || '';
    const muni = municipalities.find(m =>
      name.toLowerCase().includes(m.name.toLowerCase()) ||
      m.name.toLowerCase().includes(name.toLowerCase())
    );

    // Risk layer mode
    if (riskLayerActive && muni) {
      const risk = riskMap.get(muni.slug);
      const riskColor = risk ? getRiskColor(risk.score) : '#374151';
      return {
        color: riskColor,
        weight: 2,
        opacity: 0.8,
        fillColor: riskColor,
        fillOpacity: 0.25,
      };
    }

    // Default alert-based coloring
    const alert = muni ? alertMap.get(muni.slug) : undefined;
    const level = alert?.alertLevel.level ?? 'verde';
    const color = alertColors[level] || '#374151';
    const cuencaColor = getCuencaColor(name);

    return {
      color: alert ? color : cuencaColor,
      weight: alert && level !== 'verde' ? 2 : 1,
      opacity: alert && level !== 'verde' ? 0.8 : 0.4,
      fillColor: alert ? color : cuencaColor,
      fillOpacity: alert && level !== 'verde' ? 0.15 : 0.05,
    };
  }, [alertMap, riskLayerActive, riskMap]);

  // Style for river lines
  const riverStyle = useCallback(() => ({
    color: '#38bdf8',
    weight: 1.5,
    opacity: 0.6,
  }), []);

  // Filter stations data for typed usage
  const stations = stationsData as Array<{
    name: string;
    code: string;
    type: string;
    lat: number;
    lon: number;
    municipality: string;
    active: boolean;
    elevation: number | null;
  }>;

  return (
    <div className="h-full w-full relative" style={{ minHeight: '400px' }}>
      <MapLegend showRiskLegend={riskLayerActive} />
      <LayerControl layers={layers} onToggle={toggleLayer} />

      {/* Base layer toggle */}
      <div className="absolute top-3 right-3 z-[1000] flex gap-1 rounded-lg border border-zinc-700 bg-zinc-900/90 backdrop-blur p-1">
        <button
          onClick={() => setUseSatellite(true)}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
            useSatellite ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Satélite
        </button>
        <button
          onClick={() => setUseSatellite(false)}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
            !useSatellite ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
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

        {/* Municipality boundary polygons */}
        {isVisible('boundaries') && (
          <GeoJSON
            key={`boundaries-${riskLayerActive ? 'risk' : 'alert'}`}
            data={boundariesData as GeoJSON.FeatureCollection}
            style={boundaryStyle}
            onEachFeature={(feature, layer) => {
              const name = feature.properties?.shapeName || 'Desconocido';
              const muni = municipalities.find(m =>
                name.toLowerCase().includes(m.name.toLowerCase()) ||
                m.name.toLowerCase().includes(name.toLowerCase())
              );
              if (muni) {
                if (riskLayerActive) {
                  const risk = riskMap.get(muni.slug);
                  const score = risk?.score ?? 0;
                  const label = getRiskLabel(score);
                  layer.bindTooltip(
                    `<strong>${muni.name}</strong><br/>Riesgo: ${score} (${label})`,
                    {
                      permanent: false,
                      direction: 'center',
                      className: 'boundary-tooltip',
                    }
                  );
                } else {
                  layer.bindTooltip(muni.name, {
                    permanent: false,
                    direction: 'center',
                    className: 'boundary-tooltip',
                  });
                }
              }
            }}
          />
        )}

        {/* River network */}
        {isVisible('rivers') && (
          <GeoJSON
            key="rivers"
            data={riversData as GeoJSON.FeatureCollection}
            style={riverStyle}
            onEachFeature={(feature, layer) => {
              const name = feature.properties?.name;
              if (name) {
                layer.bindTooltip(name, {
                  permanent: false,
                  direction: 'auto',
                  className: 'river-tooltip',
                });
              }
            }}
          />
        )}

        {/* IDEAM stations */}
        {isVisible('stations') && stations.map((station) => (
          <Marker
            key={station.code}
            position={[station.lat, station.lon]}
            icon={createStationIcon(station.active)}
          >
            <Popup className="sat-popup">
              <div className="min-w-[160px]">
                <h4 className="font-bold text-xs mb-1">{station.name}</h4>
                <div className="text-[11px] space-y-0.5">
                  <div>Tipo: {station.type}</div>
                  <div>Código: {station.code}</div>
                  <div>Municipio: {station.municipality}</div>
                  <div className="flex items-center gap-1">
                    Estado:
                    <span className={station.active ? 'text-green-400' : 'text-zinc-500'}>
                      {station.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  {station.elevation && <div>Elevación: {station.elevation}m</div>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Municipality alert markers */}
        {isVisible('alerts') && municipalities.map((muni) => {
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
                <div className="min-w-[200px]">
                  <h4 className="font-bold text-sm mb-1">{muni.name}</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: alertData.color }}
                      />
                      <span className="font-medium">{alertData.label}</span>
                    </div>
                    {alert && (
                      <>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1">
                          <span className="text-zinc-400">Precip. 24h</span>
                          <span className="font-medium">{formatNumber(alert.precipitationForecast24h, 1)} mm</span>
                          <span className="text-zinc-400">Caudal</span>
                          <span className="font-medium">{formatNumber(alert.riverDischarge, 1)} m³/s</span>
                        </div>
                      </>
                    )}
                    <div className="text-zinc-500 mt-1">Cuenca: {muni.cuenca}</div>
                    <div className="text-zinc-500">Población: {formatNumber(muni.population || 0)}</div>
                    <div className="text-zinc-500">Prioridad: {muni.priority}</div>
                    <Link
                      href={`/municipio/${muni.slug}`}
                      className="inline-block mt-1.5 px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                    >
                      Ver detalle →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Monitoring points */}
        {isVisible('monitoring') && monitoringPoints.map((point) => (
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
