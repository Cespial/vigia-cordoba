'use client';

import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useFlood } from '@/lib/hooks';
import { formatShortDate } from '@/lib/utils';
import { Activity } from 'lucide-react';

interface FloodChartProps {
  lat: number;
  lon: number;
  title?: string;
}

export default function FloodChart({ lat, lon, title = 'Caudal del Río' }: FloodChartProps) {
  const { data, loading } = useFlood(lat, lon);

  const chartData = useMemo(() => {
    if (!data?.daily) return [];
    const daily = data.daily as { time: string[]; river_discharge: number[] };
    return daily.time.map((t: string, i: number) => ({
      date: formatShortDate(t),
      fullDate: t,
      discharge: daily.river_discharge[i] ?? 0,
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
            <Activity size={16} className="text-cyan-500" />
            {title}
          </span>
        </CardTitle>
        <span className="text-xs text-zinc-400">m³/s — 90 días + 30 pronóstico</span>
      </CardHeader>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              interval={Math.floor(chartData.length / 8)}
            />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: 12,
                color: '#e5e7eb',
              }}
              formatter={(value) => [`${Number(value).toFixed(1)} m³/s`, 'Caudal']}
            />
            <ReferenceLine y={600} stroke="#f97316" strokeDasharray="5 5" label={{ value: 'Alerta Naranja', fill: '#f97316', fontSize: 10 }} />
            <ReferenceLine y={1200} stroke="#dc2626" strokeDasharray="5 5" label={{ value: 'Alerta Roja', fill: '#dc2626', fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="discharge"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
