import { AlertLevel } from '@/types';

export const alertLevels: Record<string, AlertLevel> = {
  rojo: {
    level: 'rojo',
    label: 'Alerta Roja',
    color: '#dc2626',
    description: 'Riesgo inminente de inundación. Evacuar zonas bajas.',
  },
  naranja: {
    level: 'naranja',
    label: 'Alerta Naranja',
    color: '#f97316',
    description: 'Riesgo alto. Preparar planes de evacuación.',
  },
  amarillo: {
    level: 'amarillo',
    label: 'Alerta Amarilla',
    color: '#eab308',
    description: 'Riesgo moderado. Monitoreo constante recomendado.',
  },
  verde: {
    level: 'verde',
    label: 'Sin Alerta',
    color: '#22c55e',
    description: 'Condiciones normales.',
  },
};

// Precipitation thresholds (mm/24h) - IDEAM reference
export const precipitationThresholds = {
  verde: { max: 20 },
  amarillo: { min: 20, max: 40 },
  naranja: { min: 40, max: 70 },
  rojo: { min: 70 },
};

// River discharge thresholds for Sinú at Montería (m³/s)
export const dischargeThresholds = {
  verde: { max: 300 },
  amarillo: { min: 300, max: 600 },
  naranja: { min: 600, max: 1200 },
  rojo: { min: 1200 },
};

export function getAlertFromPrecipitation(mm24h: number): AlertLevel {
  if (mm24h >= 70) return alertLevels.rojo;
  if (mm24h >= 40) return alertLevels.naranja;
  if (mm24h >= 20) return alertLevels.amarillo;
  return alertLevels.verde;
}

export function getAlertFromDischarge(discharge: number): AlertLevel {
  if (discharge >= 1200) return alertLevels.rojo;
  if (discharge >= 600) return alertLevels.naranja;
  if (discharge >= 300) return alertLevels.amarillo;
  return alertLevels.verde;
}

export function getCombinedAlert(precipMm: number, dischargeMps: number): AlertLevel {
  const precipAlert = getAlertFromPrecipitation(precipMm);
  const dischargeAlert = getAlertFromDischarge(dischargeMps);
  const order: AlertLevel['level'][] = ['rojo', 'naranja', 'amarillo', 'verde'];
  const precipIdx = order.indexOf(precipAlert.level);
  const dischargeIdx = order.indexOf(dischargeAlert.level);
  return alertLevels[order[Math.min(precipIdx, dischargeIdx)]];
}
