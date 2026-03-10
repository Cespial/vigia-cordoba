'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  Users,
  Droplets,
  MapPin,
  Shield,
  Building2,
  Home,
} from 'lucide-react';

const FloodMap = dynamic(() => import('@/components/evento/FloodMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
      Cargando mapa satelital...
    </div>
  ),
});

/* ────────────────────── Static Data ────────────────────── */

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  level: 'amarillo' | 'naranja' | 'rojo';
  alert: string;
}

const timeline: TimelineEvent[] = [
  {
    date: '26 Ene',
    title: 'Lluvias intensas persistentes',
    description:
      'Precipitaciones superiores al promedio comienzan en todo el departamento. Los modelos meteorologicos detectan anomalia.',
    level: 'amarillo',
    alert: 'Alerta Amarilla',
  },
  {
    date: '1 Feb',
    title: 'Frente frio atipico del Caribe',
    description:
      'Un frente frio inusual empuja aire humedo hacia el sur. Algunas zonas reciben 4-7 cm de lluvia por dia.',
    level: 'naranja',
    alert: 'Alerta Naranja',
  },
  {
    date: '3 Feb',
    title: 'Calamidad publica en 17 municipios',
    description:
      'El gobernador declara calamidad publica. Desbordamientos generalizados del Rio Sinu.',
    level: 'rojo',
    alert: 'Alerta Roja',
  },
  {
    date: '5-7 Feb',
    title: 'Desbordamiento de la Represa de Urra',
    description:
      'La represa alcanza capacidad maxima. Caudal del Sinu pasa de 500 a 2,500 m\u00B3/s en 36 horas.',
    level: 'rojo',
    alert: 'Nivel Critico',
  },
  {
    date: '9 Feb',
    title: 'Pico de la inundacion',
    description:
      '73,475 hectareas bajo el agua. 24 de 30 municipios afectados. Landsat 9 captura la maxima extension.',
    level: 'rojo',
    alert: 'Emergencia',
  },
  {
    date: '11 Feb',
    title: 'Emergencia economica nacional',
    description:
      'Copernicus EMSR865 activado. Presidente Petro declara Emergencia Economica, Social y Ecologica (Decreto 0150).',
    level: 'rojo',
    alert: 'Decreto 0150',
  },
];

const levelStyles = {
  amarillo: {
    ring: 'bg-yellow-500/20',
    dot: 'bg-yellow-400',
    badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
  },
  naranja: {
    ring: 'bg-orange-500/20',
    dot: 'bg-orange-400',
    badge: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
  },
  rojo: {
    ring: 'bg-red-500/20',
    dot: 'bg-red-400',
    badge: 'bg-red-500/10 text-red-400 border border-red-500/30',
  },
};

const impactData = [
  { name: 'Monteria', hectares: 28054, pct: 38.18 },
  { name: 'Lorica', hectares: 8088, pct: 11.01 },
  { name: 'Tierralta', hectares: 4466, pct: 6.08 },
  { name: 'Valencia', hectares: 4317, pct: 5.88 },
  { name: 'Cerete', hectares: 3200, pct: 4.35 },
  { name: 'San Pelayo', hectares: 2900, pct: 3.95 },
  { name: 'Montelibano', hectares: 2700, pct: 3.67 },
  { name: 'Puerto Libertador', hectares: 2400, pct: 3.27 },
  { name: 'Ayapel', hectares: 2100, pct: 2.86 },
  { name: 'Otros (15 mpios)', hectares: 15250, pct: 20.75 },
];

const secondaryKpis = [
  { value: '72,266', label: 'ha agricolas afectadas', color: 'text-amber-400', Icon: Droplets },
  { value: '4,047', label: 'Viviendas destruidas', color: 'text-red-400', Icon: Building2 },
  { value: '22,935', label: 'Viviendas danadas', color: 'text-orange-400', Icon: Home },
  { value: '546,000', label: 'Cabezas de ganado', color: 'text-cyan-400', Icon: AlertTriangle },
];

/* ────────────────────── Component ────────────────────── */

function KPICard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl md:text-3xl font-bold text-white">{value}</div>
      <div className="text-[11px] text-zinc-400 mt-1">{label}</div>
    </div>
  );
}

export default function EventoInundacion2026() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <span className="text-sm font-semibold text-zinc-200">
              SAT Cordoba
            </span>
            <span className="text-[11px] text-zinc-500 ml-2">
              Caso de Estudio
            </span>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-zinc-950 to-zinc-950" />
        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            <AlertTriangle size={14} />
            Evento Historico
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Inundacion de Cordoba
          </h1>
          <p className="text-lg text-zinc-400 mb-1">Febrero 2026</p>
          <p className="text-sm text-zinc-500 max-w-2xl mx-auto mb-10">
            La peor inundacion en la historia del departamento. Un frente frio
            atipico del Caribe provoco lluvias extremas que desbordaron el Rio
            Sinu, afectando 24 de 30 municipios y dejando mas de 78,000 familias
            damnificadas.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <KPICard
              icon={<Users size={18} className="text-red-400" />}
              value="78,000"
              label="Familias damnificadas"
            />
            <KPICard
              icon={<MapPin size={18} className="text-blue-400" />}
              value="73,475 ha"
              label="Hectareas inundadas"
            />
            <KPICard
              icon={<Droplets size={18} className="text-cyan-400" />}
              value="2,500 m\u00B3/s"
              label="Caudal max. Rio Sinu"
            />
            <KPICard
              icon={<AlertTriangle size={18} className="text-orange-400" />}
              value="24/30"
              label="Municipios afectados"
            />
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-white mb-1">
          Cronologia del Evento
        </h2>
        <p className="text-sm text-zinc-400 mb-8">
          Como se desarrollo la emergencia — y que alertas habria generado el SAT
        </p>

        <div className="relative">
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-zinc-800" />
          <div className="space-y-6">
            {timeline.map((ev, i) => {
              const s = levelStyles[ev.level];
              return (
                <div key={i} className="flex gap-4 relative">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 ${s.ring}`}
                  >
                    <div className={`w-3 h-3 rounded-full ${s.dot}`} />
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-zinc-500">
                        {ev.date}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.badge}`}
                      >
                        {ev.alert}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-200">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Satellite Map ── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-white mb-1">
          Extension de la Inundacion
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Imagenes satelitales NASA MODIS mostrando la progresion dia a dia.
          Presione <span className="text-blue-400">&#9654;</span> para ver la
          animacion o arrastre el control deslizante.
        </p>
        <FloodMap />
        <p className="mt-3 text-[11px] text-zinc-500">
          Fuente: NASA MODIS NRT Global Flood Product &middot; Resolucion: 250m
          &middot; Composicion: 3 dias
        </p>
      </section>

      {/* ── Impact by Municipality ── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-white mb-1">
          Impacto por Municipio
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Hectareas inundadas segun analisis satelital (MapBiomas / Sentinel)
        </p>

        <div className="space-y-2">
          {impactData.map((m) => (
            <div key={m.name} className="flex items-center gap-3">
              <span className="w-32 text-xs text-zinc-300 text-right shrink-0 truncate">
                {m.name}
              </span>
              <div className="flex-1 h-7 bg-zinc-900 rounded-md overflow-hidden">
                <div
                  className="h-full rounded-md bg-gradient-to-r from-blue-600 to-blue-400 flex items-center px-2"
                  style={{ width: `${(m.hectares / 28054) * 100}%` }}
                >
                  {m.hectares > 3000 && (
                    <span className="text-[10px] text-white font-medium whitespace-nowrap">
                      {m.hectares.toLocaleString()} ha
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-zinc-500 w-12 text-right shrink-0">
                {m.pct}%
              </span>
            </div>
          ))}
        </div>

        {/* Secondary KPIs */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {secondaryKpis.map(({ value, label, color, Icon }) => (
            <div
              key={label}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center"
            >
              <Icon size={16} className={`${color} mx-auto mb-1`} />
              <div className="text-lg font-bold text-white">{value}</div>
              <div className="text-[11px] text-zinc-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Value Proposition ── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-blue-950/50 to-zinc-900 border border-blue-900/30 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-blue-400" />
            <h2 className="text-xl font-bold text-white">Ventana de Accion</h2>
          </div>
          <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
            Con el SAT Cordoba activo, las autoridades habrian tenido{' '}
            <strong className="text-blue-400">5-7 dias de anticipacion</strong>{' '}
            desde las primeras senales de alerta hasta el pico de la inundacion.
            Tiempo suficiente para evacuar zonas vulnerables, movilizar ganado, y
            activar protocolos de emergencia.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">5-7</div>
              <div className="text-[11px] text-zinc-400">
                dias de anticipacion
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">78K</div>
              <div className="text-[11px] text-zinc-400">
                familias alertadas a tiempo
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">40-60%</div>
              <div className="text-[11px] text-zinc-400">
                reduccion de perdidas
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/comando"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors text-center"
            >
              Ver Centro de Comando
            </Link>
            <Link
              href="/"
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors text-center"
            >
              Ir al Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="max-w-4xl mx-auto px-4 py-8 border-t border-zinc-800 text-center">
        <p className="text-xs text-zinc-500">
          Datos: NASA MODIS &middot; Copernicus EMSR865 &middot; MapBiomas
          &middot; UNGRD &middot; IDEAM
        </p>
        <p className="text-[11px] text-zinc-600 mt-1">
          SAT Cordoba &middot; Sistema de Alertas Tempranas
        </p>
      </footer>
    </div>
  );
}
