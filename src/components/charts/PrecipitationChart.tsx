'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWeather } from '@/lib/hooks';
import { formatShortDate } from '@/lib/utils';
import { CloudRain } from 'lucide-react';

interface PrecipitationChartProps {
  lat: number;
  lon: number;
  title?: string;
}

export default function PrecipitationChart({ lat, lon, title = 'Precipitación' }: PrecipitationChartProps) {
  const { data, loading } = useWeather(lat, lon);

  const chartData = useMemo(() => {
    if (!data?.daily) return [];
    const daily = data.daily as { time: string[]; precipitation_sum: number[] };
    return daily.time.map((t: string, i: number) => ({
      date: formatShortDate(t),
      fullDate: t,
      precipitation: daily.precipitation_sum[i] ?? 0,
    }));
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <Skeleton className="h-48 w-full" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <CloudRain size={16} className="text-blue-500" />
            {title}
          </span>
        </CardTitle>
        <span className="text-xs text-zinc-400">mm/día — próximos 7 días</span>
      </CardHeader>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="precipGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: 12,
                color: '#e5e7eb',
              }}
              formatter={(value) => [`${Number(value).toFixed(1)} mm`, 'Precipitación']}
            />
            <ReferenceLine y={40} stroke="#f97316" strokeDasharray="5 5" label={{ value: 'Alerta IDEAM', fill: '#f97316', fontSize: 10 }} />
            <ReferenceLine y={70} stroke="#dc2626" strokeDasharray="5 5" label={{ value: 'Alerta Roja', fill: '#dc2626', fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="precipitation"
              stroke="#3b82f6"
              fill="url(#precipGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
