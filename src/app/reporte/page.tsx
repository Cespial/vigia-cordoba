'use client';

import { useMemo } from 'react';
import { useAlerts } from '@/lib/hooks';
import { formatNumber } from '@/lib/utils';
import { municipalities, cuencas } from '@/data/municipalities';
import { alertLevels } from '@/data/thresholds';
import { Printer, FileText } from 'lucide-react';
import stationsData from '@/data/ideam-stations.json';
import nbiData from '@/data/nbi-data.json';
import livestockData from '@/data/livestock-data.json';
import educationData from '@/data/education-institutions.json';
import healthData from '@/data/health-institutions.json';

type StationRecord = { municipality: string; active: boolean };
type NBIRecord = { municipality: string; nbi_total: number };
type LivestockRecord = { municipality: string; cattle_heads: number };
type EduRecord = { municipality: string; count: number };
type HealthRecord = { municipality: string; total: number };

const levelLabels: Record<string, string> = {
  rojo: 'ROJO',
  naranja: 'NARANJA',
  amarillo: 'AMARILLO',
  verde: 'VERDE',
};

const levelPrintColors: Record<string, string> = {
  rojo: '#dc2626',
  naranja: '#ea580c',
  amarillo: '#ca8a04',
  verde: '#16a34a',
};

const levelSeverity: Record<string, number> = { rojo: 4, naranja: 3, amarillo: 2, verde: 1 };

export default function ReportePage() {
  const { alerts, loading } = useAlerts();

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
  });

  const analysis = useMemo(() => {
    if (alerts.length === 0) return null;

    const counts = { rojo: 0, naranja: 0, amarillo: 0, verde: 0 };
    let totalPrecip = 0;
    let maxPrecip = 0;
    let maxPrecipMuni = '';
    let maxDischarge = 0;
    let maxDischargeMuni = '';
    let popAtRisk = 0;
    let popHighRisk = 0;

    alerts.forEach(a => {
      counts[a.alertLevel.level]++;
      totalPrecip += a.precipitationForecast24h;
      if (a.precipitationForecast24h > maxPrecip) {
        maxPrecip = a.precipitationForecast24h;
        maxPrecipMuni = a.municipality.name;
      }
      if (a.riverDischarge > maxDischarge) {
        maxDischarge = a.riverDischarge;
        maxDischargeMuni = a.municipality.name;
      }
      if (a.alertLevel.level !== 'verde') popAtRisk += a.municipality.population || 0;
      if (a.alertLevel.level === 'rojo' || a.alertLevel.level === 'naranja') popHighRisk += a.municipality.population || 0;
    });

    const overallLevel = counts.rojo > 0 ? 'rojo'
      : counts.naranja > 0 ? 'naranja'
      : counts.amarillo > 0 ? 'amarillo' : 'verde';

    const totalPop = municipalities.reduce((s, m) => s + (m.population || 0), 0);

    const cuencaAnalysis = cuencas.map(c => {
      const munis = municipalities.filter(m => m.cuenca === c.name);
      const cuencaAlerts = alerts.filter(a => a.municipality.cuenca === c.name);
      const worst = cuencaAlerts.reduce((w, a) =>
        levelSeverity[a.alertLevel.level] > levelSeverity[w] ? a.alertLevel.level : w, 'verde');
      const avgP = cuencaAlerts.length
        ? cuencaAlerts.reduce((s, a) => s + a.precipitationForecast24h, 0) / cuencaAlerts.length : 0;
      const maxD = cuencaAlerts.reduce((m, a) => Math.max(m, a.riverDischarge), 0);
      const pop = munis.reduce((s, m) => s + (m.population || 0), 0);
      return { ...c, worst, avgPrecip: avgP, maxDischarge: maxD, population: pop, muniCount: munis.length };
    });

    const critical = [...alerts]
      .sort((a, b) => {
        const d = levelSeverity[b.alertLevel.level] - levelSeverity[a.alertLevel.level];
        return d !== 0 ? d : b.precipitationForecast24h - a.precipitationForecast24h;
      })
      .slice(0, 10);

    return {
      counts, overallLevel, avgPrecip: totalPrecip / alerts.length,
      maxPrecip, maxPrecipMuni, maxDischarge, maxDischargeMuni,
      popAtRisk, popHighRisk, totalPop, cuencaAnalysis, critical
    };
  }, [alerts]);

  // Socioeconomic totals
  const socioeconomic = useMemo(() => {
    const nbi = nbiData as NBIRecord[];
    const avgNBI = nbi.length ? nbi.reduce((s, n) => s + n.nbi_total, 0) / nbi.length : 0;
    const totalCattle = (livestockData as LivestockRecord[]).reduce((s, l) => s + l.cattle_heads, 0);
    const totalEdu = (educationData as EduRecord[]).reduce((s, e) => s + e.count, 0);
    const totalHealth = (healthData as HealthRecord[]).reduce((s, h) => s + h.total, 0);
    const stations = stationsData as StationRecord[];
    const totalStations = stations.length;
    const activeStations = stations.filter(s => s.active).length;

    return { avgNBI, totalCattle, totalEdu, totalHealth, totalStations, activeStations };
  }, []);

  if (loading) {
    return (
      <div className="report-page">
        <div className="report-loading">
          <FileText size={48} strokeWidth={1} />
          <p>Generando informe de situación...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="report-page">
        <div className="report-loading">
          <p>Sin datos disponibles para generar el informe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page">
      {/* Print button - hidden in print */}
      <div className="report-no-print report-print-bar">
        <button
          onClick={() => window.print()}
          className="report-print-btn"
        >
          <Printer size={18} />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Report header */}
      <header className="report-header">
        <div className="report-header-logo">
          <FileText size={32} />
        </div>
        <h1 className="report-title">INFORME DE SITUACIÓN — SAT Córdoba</h1>
        <p className="report-subtitle">Departamento de Córdoba, Colombia</p>
        <p className="report-date">
          {dateStr} — {timeStr} (hora Colombia)
        </p>
      </header>

      <hr className="report-divider" />

      {/* Section 1: Estado General */}
      <section className="report-section">
        <h2 className="report-section-title">1. Estado General del Departamento</h2>

        <div className="report-alert-banner" style={{ borderColor: levelPrintColors[analysis.overallLevel] }}>
          <span className="report-alert-label">Nivel de Alerta Departamental:</span>
          <span
            className="report-alert-level"
            style={{ color: levelPrintColors[analysis.overallLevel] }}
          >
            ALERTA {levelLabels[analysis.overallLevel]}
          </span>
        </div>

        <table className="report-table report-summary-table">
          <thead>
            <tr>
              <th>Nivel de Alerta</th>
              <th>Municipios</th>
            </tr>
          </thead>
          <tbody>
            {(['rojo', 'naranja', 'amarillo', 'verde'] as const).map(level => (
              <tr key={level}>
                <td>
                  <span className="report-level-dot" style={{ backgroundColor: levelPrintColors[level] }} />
                  {alertLevels[level].label}
                </td>
                <td>{analysis.counts[level]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="report-kpi-grid">
          <div className="report-kpi">
            <div className="report-kpi-value">{formatNumber(analysis.popHighRisk)}</div>
            <div className="report-kpi-label">Población alto riesgo</div>
          </div>
          <div className="report-kpi">
            <div className="report-kpi-value">{formatNumber(analysis.popAtRisk)}</div>
            <div className="report-kpi-label">Población en riesgo</div>
          </div>
          <div className="report-kpi">
            <div className="report-kpi-value">{formatNumber(analysis.maxPrecip, 1)} mm</div>
            <div className="report-kpi-label">Precip. máx. 24h ({analysis.maxPrecipMuni})</div>
          </div>
          <div className="report-kpi">
            <div className="report-kpi-value">{formatNumber(analysis.maxDischarge, 1)} m³/s</div>
            <div className="report-kpi-label">Caudal máx. ({analysis.maxDischargeMuni})</div>
          </div>
        </div>
      </section>

      <hr className="report-divider" />

      {/* Section 2: Municipios Críticos */}
      <section className="report-section">
        <h2 className="report-section-title">2. Municipios Críticos (Top 10)</h2>

        <table className="report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Municipio</th>
              <th>Cuenca</th>
              <th>Nivel</th>
              <th>Precip. (mm)</th>
              <th>Caudal (m³/s)</th>
              <th>Población</th>
            </tr>
          </thead>
          <tbody>
            {analysis.critical.map((a, i) => (
              <tr key={a.municipality.slug}>
                <td>{i + 1}</td>
                <td className="report-td-bold">{a.municipality.name}</td>
                <td>{a.municipality.cuenca}</td>
                <td>
                  <span
                    className="report-level-badge"
                    style={{
                      backgroundColor: levelPrintColors[a.alertLevel.level] + '18',
                      color: levelPrintColors[a.alertLevel.level],
                      borderColor: levelPrintColors[a.alertLevel.level],
                    }}
                  >
                    {levelLabels[a.alertLevel.level]}
                  </span>
                </td>
                <td>{formatNumber(a.precipitationForecast24h, 1)}</td>
                <td>{formatNumber(a.riverDischarge, 1)}</td>
                <td>{formatNumber(a.municipality.population || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <hr className="report-divider" />

      {/* Section 3: Análisis por Cuenca */}
      <section className="report-section">
        <h2 className="report-section-title">3. Análisis por Cuenca Hidrográfica</h2>

        <table className="report-table">
          <thead>
            <tr>
              <th>Cuenca</th>
              <th>Estado</th>
              <th>Municipios</th>
              <th>Precip. prom. (mm)</th>
              <th>Caudal máx. (m³/s)</th>
              <th>Población</th>
            </tr>
          </thead>
          <tbody>
            {analysis.cuencaAnalysis.map(c => (
              <tr key={c.name}>
                <td className="report-td-bold">
                  <span className="report-cuenca-dot" style={{ backgroundColor: c.color }} />
                  {c.name}
                </td>
                <td>
                  <span
                    className="report-level-badge"
                    style={{
                      backgroundColor: levelPrintColors[c.worst] + '18',
                      color: levelPrintColors[c.worst],
                      borderColor: levelPrintColors[c.worst],
                    }}
                  >
                    {alertLevels[c.worst as keyof typeof alertLevels]?.label || 'Normal'}
                  </span>
                </td>
                <td>{c.muniCount}</td>
                <td>{formatNumber(c.avgPrecip, 1)}</td>
                <td>{formatNumber(c.maxDischarge, 0)}</td>
                <td>{formatNumber(c.population)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <hr className="report-divider" />

      {/* Section 4: Indicadores Socioeconómicos */}
      <section className="report-section">
        <h2 className="report-section-title">4. Indicadores Socioeconómicos y de Capacidad</h2>

        <table className="report-table">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Población total del departamento</td>
              <td>{formatNumber(analysis.totalPop)}</td>
            </tr>
            <tr>
              <td>NBI promedio departamental</td>
              <td>{socioeconomic.avgNBI.toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Cabezas de ganado</td>
              <td>{formatNumber(socioeconomic.totalCattle)}</td>
            </tr>
            <tr>
              <td>Sedes educativas</td>
              <td>{formatNumber(socioeconomic.totalEdu)}</td>
            </tr>
            <tr>
              <td>Centros de salud</td>
              <td>{formatNumber(socioeconomic.totalHealth)}</td>
            </tr>
            <tr>
              <td>Estaciones IDEAM (total)</td>
              <td>{socioeconomic.totalStations}</td>
            </tr>
            <tr>
              <td>Estaciones IDEAM activas</td>
              <td>{socioeconomic.activeStations}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <hr className="report-divider" />

      {/* Section 5: Fuentes de Datos */}
      <section className="report-section">
        <h2 className="report-section-title">5. Fuentes de Datos</h2>

        <table className="report-table">
          <thead>
            <tr>
              <th>Fuente</th>
              <th>Descripción</th>
              <th>Última actualización</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="report-td-bold">Open-Meteo</td>
              <td>Pronóstico de precipitación y variables meteorológicas</td>
              <td>{dateStr}</td>
            </tr>
            <tr>
              <td className="report-td-bold">GloFAS (Copernicus)</td>
              <td>Pronóstico de caudales y descargas fluviales</td>
              <td>{dateStr}</td>
            </tr>
            <tr>
              <td className="report-td-bold">IDEAM</td>
              <td>Red de estaciones hidrometeorológicas de Colombia</td>
              <td>Datos estáticos</td>
            </tr>
            <tr>
              <td className="report-td-bold">UNGRD</td>
              <td>Registro histórico de emergencias y desastres</td>
              <td>Datos estáticos</td>
            </tr>
            <tr>
              <td className="report-td-bold">NOAA</td>
              <td>Indicadores ENSO (El Niño / La Niña)</td>
              <td>{dateStr}</td>
            </tr>
            <tr>
              <td className="report-td-bold">DANE</td>
              <td>Necesidades Básicas Insatisfechas (NBI), censo poblacional</td>
              <td>Datos estáticos</td>
            </tr>
            <tr>
              <td className="report-td-bold">datos.gov.co</td>
              <td>Instituciones educativas y de salud</td>
              <td>Datos estáticos</td>
            </tr>
            <tr>
              <td className="report-td-bold">OSM / Esri</td>
              <td>Cartografía base y límites administrativos</td>
              <td>Datos estáticos</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Footer */}
      <footer className="report-footer">
        <hr className="report-divider" />
        <p>Generado automáticamente por SAT Córdoba — sat-cordoba.vercel.app</p>
        <p className="report-footer-date">{dateStr} — {timeStr}</p>
      </footer>
    </div>
  );
}
