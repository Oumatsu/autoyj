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
  const vehicleClass = textValues(fields["Vehicle Class"]);

  return {
    vehicleClasses: vehicleClass.length ? vehicleClass : textValues(fields.Segment),
    batteryChemistries: atomicValues(fields["Battery Chemistry Auto"]),
    rangeKm: interval(fields["CLTC Range Min KM Auto"], fields["CLTC Range Max KM Auto"]),
    priceUsd: interval(fields["Guide Price Min USD Auto"], fields["Guide Price Max USD Auto"]),
    steeringSetups: textValues(fields["Steering Setup"]),
    powertrainTypes: textValues(fields["Powertrain Type"]),
    inventoryStatuses: textValues(fields["Inventory Status"]),
    voltagePlatforms: voltageValues(fields["Voltage Platform (V)"]),
    v2lAvailability: textValues(fields["V2L Availability"]),
    drivetrains: atomicValues(fields["Drivetrain Display Auto"]),
    groundClearanceMm: interval(fields["Ground Clearance (mm)"], fields["Ground Clearance (mm)"]),
  };
}
