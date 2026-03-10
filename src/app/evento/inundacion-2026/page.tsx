'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  ExternalLink,
} from 'lucide-react';

const FloodMap = dynamic(() => import('@/components/evento/FloodMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[560px] rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-500 text-sm">
      Cargando mapa...
    </div>
  ),
});

/* ── NASA Landsat 9 images ── */
const NASA_BEFORE =
  'https://assets.science.nasa.gov/dynamicimage/assets/science/esd/eo/images/iotd/2026/dry-season-floods-drench-northern-colombia/colombiaflood_oli2_20260123_lrg.jpg';
const NASA_DURING =
  'https://assets.science.nasa.gov/dynamicimage/assets/science/esd/eo/images/iotd/2026/dry-season-floods-drench-northern-colombia/colombiaflood_oli2_20260209_lrg.jpg';

/* ── Data ── */

interface TimelineEvent {
  date: string;
  title: string;
  desc: string;
  level: 'amarillo' | 'naranja' | 'rojo';
  alert: string;
}

const timeline: TimelineEvent[] = [
  { date: '26 Ene', title: 'Lluvias intensas persistentes', desc: 'Precipitaciones muy superiores al promedio historico comienzan en todo el departamento.', level: 'amarillo', alert: 'Alerta Amarilla' },
  { date: '1 Feb', title: 'Frente frio atipico del Caribe', desc: 'Un frente frio inusual empuja aire humedo. Algunas zonas reciben 4-7 cm de lluvia por dia.', level: 'naranja', alert: 'Alerta Naranja' },
  { date: '3 Feb', title: 'Calamidad publica — 17 municipios', desc: 'El gobernador declara calamidad publica. Desbordamientos generalizados del Rio Sinu.', level: 'rojo', alert: 'Alerta Roja' },
  { date: '5-7 Feb', title: 'Desbordamiento de la Represa de Urra', desc: 'La represa alcanza capacidad maxima. Caudal del Sinu pasa de 500 a 2,500 m\u00B3/s en 36 horas.', level: 'rojo', alert: 'Nivel Critico' },
  { date: '9 Feb', title: 'Pico maximo de la inundacion', desc: '73,475 hectareas bajo el agua. 24 de 30 municipios afectados. Landsat 9 captura la maxima extension.', level: 'rojo', alert: 'Emergencia' },
  { date: '11 Feb', title: 'Emergencia economica nacional', desc: 'Copernicus EMSR865 activado. Presidente Petro declara Emergencia Economica, Social y Ecologica.', level: 'rojo', alert: 'Decreto 0150' },
];

const lvl = {
  amarillo: { ring: 'bg-yellow-500/20', dot: 'bg-yellow-400', badge: 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/30' },
  naranja:  { ring: 'bg-orange-500/20', dot: 'bg-orange-400', badge: 'bg-orange-400/10 text-orange-300 border border-orange-400/30' },
  rojo:     { ring: 'bg-red-500/20',    dot: 'bg-red-400',    badge: 'bg-red-400/10 text-red-300 border border-red-400/30' },
};

const impactData = [
  { name: 'Monteria',          ha: 28054, pct: 38.18 },
  { name: 'Lorica',            ha:  8088, pct: 11.01 },
  { name: 'Tierralta',         ha:  4466, pct:  6.08 },
  { name: 'Valencia',          ha:  4317, pct:  5.88 },
  { name: 'Cerete',            ha:  3200, pct:  4.35 },
  { name: 'San Pelayo',        ha:  2900, pct:  3.95 },
  { name: 'Montelibano',       ha:  2700, pct:  3.67 },
  { name: 'Puerto Libertador', ha:  2400, pct:  3.27 },
  { name: 'Ayapel',            ha:  2100, pct:  2.86 },
  { name: 'Otros (15 mpios)',  ha: 15250, pct: 20.75 },
];

const sources = [
  { label: 'NASA Earth Observatory — Landsat 9', url: 'https://science.nasa.gov/earth/earth-observatory/dry-season-floods-drench-northern-colombia/' },
  { label: 'Copernicus EMSR865 — Flood mapping', url: 'https://mapping.emergency.copernicus.eu/news/flood-in-cordoba-colombia-emsr865/' },
  { label: 'MapBiomas Agua — Sentinel-1/2 analysis', url: 'https://www.elespectador.com/ambiente/inundaciones-en-cordoba-con-datos-satelitales-este-analisis-muestra-la-magnitud-mas-de-73-mil-hectareas-afectadas/' },
  { label: 'UNGRD — Reporte de emergencia', url: 'https://www.cordoba.gov.co/publicaciones/7104/' },
];

/* ── Satellite Comparison (swipe) ── */

function SatelliteComparison() {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.max(3, Math.min(97, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  useEffect(() => {
    const up = () => { dragging.current = false; };
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      updatePos(e.clientX);
    };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointermove', move);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointermove', move);
    };
  }, [updatePos]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl border border-zinc-700 select-none touch-none"
      style={{ aspectRatio: '16 / 10' }}
      onPointerDown={(e) => { dragging.current = true; updatePos(e.clientX); }}
    >
      {/* Before image (full, behind) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={NASA_BEFORE}
        alt="Cordoba antes de la inundacion, 23 de enero de 2026"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        draggable={false}
      />

      {/* During image (clipped to right of divider) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={NASA_DURING}
          alt="Cordoba durante la inundacion, 9 de febrero de 2026"
          className="w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white/90 z-20 pointer-events-none"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center gap-1 pointer-events-auto cursor-ew-resize">
          <div className="w-0.5 h-4 bg-zinc-400 rounded-full" />
          <div className="w-0.5 h-4 bg-zinc-400 rounded-full" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-10 bg-emerald-600/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-semibold text-white shadow-lg">
        23 Ene 2026 — Antes
      </div>
      <div className="absolute top-3 right-3 z-10 bg-red-600/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-semibold text-white shadow-lg">
        9 Feb 2026 — Inundacion
      </div>

      {/* Instruction */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-zinc-900/70 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] text-zinc-300">
        Arrastre para comparar
      </div>
    </div>
  );
}

/* ── Main Page ── */

export default function EventoInundacion2026() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <span className="text-sm font-semibold text-zinc-200">SAT Cordoba</span>
              <span className="text-[11px] text-zinc-500 ml-2 hidden sm:inline">Caso de Estudio</span>
            </div>
          </div>
          <Link
            href="/comando"
            className="text-xs px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors"
          >
            Centro de Comando
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/40 via-zinc-950/80 to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-red-600/5 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-8">
            <AlertTriangle size={14} />
            Evento Historico
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Inundacion de Cordoba
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-2">Febrero 2026</p>
          <p className="text-sm text-zinc-500 max-w-xl mx-auto mb-12 leading-relaxed">
            La peor inundacion en la historia del departamento. Un frente frio
            atipico provoco el desbordamiento del Rio Sinu, afectando 24 municipios.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Users, value: '78,000', label: 'Familias damnificadas', color: 'text-red-400', border: 'border-red-500/20' },
              { icon: MapPin, value: '73,475 ha', label: 'Hectareas inundadas', color: 'text-sky-400', border: 'border-sky-500/20' },
              { icon: Droplets, value: '2,500 m\u00B3/s', label: 'Caudal max. Sinu', color: 'text-cyan-400', border: 'border-cyan-500/20' },
              { icon: AlertTriangle, value: '24/30', label: 'Municipios afectados', color: 'text-orange-400', border: 'border-orange-500/20' },
            ].map(({ icon: Icon, value, label, color, border }) => (
              <div key={label} className={`bg-zinc-900/60 backdrop-blur border ${border} rounded-xl p-5`}>
                <Icon size={20} className={`${color} mx-auto mb-3`} />
                <div className="text-2xl md:text-3xl font-bold text-white">{value}</div>
                <div className="text-[11px] text-zinc-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NASA Satellite Comparison ── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-6 rounded-full bg-sky-500" />
          <h2 className="text-xl font-bold text-white">Vista Satelital: Antes vs. Durante</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-6 ml-4">
          Imagenes Landsat 9 (NASA Earth Observatory) en falso color. Las areas
          oscuras/azules representan agua; el verde es vegetacion.
          <strong className="text-zinc-300"> Arrastre el control deslizante</strong> para comparar.
        </p>
        <SatelliteComparison />
        <p className="mt-3 text-[11px] text-zinc-500 ml-4">
          Fuente: NASA Earth Observatory / Landsat 9 OLI-2 (bandas 7-5-4) &middot;
          Resolucion: 30m
        </p>
      </section>

      {/* ── Timeline ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-6 rounded-full bg-amber-500" />
          <h2 className="text-xl font-bold text-white">Cronologia del Evento</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-10 ml-4">
          Como se desarrollo la emergencia — y que alertas habria generado el SAT
        </p>

        <div className="relative ml-4">
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gradient-to-b from-yellow-500/40 via-red-500/60 to-red-500/20" />
          <div className="space-y-8">
            {timeline.map((ev, i) => {
              const s = lvl[ev.level];
              return (
                <div key={i} className="flex gap-5 relative">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 ${s.ring}`}>
                    <div className={`w-3 h-3 rounded-full ${s.dot}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-mono text-zinc-400">{ev.date}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.badge}`}>{ev.alert}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-100">{ev.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{ev.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Interactive Flood Map ── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-6 rounded-full bg-sky-500" />
          <h2 className="text-xl font-bold text-white">Progresion de la Inundacion</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-6 ml-4">
          Mapa interactivo mostrando la extension de la inundacion por municipio.
          Presione <span className="text-sky-400 font-medium">&#9654;</span> para
          animar la progresion o arrastre el control. Pase el cursor sobre cada
          municipio para ver hectareas afectadas.
        </p>
        <FloodMap />
        <p className="mt-3 text-[11px] text-zinc-500 ml-4">
          Datos: MapBiomas (Sentinel-1/2) &middot; UNGRD &middot; Copernicus EMSR865
        </p>
      </section>

      {/* ── Impact by Municipality ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-6 rounded-full bg-blue-500" />
          <h2 className="text-xl font-bold text-white">Impacto por Municipio</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-8 ml-4">
          Hectareas inundadas segun analisis satelital (MapBiomas / Sentinel)
        </p>

        <div className="space-y-3 ml-4">
          {impactData.map((m) => (
            <div key={m.name} className="flex items-center gap-4">
              <span className="w-36 text-xs text-zinc-300 text-right shrink-0 font-medium">{m.name}</span>
              <div className="flex-1 h-8 bg-zinc-900/80 rounded-lg overflow-hidden border border-zinc-800/50">
                <div
                  className="h-full rounded-lg flex items-center px-3 transition-all duration-500"
                  style={{
                    width: `${Math.max(8, (m.ha / 28054) * 100)}%`,
                    background: `linear-gradient(90deg, #0284c7, #38bdf8)`,
                  }}
                >
                  <span className="text-[11px] text-white font-semibold whitespace-nowrap drop-shadow-sm">
                    {m.ha.toLocaleString()} ha
                  </span>
                </div>
              </div>
              <span className="text-xs text-zinc-500 w-14 text-right shrink-0 tabular-nums">{m.pct}%</span>
            </div>
          ))}
        </div>

        {/* Secondary KPIs */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 ml-4">
          {[
            { value: '72,266', label: 'ha agricolas', color: 'text-amber-400', Icon: Droplets },
            { value: '4,047', label: 'Viviendas destruidas', color: 'text-red-400', Icon: Building2 },
            { value: '22,935', label: 'Viviendas danadas', color: 'text-orange-400', Icon: Home },
            { value: '546,000', label: 'Cabezas de ganado', color: 'text-cyan-400', Icon: AlertTriangle },
          ].map(({ value, label, color, Icon }) => (
            <div key={label} className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 text-center">
              <Icon size={18} className={`${color} mx-auto mb-2`} />
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Value Proposition ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-br from-sky-950/60 via-zinc-900 to-zinc-900 border border-sky-800/30 rounded-2xl p-8 md:p-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-sky-500/5 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-5">
              <Shield size={22} className="text-sky-400" />
              <h2 className="text-2xl font-bold text-white">Ventana de Accion</h2>
            </div>
            <p className="text-sm text-zinc-300 mb-8 leading-relaxed max-w-2xl">
              Con el SAT Cordoba activo, las autoridades habrian tenido{' '}
              <strong className="text-sky-400">5-7 dias de anticipacion</strong>{' '}
              desde las primeras senales hasta el pico. Tiempo suficiente para
              evacuar, movilizar ganado y activar protocolos de emergencia.
            </p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { val: '5-7', unit: 'dias', sub: 'de anticipacion', c: 'text-sky-400' },
                { val: '78K', unit: '', sub: 'familias alertadas a tiempo', c: 'text-emerald-400' },
                { val: '40-60%', unit: '', sub: 'reduccion de perdidas', c: 'text-amber-400' },
              ].map((k) => (
                <div key={k.sub} className="text-center">
                  <div className={`text-3xl md:text-4xl font-extrabold ${k.c}`}>
                    {k.val}
                    {k.unit && <span className="text-lg font-medium ml-1">{k.unit}</span>}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/comando" className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors text-center shadow-lg shadow-sky-900/30">
                Ver Centro de Comando
              </Link>
              <Link href="/" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-medium transition-colors text-center">
                Ir al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sources ── */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4 ml-4">Fuentes y referencias</h3>
        <div className="grid md:grid-cols-2 gap-2 ml-4">
          {sources.map(({ label, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-sky-400 transition-colors py-1.5"
            >
              <ExternalLink size={11} className="shrink-0" />
              {label}
            </a>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="max-w-4xl mx-auto px-4 py-8 border-t border-zinc-800/60 text-center">
        <p className="text-[11px] text-zinc-600">
          SAT Cordoba &middot; Sistema de Alertas Tempranas &middot; Departamento de Cordoba
        </p>
      </footer>
    </div>
  );
}
