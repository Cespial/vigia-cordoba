/**
 * process-rivers.mjs
 *
 * Reads the raw Overpass JSON output for Córdoba waterways and converts it
 * into a GeoJSON FeatureCollection of LineString features suitable for
 * rendering on a Leaflet map.
 *
 * Usage:  node scripts/process-rivers.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const INPUT = new URL("./raw_rivers.json", import.meta.url).pathname;
const OUTPUT = new URL("../src/data/cordoba-rivers.json", import.meta.url).pathname;

// ---------------------------------------------------------------------------
// 1. Read raw Overpass JSON
// ---------------------------------------------------------------------------
console.log(`Reading ${INPUT} ...`);
const raw = JSON.parse(readFileSync(INPUT, "utf-8"));

// ---------------------------------------------------------------------------
// 2. Index nodes by id for fast coordinate lookup
// ---------------------------------------------------------------------------
/** @type {Map<number, [number, number]>} */
const nodeIndex = new Map();

for (const el of raw.elements) {
  if (el.type === "node") {
    // GeoJSON uses [lon, lat]
    nodeIndex.set(el.id, [el.lon, el.lat]);
  }
}

console.log(`Indexed ${nodeIndex.size} nodes.`);

// ---------------------------------------------------------------------------
// 3. Index ways by id (needed to resolve relation members)
// ---------------------------------------------------------------------------
/** @type {Map<number, {nodes: number[], tags?: Record<string, string>}>} */
const wayIndex = new Map();

for (const el of raw.elements) {
  if (el.type === "way") {
    wayIndex.set(el.id, el);
  }
}

console.log(`Indexed ${wayIndex.size} ways.`);

// ---------------------------------------------------------------------------
// 4. Helper – build a LineString feature from a way element
// ---------------------------------------------------------------------------
function wayToFeature(way, nameOverride) {
  const coords = [];
  for (const nid of way.nodes) {
    const coord = nodeIndex.get(nid);
    if (coord) coords.push(coord);
  }

  // Skip ways with fewer than 2 points (can't form a line)
  if (coords.length < 2) return null;

  const name =
    nameOverride ??
    way.tags?.name ??
    way.tags?.["name:es"] ??
    null;

  const waterway_type = way.tags?.waterway ?? "river";

  return {
    type: "Feature",
    properties: {
      name,
      waterway_type,
    },
    geometry: {
      type: "LineString",
      coordinates: coords,
    },
  };
}

// ---------------------------------------------------------------------------
// 5. Convert ways to features
// ---------------------------------------------------------------------------
const features = [];
const processedWayIds = new Set();

for (const el of raw.elements) {
  if (el.type === "way" && el.tags?.waterway) {
    const feature = wayToFeature(el);
    if (feature) {
      features.push(feature);
      processedWayIds.add(el.id);
    }
  }
}

console.log(`Converted ${features.length} tagged ways to features.`);

// ---------------------------------------------------------------------------
// 6. Process relations – each member way inherits the relation name if it
//    doesn't already have its own name.
// ---------------------------------------------------------------------------
let relationWays = 0;

for (const el of raw.elements) {
  if (el.type !== "relation") continue;

  const relationName =
    el.tags?.name ?? el.tags?.["name:es"] ?? null;

  for (const member of el.members) {
    if (member.type !== "way") continue;
    if (processedWayIds.has(member.ref)) continue; // already processed

    const way = wayIndex.get(member.ref);
    if (!way) continue;

    const feature = wayToFeature(way, relationName);
    if (feature) {
      features.push(feature);
      processedWayIds.add(member.ref);
      relationWays++;
    }
  }
}

console.log(`Added ${relationWays} additional ways from relations.`);

// ---------------------------------------------------------------------------
// 7. Build the FeatureCollection and write to disk
// ---------------------------------------------------------------------------
const geojson = {
  type: "FeatureCollection",
  features,
};

// Ensure the output directory exists
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(geojson));

const sizeMB = (Buffer.byteLength(JSON.stringify(geojson)) / 1_048_576).toFixed(2);
console.log(
  `\nWrote ${features.length} features to ${OUTPUT} (${sizeMB} MB)`
);
