"use client";

import countries from "i18n-iso-countries";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import world from "world-atlas/countries-110m.json";

import type { GeoJsonObject } from "geojson";

import type { DashboardBreakdown } from "@/lib/dashboard/types";

function numericCode(value: string) {
  const upper = value.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) return countries.alpha2ToNumeric(upper);
  if (/^[A-Z]{3}$/.test(upper)) return countries.alpha3ToNumeric(upper);
  if (/^\d{3}$/.test(upper)) return upper;
  return undefined;
}

export default function WorldMapCanvas({ rows, selectedCountry, onSelectCountry }: {
  rows: DashboardBreakdown[];
  selectedCountry: string;
  onSelectCountry: (value: string) => void;
}) {
  const values = new Map(rows.map((row) => [numericCode(row.value), row]));
  const maximum = Math.max(1, ...rows.map(({ visitors }) => visitors));

  return (
    <ComposableMap projectionConfig={{ scale: 142 }} width={720} height={390} className="h-full w-full" aria-label="世界访问分布地图">
      <ZoomableGroup center={[8, 8]} zoom={1} maxZoom={3}>
        <Geographies geography={world as unknown as GeoJsonObject}>
          {({ geographies }) => geographies.map((geography) => {
            const row = values.get(String(geography.id).padStart(3, "0"));
            const selected = row?.value === selectedCountry;
            const intensity = row ? Math.max(0.18, row.visitors / maximum) : 0;
            return (
              <Geography
                key={geography.rsmKey}
                geography={geography}
                onClick={() => { if (row) onSelectCountry(row.value); }}
                fill={selected ? "#8DDB00" : row ? `rgba(118,185,0,${0.25 + intensity * 0.65})` : "#293038"}
                stroke="#0B0D10"
                strokeWidth={0.55}
                tabIndex={-1}
                className={row ? "cursor-pointer outline-none transition-[fill] duration-150 hover:fill-[#8DDB00]" : "cursor-default outline-none transition-[fill] duration-150 hover:fill-[#343C45]"}
              />
            );
          })}
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
}
