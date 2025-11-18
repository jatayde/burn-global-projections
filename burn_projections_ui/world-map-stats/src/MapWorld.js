import React, { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Keep your existing alias behavior so country-name mismatches still resolve
const ALIASES = {
  "United States": "United States of America",
  "Congo, Dem Rep": "Dem. Rep. Congo",
  "Congo, Rep": "Congo",
  "Cote d'Ivoire": "Côte d'Ivoire",
  Eswatini: "Swaziland",
  Myanmar: "Burma",
  Czechia: "Czech Republic",
  "North Macedonia": "Macedonia",
  "Syrian Arab Republic": "Syria",
  "Viet Nam": "Vietnam",
  "Lao People's Democratic Republic": "Laos",
  "Kyrgyz Republic": "Kyrgyzstan",
  Turkiye: "Turkey",
  "South Sudan": "S. Sudan",
  "Central African Republic": "Central African Rep.",
  "Equatorial Guinea": "Eq. Guinea",
  Somalia: "Somaliland",
  "Bosnia and Herzegovina": "Bosnia and Herz.",
  "Republic of Korea": "South Korea",
  "Brunei Darussalam": "Brunei",
  "Dominican Republic": "Dominican Rep.",
  "Russian Federation": "Russia",
  "Iran (Islamic Republic of)": "Iran",
  "Bolivia (Plurinational State of)": "Bolivia",
  "United Republic of Tanzania": "Tanzania",
};

/**
 * Props:
 * - year: "2030" | "2040" | "2050"
 * - data: {
 *     [country: string]: {
 *       [year: string]: {
 *         incidence: number | null,
 *         daly: number | null,
 *         cost: number | null,
 *       }
 *     }
 *   }
 * - title?: string
 *
 * Example data:
 * {
 *   "Afghanistan": {
 *     "2030": { "incidence": 12345, "daly": 67890, "cost": 4000 },
 *     "2040": { "incidence": 13000, "daly": 71000, "cost": 4000 },
 *     "2050": { "incidence": 14200, "daly": 76000, "cost": 4000 }
 *   }
 * }
 */
export default function MapWorld({ year, data, title = "" }) {
  const [tip, setTip] = useState(null);

  const perYear = useMemo(() => {
    const flat = {};
    for (const [country, years] of Object.entries(data || {})) {
      if (years && years[year]) flat[country] = years[year];
    }
    for (const [from, to] of Object.entries(ALIASES)) {
      if (flat[from] && !flat[to]) flat[to] = flat[from];
    }
    return flat;
  }, [data, year]);

  const [minVal, maxVal] = useMemo(() => {
    const vals = Object.values(perYear)
      .map((d) => {
        const raw = d?.incidence;
        if (!raw) return NaN;

        // Extract the first number before parentheses or spaces
        const match = String(raw)
          .replace(/,/g, "")
          .match(/[\d.]+/);
        if (!match) return NaN;

        const num = parseFloat(match[0]);
        return Number.isFinite(num) ? num : NaN;
      })
      .filter((n) => !Number.isNaN(n));

    if (!vals.length) return [0, 0];
    return [Math.min(...vals), Math.max(...vals)];
  }, [perYear]);

  function getColor(val) {
    if (!Number.isFinite(val)) return "#e5e5e5"; // gray for missing
    if (maxVal === minVal) return "#9AC5B7"; // midpoint fallback

    // Log-scale normalization to handle wide range
    const safeVal = Math.max(val, 1);
    const safeMin = Math.max(minVal, 1);
    const safeMax = Math.max(maxVal, 1);
    const ratio = Math.log10(safeVal / safeMin) / Math.log10(safeMax / safeMin);

    // Custom light→dark blue-green gradient
    if (ratio < 0.1) return "#EEF5F0";
    if (ratio < 0.2) return "#DBEDE4";
    if (ratio < 0.3) return "#C7E1D5";
    if (ratio < 0.4) return "#B1D3C6";
    if (ratio < 0.5) return "#9AC5B7";
    if (ratio < 0.6) return "#82B4A8";
    if (ratio < 0.7) return "#6AA19A";
    if (ratio < 0.8) return "#538A90";
    if (ratio < 0.9) return "#3E708A";
    return "#2B4F82";
  }

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
      }}
    >
      <ComposableMap
        projectionConfig={{ scale: 155, center: [10, 0] }}
        viewBox="0 75 800 600"
        style={{ width: "100%", height: "auto" }}
        preserveAspectRatio="xMidYMin meet"
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const p = geo.properties;
              const name =
                p.name ||
                p.NAME ||
                p.ADMIN ||
                p.NAME_LONG ||
                p.SOVEREIGNT ||
                p.BRK_NAME ||
                p.FORMAL_EN;

              const row = perYear[name];
              const val = row?.incidence_number;
              const color = getColor(val);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={(e) =>
                    setTip({
                      x: e.clientX,
                      y: e.clientY,
                      name,
                      incidence: row?.incidence,
                      daly: row?.daly,
                      cost: row?.cost,
                    })
                  }
                  onMouseMove={(e) =>
                    setTip((t) => t && { ...t, x: e.clientX, y: e.clientY })
                  }
                  onMouseLeave={() => setTip(null)}
                  style={{
                    default: { fill: color, stroke: "#666", strokeWidth: 0.5 },
                    hover: { fill: color, stroke: "#dcff00", strokWidth: 1 },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tip && (
        <div
          style={{
            position: "fixed",
            left: tip.x + 10,
            top: tip.y + 10,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: "6px 10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            fontSize: 13,
            pointerEvents: "none",
            minWidth: 220,
            zIndex: 9999,
          }}
        >
          <strong>{tip.name}</strong>
          <div style={{ marginTop: 4 }}>
            <div>
              <em>Burn Estimate:</em> {tip.incidence || "NaN"}
            </div>
            <div>
              <em>DALY Estimate:</em> {tip.daly || "NaN"}
            </div>
            <div>
              <em>Estimated Cost:</em> {tip.cost ? `$${tip.cost}` : "NaN"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
