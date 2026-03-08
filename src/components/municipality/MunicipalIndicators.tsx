'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatNumber } from '@/lib/utils';
import {
  GraduationCap, Hospital, Beef, Wheat,
  Users, TrendingDown, Activity, Building2
} from 'lucide-react';

// Data imports
import educationData from '@/data/education-institutions.json';
import healthData from '@/data/health-institutions.json';
import nbiData from '@/data/nbi-data.json';
import agricultureData from '@/data/agriculture-data.json';
import livestockData from '@/data/livestock-data.json';
import emergencyData from '@/data/ungrd-emergencies.json';
import stationsData from '@/data/ideam-stations.json';

interface MunicipalIndicatorsProps {
  municipalityName: string;
  municipalitySlug: string;
}

type EducationRecord = { municipality: string; count: number; rural: number; urban: number };
type HealthRecord = { municipality: string; total: number; hospitals: number; centers: number };
type NBIRecord = { municipality: string; nbi_total: number; nbi_urban: number; nbi_rural: number };
type AgricultureRecord = { municipality: string; total_ha: number; main_crops: string[]; total_production_tons: number };
type LivestockRecord = { municipality: string; cattle_heads: number; area_pasture_ha: number };
type EmergencyRecord = { municipality: string; affected: number; deaths: number; destroyed_homes: number; damaged_homes: number };
type StationRecord = { municipality: string; active: boolean };

function normalize(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '')
    .trim();
}

function matchMuni(recordMuni: string, targetName: string): boolean {
  const a = normalize(recordMuni);
  const b = normalize(targetName);
  return a.includes(b) || b.includes(a) || a === b;
}

export default function MunicipalIndicators({ municipalityName, municipalitySlug }: MunicipalIndicatorsProps) {
  const indicators = useMemo(() => {
    const name = municipalityName;

    // Education
    const eduRecords = (educationData as EducationRecord[]);
    const edu = eduRecords.find(e => matchMuni(e.municipality, name));

    // Health
    const healthRecords = (healthData as HealthRecord[]);
    const health = healthRecords.find(h => matchMuni(h.municipality, name));

    // NBI
    const nbiRecords = (nbiData as NBIRecord[]);
    const nbi = nbiRecords.find(n => matchMuni(n.municipality, name));

    // Agriculture
    const agriRecords = (agricultureData as AgricultureRecord[]);
    const agri = agriRecords.find(a => matchMuni(a.municipality, name));

    // Livestock
    const liveRecords = (livestockData as LivestockRecord[]);
    const live = liveRecords.find(l => matchMuni(l.municipality, name));

    // Emergency history for this municipality
    const emergencies = (emergencyData as EmergencyRecord[]).filter(e =>
      matchMuni(e.municipality, name)
    );
    const totalAffected = emergencies.reduce((s, e) => s + (e.affected || 0), 0);
    const totalDeaths = emergencies.reduce((s, e) => s + (e.deaths || 0), 0);
    const totalHomesImpacted = emergencies.reduce((s, e) => s + (e.destroyed_homes || 0) + (e.damaged_homes || 0), 0);

    // IDEAM stations
    const stations = (stationsData as StationRecord[]).filter(s =>
      matchMuni(s.municipality, name)
    );
    const activeStations = stations.filter(s => s.active).length;

    return {
      edu,
      health,
      nbi,
      agri,
      live,
      emergencyCount: emergencies.length,
      totalAffected,
      totalDeaths,
      totalHomesImpacted,
      stationCount: stations.length,
      activeStations,
    };
  }, [municipalityName]);

  return (
    <div className="space-y-4">
      {/* Vulnerability */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Users size={14} className="text-purple-400" />
              Vulnerabilidad Socioeconómica
            </span>
          </CardTitle>
        </CardHeader>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-zinc-700 p-2.5 text-center">
            <div className="text-xl font-bold text-zinc-100">
              {indicators.nbi ? `${indicators.nbi.nbi_total.toFixed(1)}%` : '—'}
            </div>
            <div className="text-[10px] text-zinc-500">NBI Total</div>
          </div>
          <div className="rounded-lg border border-zinc-700 p-2.5 text-center">
            <div className="text-xl font-bold text-zinc-100">
              {indicators.nbi ? `${indicators.nbi.nbi_urban.toFixed(1)}%` : '—'}
            </div>
            <div className="text-[10px] text-zinc-500">NBI Urbano</div>
          </div>
          <div className="rounded-lg border border-zinc-700 p-2.5 text-center">
            <div className="text-xl font-bold text-zinc-100">
              {indicators.nbi ? `${indicators.nbi.nbi_rural.toFixed(1)}%` : '—'}
            </div>
            <div className="text-[10px] text-zinc-500">NBI Rural</div>
          </div>
        </div>
        {indicators.nbi && indicators.nbi.nbi_total > 50 && (
          <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
            <TrendingDown size={12} />
            Alta vulnerabilidad socioeconómica — priorizar atención
          </div>
        )}
      </Card>

      {/* Exposure - Infrastructure */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Building2 size={14} className="text-blue-400" />
              Infraestructura Expuesta
            </span>
          </CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-3">
          {/* Education */}
          <div className="rounded-lg border border-zinc-700 p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <GraduationCap size={13} className="text-indigo-400" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Sedes Educativas</span>
            </div>
            <div className="text-xl font-bold text-zinc-100">
              {indicators.edu ? formatNumber(indicators.edu.count) : '—'}
            </div>
            {indicators.edu && (
              <div className="text-[10px] text-zinc-500 mt-0.5">
                Rural: {indicators.edu.rural} · Urbano: {indicators.edu.urban}
              </div>
            )}
          </div>

          {/* Health */}
          <div className="rounded-lg border border-zinc-700 p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Hospital size={13} className="text-red-400" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Centros de Salud</span>
            </div>
            <div className="text-xl font-bold text-zinc-100">
              {indicators.health ? formatNumber(indicators.health.total) : '—'}
            </div>
            {indicators.health && (
              <div className="text-[10px] text-zinc-500 mt-0.5">
                Hospitales: {indicators.health.hospitals} · Centros: {indicators.health.centers}
              </div>
            )}
          </div>

          {/* Agriculture */}
          <div className="rounded-lg border border-zinc-700 p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Wheat size={13} className="text-amber-400" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Área Agrícola</span>
            </div>
            <div className="text-xl font-bold text-zinc-100">
              {indicators.agri ? `${formatNumber(indicators.agri.total_ha)} ha` : '—'}
            </div>
            {indicators.agri && indicators.agri.main_crops.length > 0 && (
              <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                {indicators.agri.main_crops.slice(0, 3).join(', ')}
              </div>
            )}
          </div>

          {/* Livestock */}
          <div className="rounded-lg border border-zinc-700 p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Beef size={13} className="text-green-400" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Ganadería</span>
            </div>
            <div className="text-xl font-bold text-zinc-100">
              {indicators.live ? formatNumber(indicators.live.cattle_heads) : '—'}
            </div>
            {indicators.live && (
              <div className="text-[10px] text-zinc-500 mt-0.5">
                cabezas · {formatNumber(indicators.live.area_pasture_ha)} ha pastos
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Response capacity */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Activity size={14} className="text-emerald-400" />
              Capacidad de Monitoreo
            </span>
          </CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-zinc-700 p-2.5 text-center">
            <div className="text-xl font-bold text-zinc-100">{indicators.stationCount}</div>
            <div className="text-[10px] text-zinc-500">Estaciones IDEAM</div>
          </div>
          <div className="rounded-lg border border-zinc-700 p-2.5 text-center">
            <div className="text-xl font-bold text-emerald-400">{indicators.activeStations}</div>
            <div className="text-[10px] text-zinc-500">Estaciones activas</div>
          </div>
        </div>
      </Card>

      {/* Historical impact */}
      {indicators.emergencyCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <TrendingDown size={14} className="text-amber-400" />
                Historial de Impacto
              </span>
            </CardTitle>
            <span className="text-[10px] text-zinc-500">Fuente: UNGRD</span>
          </CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-zinc-700 p-2.5 text-center">
              <div className="text-xl font-bold text-zinc-100">{indicators.emergencyCount}</div>
              <div className="text-[10px] text-zinc-500">Eventos</div>
            </div>
            <div className="rounded-lg border border-zinc-700 p-2.5 text-center">
              <div className="text-xl font-bold text-zinc-100">{formatNumber(indicators.totalAffected)}</div>
              <div className="text-[10px] text-zinc-500">Personas afectadas</div>
            </div>
            <div className="rounded-lg border border-zinc-700 p-2.5 text-center">
              <div className="text-xl font-bold text-zinc-100">{formatNumber(indicators.totalHomesImpacted)}</div>
              <div className="text-[10px] text-zinc-500">Viviendas impactadas</div>
            </div>
            <div className="rounded-lg border border-zinc-700 p-2.5 text-center">
              <div className="text-xl font-bold text-red-400">{indicators.totalDeaths}</div>
              <div className="text-[10px] text-zinc-500">Fallecidos</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
