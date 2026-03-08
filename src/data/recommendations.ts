import type { AlertLevel } from '@/types';

export interface Recommendation {
  action: string;
  icon: 'shield' | 'alert' | 'phone' | 'map' | 'radio' | 'home';
}

export const recommendations: Record<AlertLevel['level'], Recommendation[]> = {
  rojo: [
    { action: 'Evacuar inmediatamente zonas bajas y ribereñas', icon: 'alert' },
    { action: 'Dirigirse a albergues o zonas altas identificadas', icon: 'map' },
    { action: 'Llamar a la línea de emergencias 123', icon: 'phone' },
    { action: 'No cruzar ríos, caños o zonas inundadas', icon: 'shield' },
    { action: 'Seguir instrucciones de organismos de socorro', icon: 'radio' },
    { action: 'Desconectar servicios de gas y electricidad', icon: 'home' },
  ],
  naranja: [
    { action: 'Preparar kit de emergencia con documentos y medicinas', icon: 'home' },
    { action: 'Identificar ruta de evacuación más cercana', icon: 'map' },
    { action: 'Estar atento a comunicados oficiales de la alcaldía', icon: 'radio' },
    { action: 'Mover animales y enseres a zonas altas', icon: 'shield' },
    { action: 'Tener a mano contactos de emergencia (123, Bomberos)', icon: 'phone' },
  ],
  amarillo: [
    { action: 'Monitorear constantemente el nivel del río', icon: 'alert' },
    { action: 'Revisar y actualizar plan familiar de emergencia', icon: 'home' },
    { action: 'Mantener canales de comunicación activos', icon: 'radio' },
    { action: 'Evitar acampar o pernoctar cerca de cauces', icon: 'shield' },
  ],
  verde: [
    { action: 'Condiciones normales — mantener monitoreo preventivo', icon: 'shield' },
    { action: 'Revisar periódicamente este sistema de alertas', icon: 'radio' },
  ],
};

export const emergencyContacts = [
  { name: 'Línea de Emergencias', number: '123' },
  { name: 'Bomberos Montería', number: '(4) 786-0119' },
  { name: 'Defensa Civil Córdoba', number: '144' },
  { name: 'Cruz Roja Córdoba', number: '132' },
  { name: 'UNGRD', number: '01 8000 113 200' },
];
