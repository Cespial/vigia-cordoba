/**
 * process-health.mjs
 *
 * Reads the raw REPS (Registro Especial de Prestadores de Servicios de Salud)
 * JSON for Cordoba and produces a structured summary of health institutions
 * grouped by municipality.
 *
 * Usage:  node scripts/process-health.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const INPUT = new URL("./raw_health.json", import.meta.url).pathname;
const OUTPUT = new URL(
  "../src/data/health-institutions.json",
  import.meta.url
).pathname;

// ---------------------------------------------------------------------------
// 1. Read raw REPS JSON
// ---------------------------------------------------------------------------
console.log(`Reading ${INPUT} ...`);
const raw = JSON.parse(readFileSync(INPUT, "utf-8"));
console.log(`Loaded ${raw.length} records.`);

// ---------------------------------------------------------------------------
// 2. Classify each facility
// ---------------------------------------------------------------------------

/**
 * Determine the facility type based on the sede name and class.
 * Returns one of: "hospital", "centro_salud", "puesto_salud", "clinica",
 * "laboratorio", "ips", "profesional_independiente", "transporte", "otro"
 */
function classifyFacility(record) {
  const name = (record.nombresede || "").toUpperCase();
  const clase = (record.claseprestador || "").toUpperCase();

  if (clase.includes("PROFESIONAL INDEPENDIENTE"))
    return "profesional_independiente";
  if (clase.includes("TRANSPORTE ESPECIAL")) return "transporte";

  if (name.includes("HOSPITAL")) return "hospital";
  if (name.includes("CLÍNICA") || name.includes("CLINICA")) return "clinica";
  if (name.includes("CENTRO DE SALUD")) return "centro_salud";
  if (name.includes("PUESTO DE SALUD")) return "puesto_salud";
  if (name.includes("LABORATORIO")) return "laboratorio";

  if (clase.includes("IPS")) return "ips";
  return "otro";
}

// ---------------------------------------------------------------------------
// 3. Normalize municipality name
// ---------------------------------------------------------------------------
function normalizeMunicipality(name) {
  if (!name) return "DESCONOCIDO";
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

// ---------------------------------------------------------------------------
// 4. Build per-municipality aggregation
// ---------------------------------------------------------------------------
/** @type {Map<string, {institutions: object[], counts: object}>} */
const byMunicipality = new Map();

for (const record of raw) {
  const municipality = normalizeMunicipality(record.municipioprestadordesc);
  const facilityType = classifyFacility(record);

  if (!byMunicipality.has(municipality)) {
    byMunicipality.set(municipality, {
      institutions: [],
      counts: {
        total: 0,
        hospital: 0,
        clinica: 0,
        centro_salud: 0,
        puesto_salud: 0,
        ips: 0,
        laboratorio: 0,
        profesional_independiente: 0,
        transporte: 0,
        otro: 0,
      },
    });
  }

  const entry = byMunicipality.get(municipality);
  entry.counts.total += 1;
  entry.counts[facilityType] = (entry.counts[facilityType] || 0) + 1;

  entry.institutions.push({
    code: record.codigoprestador,
    name: record.nombresede || record.nombreprestador,
    provider: record.nombreprestador,
    municipality,
    type: facilityType,
    nature: record.naturalezajuridica || null,
    is_ese: record.ese === "SI",
    address: record.direcci_nsede || record.direccionprestador || null,
    phone: record.t_lefonosede || record.telefonoprestador || null,
    email: record.email_sede || record.email_prestador || null,
    class: record.claseprestador || null,
  });
}

// ---------------------------------------------------------------------------
// 5. Build the output object
// ---------------------------------------------------------------------------

// Department-level summary
const departmentCounts = {
  total: raw.length,
  hospital: 0,
  clinica: 0,
  centro_salud: 0,
  puesto_salud: 0,
  ips: 0,
  laboratorio: 0,
  profesional_independiente: 0,
  transporte: 0,
  otro: 0,
};

const municipalities = [];

for (const [name, data] of [...byMunicipality.entries()].sort((a, b) =>
  a[0].localeCompare(b[0])
)) {
  // Accumulate department totals
  for (const key of Object.keys(departmentCounts)) {
    if (key !== "total") {
      departmentCounts[key] += data.counts[key] || 0;
    }
  }

  municipalities.push({
    municipality: name,
    counts: data.counts,
    institutions: data.institutions,
  });
}

const output = {
  department: "Córdoba",
  data_source: "REPS - Ministerio de Salud (datos.gov.co)",
  dataset_id: "c36g-9fc2",
  generated_at: new Date().toISOString(),
  summary: departmentCounts,
  municipalities,
};

// ---------------------------------------------------------------------------
// 6. Write to disk
// ---------------------------------------------------------------------------
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(output, null, 2));

const sizeMB = (
  Buffer.byteLength(JSON.stringify(output)) / 1_048_576
).toFixed(2);
console.log(
  `\nDepartment summary: ${departmentCounts.total} total facilities`
);
console.log(
  `  Hospitals: ${departmentCounts.hospital} | Clinics: ${departmentCounts.clinica} | Health Centers: ${departmentCounts.centro_salud}`
);
console.log(
  `  Health Posts: ${departmentCounts.puesto_salud} | IPS: ${departmentCounts.ips} | Labs: ${departmentCounts.laboratorio}`
);
console.log(
  `  Independent Professionals: ${departmentCounts.profesional_independiente} | Transport: ${departmentCounts.transporte}`
);
console.log(`\nMunicipalities covered: ${municipalities.length}`);
console.log(`Wrote to ${OUTPUT} (${sizeMB} MB)`);
