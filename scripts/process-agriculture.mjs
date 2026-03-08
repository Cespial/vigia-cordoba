/**
 * process-agriculture.mjs
 *
 * Reads raw_agriculture.json downloaded from datos.gov.co (dataset 2pnw-mmge)
 * and produces a structured summary grouped by municipality and crop type.
 *
 * Output: src/data/agriculture-data.json
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT = resolve(__dirname, "raw_agriculture.json");
const OUTPUT = resolve(__dirname, "..", "src", "data", "agriculture-data.json");

// ---------------------------------------------------------------------------
// 1. Load raw records
// ---------------------------------------------------------------------------
const raw = JSON.parse(readFileSync(INPUT, "utf-8"));
console.log(`Loaded ${raw.length} raw agriculture records for Córdoba.`);

// ---------------------------------------------------------------------------
// 2. Use the most recent year available for the primary summary so that we
//    present a single snapshot rather than multi-year aggregates that would
//    double-count area.
// ---------------------------------------------------------------------------
const years = [...new Set(raw.map((r) => r.a_o))].sort();
const latestYear = years[years.length - 1];
console.log(`Years in dataset: ${years.join(", ")}`);
console.log(`Using latest year for summary: ${latestYear}`);

const latestRecords = raw.filter((r) => r.a_o === latestYear);
console.log(`Records for ${latestYear}: ${latestRecords.length}`);

// ---------------------------------------------------------------------------
// 3. Group by municipality -> crop
// ---------------------------------------------------------------------------
/** @type {Record<string, Record<string, {area_planted: number, area_harvested: number, production: number}>>} */
const byMuniCrop = {};

for (const r of latestRecords) {
  const muni = r.municipio?.trim() || "DESCONOCIDO";
  const crop = r.cultivo?.trim() || "OTRO";
  const areaSembrada = parseFloat(r.rea_sembrada_ha) || 0;
  const areaCosechada = parseFloat(r.rea_cosechada_ha) || 0;
  const produccion = parseFloat(r.producci_n_t) || 0;

  if (!byMuniCrop[muni]) byMuniCrop[muni] = {};
  if (!byMuniCrop[muni][crop]) {
    byMuniCrop[muni][crop] = { area_planted: 0, area_harvested: 0, production: 0 };
  }

  byMuniCrop[muni][crop].area_planted += areaSembrada;
  byMuniCrop[muni][crop].area_harvested += areaCosechada;
  byMuniCrop[muni][crop].production += produccion;
}

// ---------------------------------------------------------------------------
// 4. Build per-municipality summaries
// ---------------------------------------------------------------------------
const municipalities = Object.keys(byMuniCrop).sort();

const municipalitySummaries = municipalities.map((muni) => {
  const crops = byMuniCrop[muni];
  const cropList = Object.entries(crops).map(([crop, stats]) => {
    const yieldPerHa =
      stats.area_harvested > 0
        ? Math.round((stats.production / stats.area_harvested) * 100) / 100
        : 0;
    return {
      crop,
      area_planted_ha: Math.round(stats.area_planted * 100) / 100,
      area_harvested_ha: Math.round(stats.area_harvested * 100) / 100,
      production_tons: Math.round(stats.production * 100) / 100,
      yield_tons_per_ha: yieldPerHa,
    };
  });

  // Sort crops by area planted descending
  cropList.sort((a, b) => b.area_planted_ha - a.area_planted_ha);

  const totalHa = cropList.reduce((s, c) => s + c.area_planted_ha, 0);
  const totalProduction = cropList.reduce((s, c) => s + c.production_tons, 0);
  const mainCrops = cropList.slice(0, 5).map((c) => c.crop);

  return {
    municipality: muni,
    total_area_planted_ha: Math.round(totalHa * 100) / 100,
    total_production_tons: Math.round(totalProduction * 100) / 100,
    main_crops: mainCrops,
    num_crops: cropList.length,
    crops: cropList,
  };
});

// Sort municipalities by total area descending
municipalitySummaries.sort((a, b) => b.total_area_planted_ha - a.total_area_planted_ha);

// ---------------------------------------------------------------------------
// 5. Department-level totals
// ---------------------------------------------------------------------------
const departmentTotalHa = municipalitySummaries.reduce(
  (s, m) => s + m.total_area_planted_ha,
  0,
);
const departmentTotalProduction = municipalitySummaries.reduce(
  (s, m) => s + m.total_production_tons,
  0,
);

// Aggregate crops at department level
const deptCrops = {};
for (const muni of municipalitySummaries) {
  for (const c of muni.crops) {
    if (!deptCrops[c.crop]) {
      deptCrops[c.crop] = { area_planted_ha: 0, production_tons: 0 };
    }
    deptCrops[c.crop].area_planted_ha += c.area_planted_ha;
    deptCrops[c.crop].production_tons += c.production_tons;
  }
}
const topCropsDept = Object.entries(deptCrops)
  .map(([crop, stats]) => ({ crop, ...stats }))
  .sort((a, b) => b.area_planted_ha - a.area_planted_ha);

// ---------------------------------------------------------------------------
// 6. Build the final output
// ---------------------------------------------------------------------------
const output = {
  meta: {
    source: "datos.gov.co - Evaluaciones Agropecuarias Municipales (dataset 2pnw-mmge)",
    department: "CORDOBA",
    year: latestYear,
    total_records: latestRecords.length,
    years_available: years,
    generated_at: new Date().toISOString(),
  },
  department_summary: {
    total_area_planted_ha: Math.round(departmentTotalHa * 100) / 100,
    total_production_tons: Math.round(departmentTotalProduction * 100) / 100,
    num_municipalities: municipalities.length,
    top_crops: topCropsDept.slice(0, 10),
  },
  municipalities: municipalitySummaries,
};

// ---------------------------------------------------------------------------
// 7. Write output
// ---------------------------------------------------------------------------
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(output, null, 2), "utf-8");
console.log(`\nWrote agriculture data to ${OUTPUT}`);
console.log(`  Municipalities: ${municipalities.length}`);
console.log(`  Dept total area planted: ${departmentTotalHa.toLocaleString()} ha`);
console.log(`  Dept total production: ${departmentTotalProduction.toLocaleString()} tons`);
console.log(`  Top 5 crops (by area):`);
for (const c of topCropsDept.slice(0, 5)) {
  console.log(`    - ${c.crop}: ${c.area_planted_ha.toLocaleString()} ha, ${c.production_tons.toLocaleString()} t`);
}
