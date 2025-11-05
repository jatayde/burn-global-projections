// make-estimates-json.mjs
import xlsx from "xlsx";
import fs from "fs";

const INPUT = "public/Summary Sheet_Burn.xlsx";
const OUTPUT = "src/data/estimatedStats.json";

const wb = xlsx.readFile(INPUT);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

const years = ["2030", "2040", "2050"];
const stats = {};

function parseFirstNumber(value) {
  if (!value) return null;
  const match = String(value)
    .replace(/,/g, "")
    .match(/[\d.]+/);
  return match ? Number(match[0]) : null;
}

for (const row of rows) {
  const country = String(row["Country"] ?? "").trim();
  if (!country) continue;

  stats[country] = {};
  for (const year of years) {
    const incidenceCol = `Burn Estimated ${year} (95% CI)`;
    const dalyCol = `DALY Burn Estimated ${year} (95% CI)`;
    const costCol = `$ Total Estimate (95% CI)`;

    const incidence = row[incidenceCol];
    const daly = row[dalyCol];
    const cost = row[costCol];

    const incidenceNum = parseFirstNumber(incidence);
    const dalyNum = parseFirstNumber(daly);

    stats[country][year] = {
      incidence: incidence,
      daly: daly,
      incidence_number: incidenceNum, // numeric-only value
      daly_number: dalyNum,
      cost: cost,
    };
  }
}

fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(stats, null, 2));
console.log(`✅ Wrote ${OUTPUT}`);
