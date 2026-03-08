import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const raw = JSON.parse(
  readFileSync(
    new URL("./raw_ideam_stations.json", import.meta.url),
    "utf-8"
  )
);

const stations = raw
  .filter((s) => s.latitud && s.longitud)
  .map((s) => ({
    name: s.nombre,
    code: s.codigo,
    type: s.categoria,
    lat: parseFloat(s.latitud),
    lon: parseFloat(s.longitud),
    municipality: s.municipio,
    active: s.estado === "Activa",
    elevation: s.altitud ? parseFloat(s.altitud) : null,
  }));

const outPath = new URL("../src/data/ideam-stations.json", import.meta.url);
mkdirSync(dirname(outPath.pathname), { recursive: true });
writeFileSync(outPath, JSON.stringify(stations, null, 2));

console.log(`Wrote ${stations.length} stations to src/data/ideam-stations.json`);
