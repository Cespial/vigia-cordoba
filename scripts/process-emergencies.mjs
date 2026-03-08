import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const raw = JSON.parse(
  readFileSync(
    new URL("./raw_ungrd_emergencies.json", import.meta.url),
    "utf-8"
  )
);

const floodKeywords = [
  "inundaci",
  "avalancha",
  "creciente",
  "desbordamiento",
];

function isFloodEvent(evento) {
  const lower = (evento || "").toLowerCase();
  return floodKeywords.some((kw) => lower.includes(kw));
}

function parseCurrency(val) {
  if (!val || typeof val !== "string") return 0;
  // Format is like "$    - 0" or "$  1,234,567"
  const cleaned = val.replace(/[$,\s-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

const emergencies = raw
  .filter((e) => isFloodEvent(e.evento))
  .map((e) => ({
    date: e.fecha || null,
    municipality: e.municipio || null,
    event_type: e.evento || null,
    deaths: parseInt(e.fallecidos) || 0,
    injuries: parseInt(e.heridos) || 0,
    affected: parseInt(e.personas) || 0,
    destroyed_homes: parseInt(e.viviendas_destruidas) || 0,
    damaged_homes: parseInt(e.viviendas_averiadas) || 0,
    resources: parseCurrency(e.recursos_ejecutados),
  }));

const outPath = new URL("../src/data/ungrd-emergencies.json", import.meta.url);
mkdirSync(dirname(outPath.pathname), { recursive: true });
writeFileSync(outPath, JSON.stringify(emergencies, null, 2));

console.log(
  `Wrote ${emergencies.length} flood-related emergencies to src/data/ungrd-emergencies.json`
);
