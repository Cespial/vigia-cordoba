'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatNumber } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { AlertTriangle, Calendar, Users, Home as HomeIcon, Wheat } from 'lucide-react';
import type { Emergency } from '@/types';

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#6366f1'];

export default function HistoricoPage() {
  const [emergencias, setEmergencias] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMunicipio, setFilterMunicipio] = useState<string>('all');
  const [tablePage, setTablePage] = useState(0);
  const PAGE_SIZE = 50;

  useEffect(() => {
    fetch('/api/emergencias?limit=2000')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setEmergencias(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const years = useMemo(() => {
    const ySet = new Set<string>();
    emergencias.forEach(e => {
      if (e.fecha) ySet.add(e.fecha.substring(0, 4));
    });
    return Array.from(ySet).sort().reverse();
  }, [emergencias]);

  const municipios = useMemo(() => {
    const mSet = new Set<string>();
    emergencias.forEach(e => {
      if (e.municipio) mSet.add(e.municipio);
    });
    return Array.from(mSet).sort();
  }, [emergencias]);

  const filtered = useMemo(() => {
    setTablePage(0);
    let result = emergencias;
    if (filterYear !== 'all') {
      result = result.filter(e => e.fecha?.startsWith(filterYear));
    }
    if (filterMunicipio !== 'all') {
      result = result.filter(e => e.municipio === filterMunicipio);
    }
    return result;
  }, [emergencias, filterYear, filterMunicipio]);

  const byMunicipio = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(e => {
      const mun = e.municipio || 'Sin dato';
      map[mun] = (map[mun] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [filtered]);

  const byYear = useMemo(() => {
    const map: Record<string, number> = {};
    emergencias.forEach(e => {
      if (e.fecha) {
        const y = e.fecha.substring(0, 4);
        map[y] = (map[y] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [emergencias]);

  const stats = useMemo(() => {
    let personas = 0, familias = 0, viviendas = 0;
    filtered.forEach(e => {
      personas += Number(e.personas_afectadas) || 0;
      familias += Number(e.familias_afectadas) || 0;
      viviendas += Number(e.viviendas_afectadas) || 0;
    });
    return { eventos: filtered.length, personas, familias, viviendas };
  }, [filtered]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Header />
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-100 mb-1">Análisis Histórico de Emergencias</h2>
          <p className="text-sm text-zinc-400">Datos de inundaciones en Córdoba — Fuente: datos.gov.co (UNGRD)</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label className="text-sm text-zinc-400 flex items-center gap-1.5">
            <Calendar size={14} /> Año:
          </label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Todos</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <label className="text-sm text-zinc-400 flex items-center gap-1.5 ml-2">
            Municipio:
          </label>
          <select
            value={filterMunicipio}
            onChange={(e) => setFilterMunicipio(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none max-w-[200px]"
          >
            <option value="all">Todos</option>
            {municipios.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          {(filterYear !== 'all' || filterMunicipio !== 'all') && (
            <button
              onClick={() => { setFilterYear('all'); setFilterMunicipio('all'); }}
              className="text-xs text-blue-400 hover:text-blue-300 underline ml-2"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={16} className="text-orange-500" />
                  <span className="text-xs text-zinc-400">Eventos</span>
                </div>
                <div className="text-2xl font-bold text-zinc-100">{formatNumber(stats.eventos)}</div>
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <Users size={16} className="text-blue-500" />
                  <span className="text-xs text-zinc-400">Personas afectadas</span>
                </div>
                <div className="text-2xl font-bold text-zinc-100">{formatNumber(stats.personas)}</div>
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <HomeIcon size={16} className="text-purple-500" />
                  <span className="text-xs text-zinc-400">Familias</span>
                </div>
                <div className="text-2xl font-bold text-zinc-100">{formatNumber(stats.familias)}</div>
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-1">
                  <Wheat size={16} className="text-yellow-500" />
                  <span className="text-xs text-zinc-400">Viviendas</span>
                </div>
                <div className="text-2xl font-bold text-zinc-100">{formatNumber(stats.viviendas)}</div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Events by year */}
              <Card>
                <CardHeader>
                  <CardTitle>Eventos por Año</CardTitle>
                </CardHeader>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byYear} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 12, color: '#e5e7eb' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Eventos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Events by municipality (pie) */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Municipios Afectados</CardTitle>
                </CardHeader>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byMunicipio.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="name"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {byMunicipio.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 12, color: '#e5e7eb' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Events by municipality bar chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Eventos por Municipio (Top 15)</CardTitle>
              </CardHeader>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byMunicipio} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} width={75} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 12, color: '#e5e7eb' }}
                    />
                    <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Eventos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Events table */}
            <Card>
              <CardHeader>
                <CardTitle>Registros de Emergencias</CardTitle>
                <span className="text-xs text-zinc-400">{filtered.length} registros</span>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-700 text-left text-xs text-zinc-400">
                      <th className="pb-2 pr-4">Fecha</th>
                      <th className="pb-2 pr-4">Municipio</th>
                      <th className="pb-2 pr-4">Tipo</th>
                      <th className="pb-2 pr-4 text-right">Personas</th>
                      <th className="pb-2 text-right">Familias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(tablePage * PAGE_SIZE, (tablePage + 1) * PAGE_SIZE).map((e, i) => (
                      <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                        <td className="py-2 pr-4 text-zinc-300">{e.fecha ? formatDate(e.fecha) : '-'}</td>
                        <td className="py-2 pr-4 text-zinc-200 font-medium">{e.municipio || '-'}</td>
                        <td className="py-2 pr-4 text-zinc-400">{e.tipo_evento || '-'}</td>
                        <td className="py-2 pr-4 text-right text-zinc-300">{e.personas_afectadas ? formatNumber(Number(e.personas_afectadas)) : '-'}</td>
                        <td className="py-2 text-right text-zinc-300">{e.familias_afectadas ? formatNumber(Number(e.familias_afectadas)) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500">
                      {tablePage * PAGE_SIZE + 1}–{Math.min((tablePage + 1) * PAGE_SIZE, filtered.length)} de {filtered.length} registros
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTablePage(p => Math.max(0, p - 1))}
                        disabled={tablePage === 0}
                        className="px-3 py-1 text-xs rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="text-xs text-zinc-400">
                        {tablePage + 1} / {Math.ceil(filtered.length / PAGE_SIZE)}
                      </span>
                      <button
                        onClick={() => setTablePage(p => Math.min(Math.ceil(filtered.length / PAGE_SIZE) - 1, p + 1))}
                        disabled={(tablePage + 1) * PAGE_SIZE >= filtered.length}
                        className="px-3 py-1 text-xs rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
