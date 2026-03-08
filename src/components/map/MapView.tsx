'use client';

import { useRef, useCallback, useState } from 'react';
import MapGL, { Marker, Popup, NavigationControl, ScaleControl, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { municipalities, monitoringPoints, CORDOBA_BOUNDS } from '@/data/municipalities';
import { AlertDot } from '@/components/ui/AlertBadge';
import type { MunicipalAlert } from '@/types';
import { formatNumber } from '@/lib/utils';
import { Droplets, Activity, Radio } from 'lucide-react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapViewProps {
  alerts: MunicipalAlert[];
  onSelectMunicipality?: (slug: string) => void;
}

interface PopupInfo {
  name: string;
  lat: number;
  lon: number;
  type: 'municipality' | 'monitoring';
  alert?: MunicipalAlert;
  monitorType?: string;
}

export default function MapView({ alerts, onSelectMunicipality }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  const alertMap = new Map(alerts.map(a => [a.municipality.slug, a]));

  const handleMunicipalityClick = useCallback((slug: string) => {
    onSelectMunicipality?.(slug);
  }, [onSelectMunicipality]);

  return (
    <div className="h-full w-full relative">
      <MapGL
        ref={mapRef}
        initialViewState={{
          latitude: CORDOBA_BOUNDS.center.lat,
          longitude: CORDOBA_BOUNDS.center.lon,
          zoom: 7.5,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        maxBounds={[
          [CORDOBA_BOUNDS.west - 0.5, CORDOBA_BOUNDS.south - 0.5],
          [CORDOBA_BOUNDS.east + 0.5, CORDOBA_BOUNDS.north + 0.5],
        ]}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-right" unit="metric" />

        {/* Municipality markers */}
        {municipalities.map((muni) => {
          const alert = alertMap.get(muni.slug);
          const level = alert?.alertLevel.level ?? 'verde';
          return (
            <Marker
              key={muni.slug}
              latitude={muni.lat}
              longitude={muni.lon}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupInfo({
                  name: muni.name,
                  lat: muni.lat,
                  lon: muni.lon,
                  type: 'municipality',
                  alert,
                });
              }}
            >
              <button
                className="cursor-pointer hover:scale-125 transition-transform"
                onClick={() => handleMunicipalityClick(muni.slug)}
              >
                <AlertDot level={level} size={muni.priority === 'Alta' ? 16 : muni.priority === 'Media' ? 12 : 8} />
              </button>
            </Marker>
          );
        })}

        {/* Monitoring points */}
        {monitoringPoints.map((point) => (
          <Marker
            key={point.name}
            latitude={point.lat}
            longitude={point.lon}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupInfo({
                name: point.name,
                lat: point.lat,
                lon: point.lon,
                type: 'monitoring',
                monitorType: point.type,
              });
            }}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white shadow-lg border border-blue-400">
              {point.type === 'hidroelectrica' ? (
                <Activity size={14} />
              ) : point.type === 'estacion' ? (
                <Radio size={14} />
              ) : (
                <Droplets size={14} />
              )}
            </div>
          </Marker>
        ))}

        {/* Popup */}
        {popupInfo && (
          <Popup
            latitude={popupInfo.lat}
            longitude={popupInfo.lon}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            className="vigia-popup"
          >
            <div className="p-1 min-w-[180px]">
              <h4 className="font-bold text-zinc-900 text-sm mb-1">{popupInfo.name}</h4>
              {popupInfo.type === 'municipality' && popupInfo.alert && (
                <div className="space-y-1 text-xs text-zinc-600">
                  <div className="flex items-center gap-1">
                    <AlertDot level={popupInfo.alert.alertLevel.level} size={8} />
                    <span className="font-medium">{popupInfo.alert.alertLevel.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets size={12} />
                    <span>Precip. 24h: {formatNumber(popupInfo.alert.precipitationForecast24h, 1)} mm</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity size={12} />
                    <span>Caudal: {formatNumber(popupInfo.alert.riverDischarge, 1)} m³/s</span>
                  </div>
                  <div className="text-zinc-400 mt-1">
                    Cuenca: {popupInfo.alert.municipality.cuenca}
                  </div>
                </div>
              )}
              {popupInfo.type === 'monitoring' && (
                <div className="text-xs text-zinc-600">
                  <span className="capitalize">{popupInfo.monitorType?.replace('_', ' ')}</span>
                  <div className="text-zinc-400">
                    {popupInfo.lat.toFixed(4)}°N, {Math.abs(popupInfo.lon).toFixed(4)}°W
                  </div>
                </div>
              )}
            </div>
          </Popup>
        )}
      </MapGL>
    </div>
  );
}
