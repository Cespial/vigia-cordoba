'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtendedForecastProps {
  lat: number;
  lon: number;
  title?: string;
}

interface DailyForecast {
  time: string[];
  precipitation_sum: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  weathercode: number[];
}

interface ForecastDay {
  date: string;
  dayName: string;
  dateLabel: string;
  icon: string;
  description: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  probability: number;
  alertLevel: 'normal' | 'amber' | 'red';
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

/**
 * Map WMO weathercode to a simple text icon and description.
 * See: https://open-meteo.com/en/docs#weathervariables
 */
function weathercodeToIcon(code: number): { icon: string; description: string } {
  if (code === 0) return { icon: '\u2600\uFE0F', description: 'Despejado' };
  if (code === 1) return { icon: '\uD83C\uDF24\uFE0F', description: 'Mayormente despejado' };
  if (code === 2) return { icon: '\u26C5', description: 'Parcialmente nublado' };
  if (code === 3) return { icon: '\u2601\uFE0F', description: 'Nublado' };
  if (code === 45 || code === 48) return { icon: '\uD83C\uDF2B\uFE0F', description: 'Niebla' };
  if (code >= 51 && code <= 55) return { icon: '\uD83C\uDF26\uFE0F', description: 'Llovizna' };
  if (code >= 56 && code <= 57) return { icon: '\uD83C\uDF28\uFE0F', description: 'Llovizna helada' };
  if (code >= 61 && code <= 65) return { icon: '\uD83C\uDF27\uFE0F', description: 'Lluvia' };
  if (code >= 66 && code <= 67) return { icon: '\uD83C\uDF28\uFE0F', description: 'Lluvia helada' };
  if (code >= 71 && code <= 77) return { icon: '\u2744\uFE0F', description: 'Nieve' };
  if (code >= 80 && code <= 82) return { icon: '\uD83C\uDF27\uFE0F', description: 'Chubascos' };
  if (code >= 85 && code <= 86) return { icon: '\uD83C\uDF28\uFE0F', description: 'Chubascos de nieve' };
  if (code === 95) return { icon: '\u26C8\uFE0F', description: 'Tormenta eléctrica' };
  if (code >= 96 && code <= 99) return { icon: '\u26C8\uFE0F', description: 'Tormenta con granizo' };
  return { icon: '\u2601\uFE0F', description: 'Desconocido' };
}

function getAlertLevel(precipitation: number): 'normal' | 'amber' | 'red' {
  if (precipitation > 70) return 'red';
  if (precipitation > 40) return 'amber';
  return 'normal';
}

export default function ExtendedForecast({
  lat,
  lon,
  title = 'Pronóstico Extendido — 7 Días',
}: ExtendedForecastProps) {
  const [data, setData] = useState<{ daily: DailyForecast } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/forecast-extended?lat=${lat}&lon=${lon}`)
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(setData)
      .catch(() => {
        setData(null);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [lat, lon]);

  const forecastDays: ForecastDay[] = useMemo(() => {
    if (!data?.daily) return [];

    const daily = data.daily;
    return daily.time.map((t, i) => {
      const date = new Date(t + 'T12:00:00');
      const dayName = DAY_NAMES[date.getDay()];
      const dateLabel = `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
      const { icon, description } = weathercodeToIcon(daily.weathercode[i]);
      const precipitation = daily.precipitation_sum[i] ?? 0;

      return {
        date: t,
        dayName,
        dateLabel,
        icon,
        description,
        tempMax: daily.temperature_2m_max[i] ?? 0,
        tempMin: daily.temperature_2m_min[i] ?? 0,
        precipitation,
        probability: daily.precipitation_probability_max[i] ?? 0,
        alertLevel: getAlertLevel(precipitation),
      };
    });
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      </Card>
    );
  }

  if (error || forecastDays.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <p className="text-sm text-zinc-400 text-center py-6">
          No se pudo cargar el pronóstico extendido
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            {title}
          </span>
        </CardTitle>
        <span className="text-xs text-zinc-400">Datos de Open-Meteo</span>
      </CardHeader>
      <div
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3"
        data-testid="forecast-grid"
      >
        {forecastDays.map((day) => (
          <div
            key={day.date}
            data-testid="forecast-day-card"
            className={cn(
              'rounded-lg border p-3 text-center transition-colors',
              day.alertLevel === 'red'
                ? 'border-red-500/60 bg-red-950/30'
                : day.alertLevel === 'amber'
                  ? 'border-amber-500/60 bg-amber-950/30'
                  : 'border-zinc-700 bg-zinc-800/50'
            )}
          >
            {/* Day name */}
            <div className="text-xs font-semibold text-zinc-300 uppercase">
              {day.dayName}
            </div>
            {/* Date */}
            <div className="text-[11px] text-zinc-500 mb-1">{day.dateLabel}</div>
            {/* Weather icon */}
            <div className="text-2xl my-1.5" role="img" aria-label={day.description}>
              {day.icon}
            </div>
            {/* Temperatures */}
            <div className="flex items-center justify-center gap-1.5 text-sm mb-1.5">
              <span className="font-bold text-zinc-100">
                {day.tempMax.toFixed(0)}°
              </span>
              <span className="text-zinc-500">
                {day.tempMin.toFixed(0)}°
              </span>
            </div>
            {/* Precipitation */}
            <div
              className={cn(
                'text-xs font-medium',
                day.alertLevel === 'red'
                  ? 'text-red-400'
                  : day.alertLevel === 'amber'
                    ? 'text-amber-400'
                    : 'text-blue-400'
              )}
            >
              {day.precipitation.toFixed(1)} mm
            </div>
            {/* Probability */}
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {day.probability}% prob.
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
