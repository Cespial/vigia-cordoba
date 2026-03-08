/**
 * process-boundaries.mjs
 *
 * Reads the raw geoBoundaries COL ADM2 GeoJSON, filters it to only include
 * the 30 municipalities of the Córdoba department, simplifies coordinate
 * precision to 4 decimal places, and writes the result to src/data/.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const INPUT = new URL("./raw_boundaries.geojson", import.meta.url).pathname;
const OUTPUT = new URL(
  "../src/data/cordoba-boundaries.json",
  import.meta.url
).pathname;

// ---------------------------------------------------------------------------
// 1. Córdoba municipality definitions
// ---------------------------------------------------------------------------

/** Normalize a string for accent-insensitive comparison. */
function normalize(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * The 30 municipalities of Córdoba.  For names that appear in more than one
 * Colombian department we record the shapeID that belongs to Córdoba so we
 * can disambiguate.
 */
const CORDOBA_MUNICIPALITIES = [
  "Montería",
  "Cereté",
  "Lorica",
  "Sahagún",
  "Montelíbano",
  "Planeta Rica",
  "Tierralta",
  "Valencia",
  "San Pelayo",
  "Ciénaga de Oro",
  "San Carlos",
  "Ayapel",
  "La Apartada",
  "Puerto Libertador",
  "Buenavista",
  "Canalete",
  "Cotorra",
  "Los Córdobas",
  "Moñitos",
  "Momil",
  "Chimá",
  "Purísima",
  "San Andrés de Sotavento",
  "San Antero",
  "San Bernardo del Viento",
  "San José de Uré",
  "Pueblo Nuevo",
  "Tuchín",
  "Puerto Escondido",
  "Chinú",
];

const normalizedNames = new Set(CORDOBA_MUNICIPALITIES.map(normalize));

/**
 * shapeIDs that are *known* to be the Córdoba version of a duplicated name.
 * Any other feature with the same normalised name will be excluded.
 */
const CORDOBA_SHAPE_IDS = new Set([
  "7082276B96393406171347", // Buenavista (Córdoba)
  "7082276B45851614752586", // San Carlos  (Córdoba)
  "7082276B67782051899776", // Chimá       (Córdoba)
]);

/**
 * Duplicated names that exist in other departments.  If a feature has one of
 * these names but its shapeID is NOT in CORDOBA_SHAPE_IDS, we reject it.
 */
const DUPLICATED_NAMES = new Set(
  ["Buenavista", "San Carlos", "Chimá"].map(normalize)
);

// ---------------------------------------------------------------------------
// 2. Coordinate simplification
// ---------------------------------------------------------------------------

/** Round a single coordinate pair to `decimals` places. */
function roundCoord(coord, decimals = 4) {
  const factor = 10 ** decimals;
  return coord.map((v) => Math.round(v * factor) / factor);
}

/** Recursively round all coordinate arrays in a GeoJSON geometry. */
function simplifyCoords(coords) {
  if (typeof coords[0] === "number") {
    return roundCoord(coords);
  }
  return coords.map(simplifyCoords);
}

// ---------------------------------------------------------------------------
// 3. Main pipeline
// ---------------------------------------------------------------------------

console.log("Reading", INPUT);
const raw = JSON.parse(readFileSync(INPUT, "utf8"));
console.log(`Total features in source: ${raw.features.length}`);

const filtered = raw.features.filter((f) => {
  const name = normalize(f.properties.shapeName);
  if (!normalizedNames.has(name)) return false;

  // For duplicated names, only accept the known Córdoba shapeID
  if (DUPLICATED_NAMES.has(name)) {
    return CORDOBA_SHAPE_IDS.has(f.properties.shapeID);
  }

  return true;
});

console.log(`Features after Córdoba filter: ${filtered.length}`);

// Simplify coordinates
const simplified = filtered.map((f) => ({
  type: "Feature",
  properties: f.properties,
  geometry: {
    type: f.geometry.type,
    coordinates: simplifyCoords(f.geometry.coordinates),
  },
}));

const output = {
  type: "FeatureCollection",
  features: simplified,
};

// Write output
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(output));

const sizeKB = (Buffer.byteLength(JSON.stringify(output)) / 1024).toFixed(1);
console.log(`Wrote ${OUTPUT} (${sizeKB} KB, ${simplified.length} features)`);

// Verify all 30 municipalities are present
const outputNames = new Set(simplified.map((f) => normalize(f.properties.shapeName)));
const missing = CORDOBA_MUNICIPALITIES.filter((m) => !outputNames.has(normalize(m)));
if (missing.length > 0) {
  console.error("WARNING — missing municipalities:", missing);
} else {
  console.log("All 30 Córdoba municipalities present.");
}
