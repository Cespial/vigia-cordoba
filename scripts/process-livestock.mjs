/**
 * process-livestock.mjs
 *
 * Reads raw_livestock.json and produces a structured summary of livestock data
 * for the Córdoba department, grouped by municipality.
 *
 * Output: src/data/livestock-data.json
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT = resolve(__dirname, "raw_livestock.json");
const OUTPUT = resolve(__dirname, "..", "src", "data", "livestock-data.json");

// ---------------------------------------------------------------------------
// 1. Load raw records
// ---------------------------------------------------------------------------
const raw = JSON.parse(readFileSync(INPUT, "utf-8"));
console.log(`Loaded ${raw.length} livestock records for Córdoba.`);

// ---------------------------------------------------------------------------
// 2. Map each record to the output structure
// ---------------------------------------------------------------------------
const municipalities = raw.map((r) => {
  const cattleHeads = r.bovinos_total || 0;
  const pastureHa = r.area_pastos_ha || 0;
  const cattleDensity =
    pastureHa > 0
      ? Math.round((cattleHeads / pastureHa) * 100) / 100
      : 0;

  return {
    municipality: r.municipio,
    cattle_heads: cattleHeads,
    area_pasture_ha: pastureHa,
    cattle_density_per_ha: cattleDensity,
    buffalo: r.bufalos || 0,
    pigs: r.porcinos || 0,
    sheep: r.ovinos || 0,
    goats: r.caprinos || 0,
    horses: r.equinos || 0,
  };
});

// Sort by cattle heads descending
municipalities.sort((a, b) => b.cattle_heads - a.cattle_heads);

// ---------------------------------------------------------------------------
// 3. Department-level totals
// ---------------------------------------------------------------------------
const totalCattle = municipalities.reduce((s, m) => s + m.cattle_heads, 0);
const totalPasture = municipalities.reduce((s, m) => s + m.area_pasture_ha, 0);
const totalBuffalo = municipalities.reduce((s, m) => s + m.buffalo, 0);
const totalPigs = municipalities.reduce((s, m) => s + m.pigs, 0);
const totalSheep = municipalities.reduce((s, m) => s + m.sheep, 0);
const totalGoats = municipalities.reduce((s, m) => s + m.goats, 0);
const totalHorses = municipalities.reduce((s, m) => s + m.horses, 0);

const avgDensity =
  totalPasture > 0
    ? Math.round((totalCattle / totalPasture) * 100) / 100
    : 0;

// ---------------------------------------------------------------------------
// 4. Build the final output
// ---------------------------------------------------------------------------
const output = {
  meta: {
    source: "ICA - Instituto Colombiano Agropecuario (census-based estimates for Córdoba)",
    department: "CORDOBA",
    note: "Livestock API datasets on datos.gov.co were unavailable. Data is based on published ICA census figures and departmental agricultural reports, proportionally distributed across municipalities.",
    generated_at: new Date().toISOString(),
  },
  department_summary: {
    total_cattle_heads: totalCattle,
    total_pasture_ha: totalPasture,
    avg_cattle_density_per_ha: avgDensity,
    total_buffalo: totalBuffalo,
    total_pigs: totalPigs,
    total_sheep: totalSheep,
    total_goats: totalGoats,
    total_horses: totalHorses,
    num_municipalities: municipalities.length,
    top_cattle_municipalities: municipalities.slice(0, 5).map((m) => ({
      municipality: m.municipality,
      cattle_heads: m.cattle_heads,
    })),
  },
  municipalities,
};

// ---------------------------------------------------------------------------
// 5. Write output
// ---------------------------------------------------------------------------
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(output, null, 2), "utf-8");

console.log(`\nWrote livestock data to ${OUTPUT}`);
console.log(`  Municipalities: ${municipalities.length}`);
console.log(`  Total cattle: ${totalCattle.toLocaleString()} heads`);
console.log(`  Total pasture: ${totalPasture.toLocaleString()} ha`);
console.log(`  Avg density: ${avgDensity} cattle/ha`);
console.log(`  Top 5 municipalities by cattle:`);
for (const m of municipalities.slice(0, 5)) {
  console.log(`    - ${m.municipality}: ${m.cattle_heads.toLocaleString()} heads`);
}
