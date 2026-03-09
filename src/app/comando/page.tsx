'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  AlertTriangle,
  Users,
  Building2,
  Heart,
  Beef,
  GraduationCap,
  Clock,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Activity,
  Radio,
  FileText,
  Zap,
  TrendingUp,
  CircleDot,
} from 'lucide-react';
import Header from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAlerts } from '@/lib/hooks';
import { formatNumber } from '@/lib/utils';
import type { MunicipalAlert } from '@/types';

import nbiData from '@/data/nbi-data.json';
import livestockData from '@/data/livestock-data.json';
import educationData from '@/data/education-institutions.json';
import healthData from '@/data/health-institutions.json';
import emergenciesData from '@/data/ungrd-emergencies.json';

// ── Name matching ──────────────────────────────────────────────────────

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '')
    .trim();
}

function matchMuni(a: string, b: string): boolean {
  const na = normalize(a),
    nb = normalize(b);
  return na.includes(nb) || nb.includes(na) || na === nb;
}

// ── Constants ──────────────────────────────────────────────────────────

const ALERT_ORDER: Record<string, number> = { rojo: 0, naranja: 1, amarillo: 2, verde: 3 };

const LEVEL_COLORS: Record<string, string> = {
  rojo: 'bg-red-600',
  naranja: 'bg-orange-500',
  amarillo: 'bg-yellow-500',
  verde: 'bg-green-500',
};

const LEVEL_TEXT_COLORS: Record<string, string> = {
  rojo: 'text-red-400',
  naranja: 'text-orange-400',
  amarillo: 'text-yellow-400',
  verde: 'text-green-400',
};

const LEVEL_BORDER_COLORS: Record<string, string> = {
  rojo: 'border-red-800',
  naranja: 'border-orange-800',
  amarillo: 'border-yellow-800',
  verde: 'border-green-800',
};

const LEVEL_LABELS: Record<string, string> = {
  rojo: 'ROJO',
  naranja: 'NARANJA',
  amarillo: 'AMARILLO',
  verde: 'VERDE',
};

const POPULATION_MULTIPLIER: Record<string, number> = { rojo: 0.3, naranja: 0.15 };
const RISK_FACTOR: Record<string, number> = { rojo: 0.15, naranja: 0.05 };
const INFRA_RISK_FACTOR: Record<string, number> = { rojo: 0.03, naranja: 0.01 };
const ACTION_WINDOW: Record<string, string> = { rojo: '0-6 horas', naranja: '6-24 horas' };

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// ── Protocols ──────────────────────────────────────────────────────────

const PROTOCOLS = [
  {
    phase: 'FASE 1: Alerta',
    timeframe: '0-6h',
    color: 'border-red-600',
    bgColor: 'bg-red-950/40',
    headerBg: 'bg-red-900/60',
    dotColor: 'bg-red-500',
    steps: [
      'Activar Comité Operativo de Emergencias (COE) municipal',
      'Notificar alcaldías de municipios en rojo/naranja',
      'Alertar Cruz Roja, Defensa Civil, Bomberos',
      'Verificar estado de vías de evacuación',
      'Activar sistema de comunicación comunitaria',
    ],
  },
  {
    phase: 'FASE 2: Preparación',
    timeframe: '6-12h',
    color: 'border-orange-600',
    bgColor: 'bg-orange-950/40',
    headerBg: 'bg-orange-900/60',
    dotColor: 'bg-orange-500',
    steps: [
      'Pre-posicionar kits de emergencia en zonas críticas',
      'Alistar y verificar albergues temporales',
      'Alertar centros de salud y hospitales',
      'Coordinar transporte para evacuación preventiva',
      'Notificar juntas de acción comunal',
    ],
  },
  {
    phase: 'FASE 3: Respuesta',
    timeframe: '12-24h',
    color: 'border-yellow-600',
    bgColor: 'bg-yellow-950/40',
    headerBg: 'bg-yellow-900/60',
    dotColor: 'bg-yellow-500',
    steps: [
      'Ejecutar evacuación de zonas de alto riesgo',
      'Activar albergues con registro de familias',
      'Coordinar operaciones de búsqueda y rescate',
      'Establecer puntos de atención médica',
      'Asegurar suministro de agua potable',
    ],
  },
  {
    phase: 'FASE 4: Seguimiento',
    timeframe: '24-72h',
    color: 'border-green-600',
    bgColor: 'bg-green-950/40',
    headerBg: 'bg-green-900/60',
    dotColor: 'bg-green-500',
    steps: [
      'Evaluar daños e inventario de afectación',
      'Gestionar ayuda humanitaria (UNGRD)',
      'Elaborar plan de retorno seguro',
      'Reportar oficialmente a UNGRD y gobernación',
      'Documentar lecciones aprendidas',
    ],
  },
];

// ── Helper: format COP in billions ─────────────────────────────────────

function formatCOP(amount: number): string {
  const billions = amount / 1_000_000_000;
  if (billions >= 1) {
    return `$${formatNumber(billions, 1)} mil millones COP`;
  }
  const millions = amount / 1_000_000;
  return `$${formatNumber(millions, 0)} millones COP`;
}

// ── Main Page Component ────────────────────────────────────────────────

export default function ComandoPage() {
  const { alerts, loading, error, refetch } = useAlerts();
  const [expandedMuni, setExpandedMuni] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [secondsToRefresh, setSecondsToRefresh] = useState(300);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastRefreshTime(new Date());
      setSecondsToRefresh(300);
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refetch]);

  // Countdown timer
  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsToRefresh((prev) => (prev <= 1 ? 300 : prev - 1));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort(
      (a, b) => (ALERT_ORDER[a.alertLevel.level] ?? 9) - (ALERT_ORDER[b.alertLevel.level] ?? 9)
    );
  }, [alerts]);

  const alertCounts = useMemo(() => {
    const counts = { rojo: 0, naranja: 0, amarillo: 0, verde: 0 };
    alerts.forEach((a) => {
      const level = a.alertLevel.level;
      if (level in counts) counts[level as keyof typeof counts]++;
    });
    return counts;
  }, [alerts]);

  const highestLevel = useMemo(() => {
    if (alertCounts.rojo > 0) return 'rojo';
    if (alertCounts.naranja > 0) return 'naranja';
    if (alertCounts.amarillo > 0) return 'amarillo';
    return 'verde';
  }, [alertCounts]);

  const criticalAlerts = useMemo(() => {
    return sortedAlerts.filter(
      (a) => a.alertLevel.level === 'rojo' || a.alertLevel.level === 'naranja'
    );
  }, [sortedAlerts]);

  // ── Impact calculations ───────────────────────────────────────────────

  const impact = useMemo(() => {
    if (criticalAlerts.length === 0)
      return {
        totalExposed: 0,
        displaced: 0,
        agriDamage: 0,
        infraDamage: 0,
        totalDamage: 0,
        educationAtRisk: 0,
        healthAtRisk: 0,
        cattleAtRisk: 0,
        historicalEvents: 0,
        avgAffectedPerEvent: 0,
        lastEventDate: '',
      };

    let totalExposed = 0;
    let agriDamage = 0;
    let infraDamage = 0;
    let educationAtRisk = 0;
    let healthAtRisk = 0;
    let cattleAtRisk = 0;

    criticalAlerts.forEach((alert) => {
      const level = alert.alertLevel.level;
      const pop = alert.municipality.population ?? 0;
      const multiplier = POPULATION_MULTIPLIER[level] ?? 0;
      const riskFactor = RISK_FACTOR[level] ?? 0;
      const infraRiskFactor = INFRA_RISK_FACTOR[level] ?? 0;

      totalExposed += pop * multiplier;

      // Livestock / agriculture
      const livestock = (livestockData as { municipality: string; cattle_heads: number; area_pasture_ha: number }[]).find((l) =>
        matchMuni(l.municipality, alert.municipality.name)
      );
      if (livestock) {
        agriDamage +=
          livestock.cattle_heads * 2_500_000 * riskFactor +
          livestock.area_pasture_ha * 3_000_000 * riskFactor;
        cattleAtRisk += Math.round(livestock.cattle_heads * riskFactor);
      }

      // Education
      const edu = (educationData as { municipality: string; count: number }[]).find((e) =>
        matchMuni(e.municipality, alert.municipality.name)
      );
      if (edu) {
        infraDamage += edu.count * 800_000_000 * infraRiskFactor;
        educationAtRisk += edu.count;
      }

      // Health
      const health = (healthData as { municipality: string; total: number }[]).find((h) =>
        matchMuni(h.municipality, alert.municipality.name)
      );
      if (health) {
        infraDamage += health.total * 2_000_000_000 * infraRiskFactor;
        healthAtRisk += health.total;
      }
    });

    const displaced = Math.round(totalExposed * 0.4);

    // Historical context
    const criticalNames = criticalAlerts.map((a) => a.municipality.name);
    const relevantEmergencies = (emergenciesData as { date: string; municipality: string; event_type: string; affected: number }[]).filter(
      (e) => criticalNames.some((name) => matchMuni(e.municipality, name))
    );

    const historicalEvents = relevantEmergencies.length;
    const totalAffected = relevantEmergencies.reduce(
      (sum, e) => sum + (e.affected ?? 0),
      0
    );
    const avgAffectedPerEvent = historicalEvents > 0 ? Math.round(totalAffected / historicalEvents) : 0;

    // Last event for the most critical municipality
    const mostCritical = criticalAlerts[0];
    const lastEventForCritical = (emergenciesData as { date: string; municipality: string }[])
      .filter((e) => matchMuni(e.municipality, mostCritical?.municipality.name ?? ''))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastEventDate = lastEventForCritical.length > 0 ? lastEventForCritical[0].date : '';

    return {
      totalExposed: Math.round(totalExposed),
      displaced,
      agriDamage,
      infraDamage,
      totalDamage: agriDamage + infraDamage,
      educationAtRisk,
      healthAtRisk,
      cattleAtRisk,
      historicalEvents,
      avgAffectedPerEvent,
      lastEventDate,
    };
  }, [criticalAlerts]);

  // ── Clipboard helper ──────────────────────────────────────────────────

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  // ── Communication templates ───────────────────────────────────────────

  const whatsappTemplate = useMemo(() => {
    if (criticalAlerts.length === 0) return '';
    return criticalAlerts
      .map((a) => {
        const riskLabel = a.alertLevel.level === 'rojo' ? 'alto' : 'moderado';
        const action =
          a.alertLevel.level === 'rojo'
            ? 'Evacuar zonas de riesgo inmediatamente.'
            : 'Prepararse para posible evacuación.';
        return `\u{1F6A8} ALERTA ${LEVEL_LABELS[a.alertLevel.level]} - SAT Córdoba
${a.municipality.name}: Riesgo ${riskLabel} de inundación.
Precipitación prevista: ${formatNumber(a.precipitationForecast24h, 1)}mm en 24h.
Caudal estimado: ${formatNumber(a.riverDischarge, 1)} m\u00B3/s.
Acción recomendada: ${action}
Más info: sat-cordoba.vercel.app`;
      })
      .join('\n\n---\n\n');
  }, [criticalAlerts]);

  const oficialTemplate = useMemo(() => {
    if (criticalAlerts.length === 0) return '';
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const muniList = criticalAlerts.map((a) => a.municipality.name).join(', ');
    const maxPrecip = Math.max(...criticalAlerts.map((a) => a.precipitationForecast24h));
    const maxDischarge = Math.max(...criticalAlerts.map((a) => a.riverDischarge));

    // Determine river basin
    const cuencas = [...new Set(criticalAlerts.map((a) => a.municipality.cuenca))];
    const riverNames = cuencas
      .map((c) => {
        if (c.includes('Sinú')) return 'Sinú';
        if (c.includes('San Jorge')) return 'San Jorge';
        return c;
      })
      .filter((v, i, a) => a.indexOf(v) === i);

    const comNo = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

    return `COMUNICADO OFICIAL No. ${comNo}
Sistema de Alertas Tempranas - Departamento de Córdoba
Fecha: ${dateStr}

El SAT Córdoba informa que se ha activado ALERTA ${LEVEL_LABELS[highestLevel]} para los municipios de ${muniList}.

Situación actual:
- Precipitación máxima prevista: ${formatNumber(maxPrecip, 1)} mm en 24h
- Caudal máximo estimado: ${formatNumber(maxDischarge, 1)} m\u00B3/s en el río ${riverNames.join(' / ')}
- Población potencialmente expuesta: ${formatNumber(impact.totalExposed)} personas

Se recomienda a las autoridades municipales activar los protocolos de respuesta correspondientes.

Fuentes: Open-Meteo, GloFAS/Copernicus, IDEAM
Contacto: sat-cordoba.vercel.app`;
  }, [criticalAlerts, highestLevel, impact.totalExposed]);

  // ── Banner gradient ───────────────────────────────────────────────────

  const bannerGradient = useMemo(() => {
    if (alertCounts.rojo > 0) return 'from-red-950 to-zinc-950';
    if (alertCounts.naranja > 0) return 'from-orange-950 to-zinc-950';
    if (alertCounts.amarillo > 0) return 'from-yellow-950 to-zinc-950';
    return 'from-green-950 to-zinc-950';
  }, [alertCounts]);

  // ── Format time ───────────────────────────────────────────────────────

  const formatRefreshTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const lastUpdateStr = lastRefreshTime.toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // ── Render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Header />
        <div className="mx-auto max-w-7xl p-4 space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Header />
        <div className="mx-auto max-w-7xl p-4">
          <Card className="border-red-800 bg-red-950/50">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={24} />
              <div>
                <p className="font-semibold">Error al cargar datos</p>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* ───────────── 1. SITUATIONAL BANNER ───────────── */}
        <section
          data-testid="command-banner"
          className={`relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-r ${bannerGradient} p-6 md:p-8`}
        >
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\' stroke=\'%23fff\' stroke-width=\'.5\'/%3E%3C/svg%3E")' }} />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Pulsing indicator */}
                <div className="relative flex items-center justify-center">
                  {highestLevel === 'rojo' && (
                    <span className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-red-500 opacity-40" />
                  )}
                  <span
                    className={`relative inline-flex h-8 w-8 rounded-full ${LEVEL_COLORS[highestLevel]} items-center justify-center`}
                  >
                    <Shield size={16} className="text-white" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
                      Nivel de amenaza:{' '}
                      <span className={LEVEL_TEXT_COLORS[highestLevel]}>
                        {LEVEL_LABELS[highestLevel]}
                      </span>
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400 font-mono">
                    Centro de Comando — SAT Córdoba
                  </p>
                </div>
              </div>

              {/* Alert counts */}
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                {alertCounts.rojo > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-red-900/60 px-3 py-1 text-red-300 border border-red-800">
                    <CircleDot size={12} className="text-red-500" />
                    {alertCounts.rojo} en rojo
                  </span>
                )}
                {alertCounts.naranja > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-orange-900/60 px-3 py-1 text-orange-300 border border-orange-800">
                    <CircleDot size={12} className="text-orange-500" />
                    {alertCounts.naranja} en naranja
                  </span>
                )}
                {alertCounts.amarillo > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-yellow-900/60 px-3 py-1 text-yellow-300 border border-yellow-800">
                    <CircleDot size={12} className="text-yellow-500" />
                    {alertCounts.amarillo} en amarillo
                  </span>
                )}
                {alertCounts.verde > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-green-900/60 px-3 py-1 text-green-300 border border-green-800">
                    <CircleDot size={12} className="text-green-500" />
                    {alertCounts.verde} en verde
                  </span>
                )}
              </div>
            </div>

            {/* Refresh status */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500 font-mono border-t border-zinc-800/60 pt-3">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                Última actualización: {lastUpdateStr}
              </span>
              <span className="flex items-center gap-1.5">
                <Activity size={12} />
                Próxima actualización en {formatRefreshTime(secondsToRefresh)}
              </span>
              <span className="flex items-center gap-1.5">
                <Radio size={12} className="text-green-500" />
                {alerts.length} municipios monitoreados
              </span>
            </div>
          </div>
        </section>

        {/* ───────────── 2 & 3. PRIORITY ACTIONS + IMPACT ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ACCIONES PRIORITARIAS — left column (3/5) */}
          <section data-testid="priority-actions" className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-red-400" />
              <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-wide">
                Acciones Prioritarias
              </h3>
              {criticalAlerts.length > 0 && (
                <span className="ml-auto text-xs font-mono text-zinc-500">
                  {criticalAlerts.length} municipio{criticalAlerts.length !== 1 ? 's' : ''} en alerta
                </span>
              )}
            </div>

            {criticalAlerts.length === 0 ? (
              <Card className="border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-3 text-zinc-400 py-8 justify-center">
                  <Check size={20} className="text-green-500" />
                  <p className="text-sm">
                    No hay municipios en alerta roja o naranja. Situación estable.
                  </p>
                </div>
              </Card>
            ) : (
              criticalAlerts.map((alert) => {
                const level = alert.alertLevel.level;
                const pop = alert.municipality.population ?? 0;
                const exposed = Math.round(pop * (POPULATION_MULTIPLIER[level] ?? 0));
                const isExpanded = expandedMuni === alert.municipality.slug;

                return (
                  <Card
                    key={alert.municipality.slug}
                    className={`border ${LEVEL_BORDER_COLORS[level]} bg-zinc-900 hover:bg-zinc-900/80 transition-colors`}
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedMuni(isExpanded ? null : alert.municipality.slug)
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Alert badge */}
                          <span
                            className={`mt-0.5 shrink-0 inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-black text-white uppercase tracking-wider ${LEVEL_COLORS[level]}`}
                          >
                            {LEVEL_LABELS[level]}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-zinc-100 text-base">
                                {alert.municipality.name}
                              </h4>
                              <span className="text-xs text-zinc-500 font-mono">
                                {alert.municipality.cuenca}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                              <span>
                                Precipitación:{' '}
                                <span className="text-zinc-200 font-semibold">
                                  {formatNumber(alert.precipitationForecast24h, 1)} mm/24h
                                </span>
                              </span>
                              <span>
                                Caudal:{' '}
                                <span className="text-zinc-200 font-semibold">
                                  {formatNumber(alert.riverDischarge, 1)} m&sup3;/s
                                </span>
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                              <span className={`font-semibold ${LEVEL_TEXT_COLORS[level]}`}>
                                Ventana de acción: {ACTION_WINDOW[level]}
                              </span>
                              <span className="text-zinc-400">
                                Población expuesta:{' '}
                                <span className="text-zinc-200 font-semibold">
                                  {formatNumber(exposed)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <button className="shrink-0 mt-1 text-zinc-500 hover:text-zinc-300">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded protocol */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-zinc-800">
                        <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                          Protocolo de respuesta — {alert.municipality.name}
                        </h5>
                        <div className="space-y-2">
                          {(level === 'rojo' ? PROTOCOLS[0] : PROTOCOLS[1]).steps.map(
                            (step, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                <span
                                  className={`mt-1 shrink-0 h-4 w-4 rounded-full border-2 ${
                                    level === 'rojo' ? 'border-red-600' : 'border-orange-600'
                                  }`}
                                />
                                <span>{step}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </section>

          {/* IMPACTO ESTIMADO — right column (2/5) */}
          <section data-testid="impact-panel" className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-orange-400" />
              <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-wide">
                Impacto Estimado
              </h3>
            </div>

            {/* Population impact */}
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={16} className="text-blue-400" />
                  Población
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-zinc-400">Población expuesta</span>
                  <span className="text-xl font-black text-zinc-100 font-mono">
                    {formatNumber(impact.totalExposed)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-zinc-400">Desplazados estimados</span>
                  <span className="text-lg font-bold text-zinc-200 font-mono">
                    {formatNumber(impact.displaced)}
                  </span>
                </div>
                <div className="h-px bg-zinc-800" />
                <p className="text-[11px] text-zinc-500 font-mono">
                  Basado en población municipal x factor de exposición por nivel de alerta
                </p>
              </div>
            </Card>

            {/* Economic impact */}
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 size={16} className="text-amber-400" />
                  Impacto Económico
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-zinc-400">Agropecuario</span>
                    <span className="text-base font-bold text-zinc-200 font-mono">
                      {formatCOP(impact.agriDamage)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-zinc-400">Infraestructura</span>
                    <span className="text-base font-bold text-zinc-200 font-mono">
                      {formatCOP(impact.infraDamage)}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-zinc-800" />
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-zinc-300">Total estimado</span>
                  <span className="text-xl font-black text-red-400 font-mono">
                    {formatCOP(impact.totalDamage)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Infrastructure at risk */}
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-400" />
                  Infraestructura en Riesgo
                </CardTitle>
              </CardHeader>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 rounded-lg bg-zinc-800/50">
                  <GraduationCap size={18} className="mx-auto text-blue-400 mb-1" />
                  <p className="text-lg font-black text-zinc-100 font-mono">
                    {formatNumber(impact.educationAtRisk)}
                  </p>
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider">
                    Sedes educativas
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-zinc-800/50">
                  <Heart size={18} className="mx-auto text-red-400 mb-1" />
                  <p className="text-lg font-black text-zinc-100 font-mono">
                    {formatNumber(impact.healthAtRisk)}
                  </p>
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider">
                    Centros de salud
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-zinc-800/50">
                  <Beef size={18} className="mx-auto text-amber-400 mb-1" />
                  <p className="text-lg font-black text-zinc-100 font-mono">
                    {formatNumber(impact.cattleAtRisk)}
                  </p>
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider">
                    Cabezas de ganado
                  </p>
                </div>
              </div>
            </Card>

            {/* Historical context */}
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={16} className="text-zinc-400" />
                  Contexto Histórico
                </CardTitle>
              </CardHeader>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-zinc-400">Eventos registrados</span>
                  <span className="text-base font-bold text-zinc-200 font-mono">
                    {formatNumber(impact.historicalEvents)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-zinc-400">Prom. afectados/evento</span>
                  <span className="text-base font-bold text-zinc-200 font-mono">
                    {formatNumber(impact.avgAffectedPerEvent)}
                  </span>
                </div>
                {impact.lastEventDate && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-zinc-400">Último evento</span>
                    <span className="text-sm font-semibold text-zinc-300 font-mono">
                      {new Date(impact.lastEventDate).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="h-px bg-zinc-800" />
                <p className="text-[11px] text-zinc-500 font-mono">
                  Fuente: UNGRD — Municipios actualmente en alerta roja/naranja
                </p>
              </div>
            </Card>
          </section>
        </div>

        {/* ───────────── 4. PROTOCOLOS DE RESPUESTA ───────────── */}
        <section data-testid="protocols-section">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-zinc-400" />
            <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-wide">
              Protocolos de Respuesta
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROTOCOLS.map((protocol) => (
              <div
                key={protocol.phase}
                className={`rounded-xl border ${protocol.color} ${protocol.bgColor} overflow-hidden`}
              >
                <div className={`${protocol.headerBg} px-4 py-3`}>
                  <h4 className="text-sm font-black text-white uppercase tracking-wide">
                    {protocol.phase}
                  </h4>
                  <p className="text-xs text-zinc-300 font-mono mt-0.5">{protocol.timeframe}</p>
                </div>
                <div className="p-4 space-y-3">
                  {protocol.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 shrink-0 h-4 w-4 rounded-full border-2 ${protocol.color}`}
                      />
                      <span className="text-xs text-zinc-300 leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────── 5. CENTRO DE COMUNICACIONES ───────────── */}
        <section data-testid="communications-section">
          <div className="flex items-center gap-2 mb-4">
            <Radio size={18} className="text-blue-400" />
            <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-wide">
              Centro de Comunicaciones
            </h3>
          </div>

          {criticalAlerts.length === 0 ? (
            <Card className="border-zinc-800 bg-zinc-900">
              <div className="flex items-center gap-3 text-zinc-400 py-8 justify-center">
                <Check size={20} className="text-green-500" />
                <p className="text-sm">
                  Sin alertas activas. Los mensajes se generarán automáticamente cuando se detecten
                  alertas roja o naranja.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* WhatsApp/SMS Template */}
              <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-green-400">WhatsApp / SMS</span>
                  </CardTitle>
                  <button
                    onClick={() => copyToClipboard(whatsappTemplate, 'whatsapp')}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    {copiedId === 'whatsapp' ? (
                      <>
                        <Check size={14} className="text-green-400" />
                        <span className="text-green-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copiar
                      </>
                    )}
                  </button>
                </CardHeader>
                <pre className="whitespace-pre-wrap text-xs text-zinc-400 font-mono bg-zinc-800/50 rounded-lg p-3 max-h-64 overflow-y-auto leading-relaxed">
                  {whatsappTemplate}
                </pre>
              </Card>

              {/* Comunicado Oficial Template */}
              <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-blue-400">Comunicado Oficial</span>
                  </CardTitle>
                  <button
                    onClick={() => copyToClipboard(oficialTemplate, 'oficial')}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    {copiedId === 'oficial' ? (
                      <>
                        <Check size={14} className="text-green-400" />
                        <span className="text-green-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copiar
                      </>
                    )}
                  </button>
                </CardHeader>
                <pre className="whitespace-pre-wrap text-xs text-zinc-400 font-mono bg-zinc-800/50 rounded-lg p-3 max-h-64 overflow-y-auto leading-relaxed">
                  {oficialTemplate}
                </pre>
              </Card>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
