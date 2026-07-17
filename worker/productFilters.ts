export type NumericInterval = { min: number; max: number };

export type ProductFilterData = {
  vehicleClasses: string[];
  batteryChemistries: string[];
  rangeKm: NumericInterval | null;
  priceUsd: NumericInterval | null;
  steeringSetups: string[];
  powertrainTypes: string[];
  inventoryStatuses: string[];
  voltagePlatforms: string[];
  v2lAvailability: string[];
  drivetrains: string[];
  groundClearanceMm: NumericInterval | null;
};

function textValues(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];

  return [...new Set(values.flatMap((item) => {
    if (item === null || item === undefined) return [];
    if (typeof item === "object") {
      const record = item as Record<string, unknown>;
      return textValues(record.text ?? record.name ?? record.value);
    }
    const text = String(item).trim();
    return text ? [text] : [];
  }))];
}

function atomicValues(value: unknown): string[] {
  return [...new Set(textValues(value).flatMap((item) =>
    item.split(/\s*(?:\/|\+)\s*/).map((part) => part.trim()).filter(Boolean),
  ))];
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function interval(minValue: unknown, maxValue: unknown): NumericInterval | null {
  const min = finiteNumber(minValue);
  const max = finiteNumber(maxValue);
  if (min === null && max === null) return null;
  const first = min ?? max!;
  const second = max ?? min!;
  return { min: Math.min(first, second), max: Math.max(first, second) };
}

function voltageValues(value: unknown): string[] {
  return textValues(value).map((item) => {
    const numeric = finiteNumber(item.replace(/v$/i, ""));
    return numeric === null ? item : `${numeric}V`;
  });
}

export function buildProductFilterData(fields: Record<string, unknown>): ProductFilterData {
  const vehicleClass = textValues(fields.vehicle_class);

  return {
    vehicleClasses: vehicleClass.length ? vehicleClass : textValues(fields.segment),
    batteryChemistries: atomicValues(fields.battery_chemistry_auto),
    rangeKm: interval(fields.cltc_range_min_km_auto, fields.cltc_range_max_km_auto),
    priceUsd: interval(fields.guide_price_min_usd_auto, fields.guide_price_max_usd_auto),
    steeringSetups: textValues(fields.steering_setup),
    powertrainTypes: textValues(fields.powertrain_type),
    inventoryStatuses: textValues(fields.inventory_status),
    voltagePlatforms: voltageValues(fields.voltage_platform_v),
    v2lAvailability: textValues(fields.v2l_availability),
    drivetrains: atomicValues(fields.drivetrain_display_auto),
    groundClearanceMm: interval(fields.ground_clearance_mm, fields.ground_clearance_mm),
  };
}
