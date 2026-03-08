'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/dashboard/Header';
import PrecipitationChart from '@/components/charts/PrecipitationChart';
import FloodChart from '@/components/charts/FloodChart';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertBadge } from '@/components/ui/AlertBadge';
import { municipalities } from '@/data/municipalities';
import { useAlerts, useWeather } from '@/lib/hooks';
import { formatNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ArrowLeft, MapPin, Users, Droplets, Activity,
  Thermometer, Wind, Navigation, Shield, AlertTriangle,
  Phone, Map, Radio, Home as HomeIcon
} from 'lucide-react';
import { recommendations, emergencyContacts } from '@/data/recommendations';

export default function MunicipioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const municipality = municipalities.find(m => m.slug === slug);

  if (!municipality) {
    notFound();
  }

  const { alerts, loading: alertsLoading } = useAlerts();
  const { data: weatherData, loading: weatherLoading } = useWeather(municipality.lat, municipality.lon);

  const alert = alerts.find(a => a.municipality.slug === slug);

  const currentWeather = weatherData?.hourly ? (() => {
    const hourly = weatherData.hourly as {
      time: string[];
      temperature_2m: number[];
      relative_humidity_2m: number[];
      wind_speed_10m: number[];
      precipitation: number[];
    };
    const now = new Date();
    const currentHourIndex = hourly.time.findIndex((t: string) => new Date(t) >= now) - 1;
    const idx = Math.max(0, currentHourIndex);
    return {
      temperature: hourly.temperature_2m[idx],
      humidity: hourly.relative_humidity_2m[idx],
      windSpeed: hourly.wind_speed_10m[idx],
      precipitation: hourly.precipitation[idx],
    };
  })() : null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Header />
      <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Volver al mapa
        </Link>

        {/* Municipality header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-zinc-100">{municipality.name}</h2>
            {alert && !alertsLoading && (
              <AlertBadge alert={alert.alertLevel} size="md" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {municipality.cuenca}
            </span>
            <span className="flex items-center gap-1">
              <Users size={14} /> {formatNumber(municipality.population || 0)} hab.
            </span>
            <span className="flex items-center gap-1">
              <Navigation size={14} /> {municipality.lat.toFixed(4)}°N, {Math.abs(municipality.lon).toFixed(4)}°W
            </span>
          </div>
        </div>

        {/* Current conditions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {weatherLoading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)
          ) : currentWeather ? (
            <>
              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer size={16} className="text-red-400" />
                  <span className="text-xs text-zinc-400">Temperatura</span>
                </div>
                <div className="text-xl font-bold text-zinc-100">
                  {currentWeather.temperature?.toFixed(1) ?? '-'}°C
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <Droplets size={16} className="text-blue-400" />
                  <span className="text-xs text-zinc-400">Humedad</span>
                </div>
                <div className="text-xl font-bold text-zinc-100">
                  {currentWeather.humidity?.toFixed(0) ?? '-'}%
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <Wind size={16} className="text-teal-400" />
                  <span className="text-xs text-zinc-400">Viento</span>
                </div>
                <div className="text-xl font-bold text-zinc-100">
                  {currentWeather.windSpeed?.toFixed(1) ?? '-'} km/h
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <Droplets size={16} className="text-cyan-400" />
                  <span className="text-xs text-zinc-400">Precip. actual</span>
                </div>
                <div className="text-xl font-bold text-zinc-100">
                  {currentWeather.precipitation?.toFixed(1) ?? '0'} mm
                </div>
              </Card>
            </>
          ) : (
            <Card className="col-span-4">
              <p className="text-sm text-zinc-400 text-center py-4">No se pudieron cargar los datos meteorológicos</p>
            </Card>
          )}
        </div>

        {/* Alert details */}
        {alert && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Detalle de Alerta
                </span>
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-zinc-400">Nivel de alerta</span>
                <div className="mt-1"><AlertBadge alert={alert.alertLevel} /></div>
                <p className="text-xs text-zinc-500 mt-1">{alert.alertLevel.description}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-400">Precipitación próx. 24h</span>
                <div className="text-lg font-bold text-zinc-100 mt-1">
                  {formatNumber(alert.precipitationForecast24h, 1)} mm
                </div>
                <p className="text-xs text-zinc-500">Umbral IDEAM: 40 mm (naranja), 70 mm (rojo)</p>
              </div>
              <div>
                <span className="text-xs text-zinc-400">Caudal estimado</span>
                <div className="text-lg font-bold text-zinc-100 mt-1">
                  {formatNumber(alert.riverDischarge, 1)} m³/s
                </div>
                <p className="text-xs text-zinc-500">Umbral: 600 m³/s (naranja), 1200 m³/s (rojo)</p>
              </div>
            </div>
          </Card>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <PrecipitationChart
            lat={municipality.lat}
            lon={municipality.lon}
            title={`Precipitación — ${municipality.name}`}
          />
          <FloodChart
            lat={municipality.lat}
            lon={municipality.lon}
            title={`Caudal — ${municipality.name}`}
          />
        </div>

        {/* Recommendations */}
        {alert && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Shield size={16} className="text-blue-500" />
                  Recomendaciones
                </span>
              </CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {recommendations[alert.alertLevel.level].map((rec, i) => {
                const iconMap = {
                  shield: <Shield size={14} className="text-blue-400 shrink-0" />,
                  alert: <AlertTriangle size={14} className="text-orange-400 shrink-0" />,
                  phone: <Phone size={14} className="text-green-400 shrink-0" />,
                  map: <Map size={14} className="text-cyan-400 shrink-0" />,
                  radio: <Radio size={14} className="text-purple-400 shrink-0" />,
                  home: <HomeIcon size={14} className="text-yellow-400 shrink-0" />,
                };
                return (
                  <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    {iconMap[rec.icon]}
                    <span>{rec.action}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Emergency contacts */}
        {alert && alert.alertLevel.level !== 'verde' && (
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Phone size={16} className="text-green-500" />
                  Contactos de Emergencia
                </span>
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {emergencyContacts.map(c => (
                <div key={c.number} className="flex items-center gap-2 rounded-lg border border-zinc-700 p-2">
                  <Phone size={14} className="text-green-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-200 truncate">{c.name}</div>
                    <div className="text-xs text-zinc-400">{c.number}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
