import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const raw = readFileSync(
  new URL("./raw_oni.txt", import.meta.url),
  "utf-8"
);

const lines = raw.split("\n").filter((l) => l.trim());

// Skip header line
const data = lines.slice(1).map((line) => {
  const parts = line.trim().split(/\s+/);
  return {
    season: parts[0],
    year: parseInt(parts[1]),
    total: parseFloat(parts[2]),
    anomaly: parseFloat(parts[3]),
  };
});

// Filter last 10 years (2016-2026)
const currentYear = new Date().getFullYear();
const cutoff = currentYear - 10;
const recent = data.filter((d) => d.year >= cutoff);

const outPath = new URL("../src/data/enso-oni.json", import.meta.url);
mkdirSync(dirname(outPath.pathname), { recursive: true });
writeFileSync(outPath, JSON.stringify(recent, null, 2));

console.log(
  `Wrote ${recent.length} ONI records (${cutoff}-${currentYear}) to src/data/enso-oni.json`
);
