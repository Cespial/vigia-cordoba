# Vigía Córdoba — Sistema de Alertas Tempranas

> Plataforma de monitoreo y alerta temprana para gestión del riesgo por inundaciones en Córdoba, Colombia. Dashboard en tiempo real con datos hidrometeorológicos, pronósticos extendidos e índices de riesgo municipal.

[![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Mapbox GL](https://img.shields.io/badge/Mapbox_GL-3-000?logo=mapbox&logoColor=white)](https://www.mapbox.com)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)

## Descripción

Vigía Córdoba integra datos de estaciones IDEAM, registros históricos de la UNGRD, índices ENSO/ONI y pronósticos meteorológicos para ofrecer una herramienta de toma de decisiones para gestores del riesgo, alcaldías y organismos de socorro en los 30 municipios de Córdoba.

### Características principales

- **Mapa interactivo** con Mapbox GL + React Map GL — estaciones hidrometeorológicas, cuencas hidrográficas, límites municipales, ríos principales
- **Índice de riesgo compuesto** — combina precipitación, niveles de río, ENSO, vulnerabilidad socioeconómica (NBI) y capacidad de respuesta
- **Módulos temáticos:**
  - `/` — Dashboard principal con resumen ejecutivo, alertas activas y KPIs
  - `/comando` — Centro de comando para coordinación de emergencias
  - `/comparador` — Comparación entre municipios
  - `/cuencas` — Monitoreo por cuenca hidrográfica (Sinú, San Jorge, Canalete)
  - `/ejecutivo` — Resumen ejecutivo para tomadores de decisión
  - `/historico` — Series históricas de emergencias y precipitación
  - `/reporte` — Generación de reportes
  - `/municipio/[slug]` — Perfil detallado por municipio
  - `/evento/inundacion-2026/` — Cobertura de eventos específicos
- **API Routes** — endpoints para alertas, emergencias, pronósticos, estaciones y datos de inundación
- **Indicador ENSO** — monitoreo del fenómeno El Niño / La Niña con datos ONI
- **Pronóstico extendido** — forecast meteorológico a varios días
- **Suite de tests** completa con Vitest + Testing Library

### Datos integrados

| Fuente | Tipo | Archivo |
|--------|------|---------|
| IDEAM | Estaciones hidrometeorológicas | `ideam-stations.json` |
| UNGRD | Emergencias históricas | `ungrd-emergencies.json` |
| NOAA | Índice ONI (ENSO) | `enso-oni.json` |
| DANE | NBI municipal | `nbi-data.json` |
| IGAC | Límites municipales | `cordoba-boundaries.json` |
| IGAC | Red hídrica | `cordoba-rivers.json` |
| MinEducación | Instituciones educativas | `education-institutions.json` |
| MinSalud | Instituciones de salud | `health-institutions.json` |
| MinAgricultura | Producción agrícola | `agriculture-data.json` |
| FEDEGAN | Inventario ganadero | `livestock-data.json` |

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16, React 19 |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Mapas | Mapbox GL JS 3 + React Map GL |
| Mapas (alt) | Leaflet + React Leaflet |
| Gráficos | Recharts |
| Fechas | date-fns |
| Iconos | Lucide React |
| Testing | Vitest 4 + Testing Library + jsdom |

## Estructura del proyecto

```
vigia-cordoba/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── api/                  # API routes (alerts, emergencias, flood, forecast, stations, weather)
│   │   ├── comando/              # Centro de comando
│   │   ├── comparador/           # Comparador municipal
│   │   ├── cuencas/              # Monitoreo por cuenca
│   │   ├── ejecutivo/            # Resumen ejecutivo
│   │   ├── historico/            # Datos históricos
│   │   ├── reporte/              # Generador de reportes
│   │   ├── municipio/[slug]/     # Perfiles municipales
│   │   └── evento/inundacion-2026/
│   ├── components/
│   │   ├── charts/               # ENSOIndicator, FloodChart, PrecipitationChart, etc.
│   │   ├── dashboard/            # AlertsSummary, ExecutiveSummary, Header, Sidebar, etc.
│   │   ├── evento/               # FloodMap
│   │   ├── map/                  # LayerControl, MapLegend, MapView
│   │   ├── municipality/         # MunicipalIndicators
│   │   └── ui/                   # AlertBadge, Card, Skeleton
│   ├── lib/                      # API client, hooks, risk-score, utils
│   ├── types/                    # TypeScript definitions
│   ├── data/                     # 12+ JSON datasets
│   └── __tests__/                # Test suite (api, components, data, integration, lib, pages)
├── scripts/                      # Data processing scripts (Node.js)
├── public/                       # Assets estáticos
├── vitest.config.ts
└── package.json
```

## Instalación

```bash
git clone https://github.com/Cespial/vigia-cordoba.git
cd vigia-cordoba
npm install
npm run dev
```

### Variables de entorno

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### Tests

```bash
npm test              # Ejecutar tests
npm run test:watch    # Modo watch
npm run test:coverage # Cobertura
```

### Procesamiento de datos

Los scripts en `scripts/` procesan datos crudos de las fuentes oficiales:

```bash
node scripts/process-all-new.mjs  # Procesar todos los datasets
```

## Licencia

MIT

---

Desarrollado por [Cristian Espinal Maya](https://github.com/Cespial) · [fourier.dev](https://fourier.dev)
