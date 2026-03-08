import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const raw = JSON.parse(
  readFileSync(
    new URL("./raw_education.json", import.meta.url),
    "utf-8"
  )
);

// Keep the most recent record per institution (by DANE code)
// Sort descending by year so the first occurrence is the latest
const sorted = [...raw].sort(
  (a, b) => (b.a_o || "").localeCompare(a.a_o || "")
);

const seen = new Set();
const latest = [];
for (const r of sorted) {
  const code = r.codigo_dane;
  if (!code || seen.has(code)) continue;
  seen.add(code);
  latest.push(r);
}

console.log(`Total raw records: ${raw.length}`);
console.log(`Unique institutions (latest per DANE code): ${latest.length}`);

// Determine institution type from DANE code prefix and caracter field
function getType(record) {
  const code = record.codigo_dane || "";
  const caracter = (record.caracter || "").toLowerCase();
  // DANE codes starting with 1 = establecimiento educativo
  // starting with 2 = sede educativa (branch)
  // starting with 3 = nuevo establecimiento

  if (caracter.includes("técnico") && caracter.includes("académ")) {
    return "tecnico_academico";
  }
  if (caracter.includes("técnico")) return "tecnico";
  if (caracter === "académico") return "academico";
  if (caracter === "no aplica" || caracter === "-" || !caracter) {
    return "no_aplica";
  }
  return "otro";
}

// Determine zone from barrio_vereda field heuristics (no explicit zone column)
function inferZone(record) {
  const barrio = (record.barrio_vereda || "").toUpperCase();
  const dir = (record.direccion || "").toUpperCase();
  // Rural indicators
  if (
    barrio.includes("VEREDA") ||
    barrio.includes("CORREGIMIENTO") ||
    barrio.includes("CORREG") ||
    barrio.includes("VDA") ||
    barrio.includes("FINCA") ||
    barrio.includes("CASERÍO") ||
    barrio.includes("CASERIO")
  ) {
    return "rural";
  }
  // Urban indicators
  if (
    barrio.includes("BARRIO") ||
    barrio.includes("URB") ||
    barrio.includes("CONJUNTO") ||
    barrio.includes("CENTRO") ||
    (dir && (dir.includes("CL ") || dir.includes("KR ") || dir.includes("CRA ")))
  ) {
    return "urbana";
  }
  return "sin_dato";
}

// Map records
const institutions = latest.map((r) => ({
  name: r.nombre_establecimiento || "",
  code: r.codigo_dane || "",
  municipality: r.municipio || "",
  municipalityCode: r.cod_dane_municipio || "",
  sector: r.sector === "OFICIAL" ? "oficial" : "no_oficial",
  type: getType(r),
  zone: inferZone(r),
  enrollment: r.total_matricula ? parseInt(r.total_matricula, 10) : null,
  branches: r.cantidad_sedes ? parseInt(r.cantidad_sedes, 10) : null,
  address: r.direccion || null,
  neighborhood: r.barrio_vereda || null,
  phone: r.telefono || null,
  email: r.email || null,
  principal: r.rector || null,
  year: r.a_o || null,
  lat: null,
  lon: null,
}));

// Summary by municipality
const byMunicipality = {};
for (const inst of institutions) {
  const m = inst.municipality;
  if (!byMunicipality[m]) {
    byMunicipality[m] = {
      municipality: m,
      municipalityCode: inst.municipalityCode,
      total: 0,
      oficial: 0,
      no_oficial: 0,
      totalEnrollment: 0,
      zones: { rural: 0, urbana: 0, sin_dato: 0 },
    };
  }
  const entry = byMunicipality[m];
  entry.total++;
  entry[inst.sector]++;
  entry.totalEnrollment += inst.enrollment || 0;
  entry.zones[inst.zone]++;
}

const summary = Object.values(byMunicipality).sort(
  (a, b) => b.total - a.total
);

const output = {
  metadata: {
    source: "datos.gov.co - Directorio Único de Establecimientos Educativos (DUE)",
    datasetId: "cfw5-qzt5",
    department: "Córdoba",
    totalInstitutions: institutions.length,
    lastUpdated: new Date().toISOString().split("T")[0],
    note: "Coordinates not available in source dataset. Zone inferred from address fields.",
  },
  summary,
  institutions,
};

const outPath = new URL(
  "../src/data/education-institutions.json",
  import.meta.url
);
mkdirSync(dirname(outPath.pathname), { recursive: true });
writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(
  `\nWrote ${institutions.length} institutions to src/data/education-institutions.json`
);
console.log(`\nSummary by municipality:`);
for (const s of summary) {
  console.log(
    `  ${s.municipality}: ${s.total} institutions (${s.oficial} oficial, ${s.no_oficial} no oficial) - enrollment: ${s.totalEnrollment}`
  );
}
console.log(
  `\nZone breakdown: rural=${institutions.filter((i) => i.zone === "rural").length}, urbana=${institutions.filter((i) => i.zone === "urbana").length}, sin_dato=${institutions.filter((i) => i.zone === "sin_dato").length}`
);
