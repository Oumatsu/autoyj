import { catalogFilterKey, catalogFilterFallback } from "./catalogTranslations.ts";

export type NumericInterval = { min: number; max: number };

export type CatalogFilterData = {
  vehicleClasses?: string[];
  batteryChemistries?: string[];
  rangeKm?: NumericInterval | null;
  priceUsd?: NumericInterval | null;
  steeringSetups?: string[];
  powertrainTypes?: string[];
  inventoryStatuses?: string[];
  voltagePlatforms?: string[];
  v2lAvailability?: string[];
  drivetrains?: string[];
  groundClearanceMm?: NumericInterval | null;
};

export type CatalogProduct = {
  filterData?: CatalogFilterData;
};

export type CatalogFilterOption = {
  id: string;
  label: string;
  matches: (product: CatalogProduct) => boolean;
};

export type CatalogFilterGroup = {
  id: string;
  label: string;
  options: CatalogFilterOption[];
};

type Translate = (key: string, fallback?: string) => string;
type ListField = Exclude<keyof CatalogFilterData, "rangeKm" | "priceUsd" | "groundClearanceMm">;
type IntervalField = "rangeKm" | "priceUsd" | "groundClearanceMm";

type IntervalDefinition = {
  id: string;
  labelKey: string;
  fallback: string;
  interval: NumericInterval;
};

export function intervalsOverlap(
  productInterval: NumericInterval | null | undefined,
  filterInterval: NumericInterval,
): boolean {
  if (!productInterval) return false;
  return Math.max(productInterval.min, filterInterval.min)
    <= Math.min(productInterval.max, filterInterval.max);
}

function categoricalGroup(
  id: string,
  label: string,
  field: ListField,
  products: CatalogProduct[],
  t: Translate,
): CatalogFilterGroup | null {
  const values = [...new Set(products.flatMap((product) => product.filterData?.[field] ?? []))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  if (!values.length) return null;

  return {
    id,
    label,
    options: values.map((value) => ({
      id: `value:${value}`,
      label: t(catalogFilterKey(id, value), catalogFilterFallback(id, value)),
      matches: (product) => product.filterData?.[field]?.includes(value) ?? false,
    })),
  };
}

function intervalGroup(
  id: string,
  label: string,
  field: IntervalField,
  definitions: IntervalDefinition[],
  products: CatalogProduct[],
  t: Translate,
): CatalogFilterGroup | null {
  const options = definitions
    .map((definition): CatalogFilterOption => ({
      id: definition.id,
      label: t(definition.labelKey, definition.fallback),
      matches: (product) => intervalsOverlap(product.filterData?.[field], definition.interval),
    }))
    .filter((option) => products.some(option.matches));

  return options.length ? { id, label, options } : null;
}

const rangeDefinitions: Record<string, IntervalDefinition[]> = {
  "revenue-king": [
    { id: "range-under-300", labelKey: "productsRevenueKing.filterOptions.rangeUnder300", fallback: "Under 300 km", interval: { min: 0, max: 299.999 } },
    { id: "range-300-450", labelKey: "productsRevenueKing.filterOptions.range300to450", fallback: "300 km - 450 km", interval: { min: 300, max: 450 } },
    { id: "range-450-plus", labelKey: "productsRevenueKing.filterOptions.rangeAbove450", fallback: "450 km +", interval: { min: 450, max: Number.POSITIVE_INFINITY } },
  ],
  "elite-flagship": [
    { id: "range-under-500", labelKey: "productsEliteFlagship.filterOptions.rangeUnder500", fallback: "Under 500 km", interval: { min: 0, max: 499.999 } },
    { id: "range-500-700", labelKey: "productsEliteFlagship.filterOptions.range500to700", fallback: "500 km - 700 km", interval: { min: 500, max: 700 } },
    { id: "range-700-plus", labelKey: "productsEliteFlagship.filterOptions.rangeAbove700", fallback: "700 km +", interval: { min: 700, max: Number.POSITIVE_INFINITY } },
  ],
  "utility-pro": [
    { id: "range-under-250", labelKey: "productsUtilityPro.filterOptions.rangeUnder250", fallback: "Under 250 km", interval: { min: 0, max: 249.999 } },
    { id: "range-250-350", labelKey: "productsUtilityPro.filterOptions.range250to350", fallback: "250 km - 350 km", interval: { min: 250, max: 350 } },
    { id: "range-350-plus", labelKey: "productsUtilityPro.filterOptions.rangeAbove350", fallback: "350 km +", interval: { min: 350, max: Number.POSITIVE_INFINITY } },
  ],
};

const priceDefinitions: Record<string, IntervalDefinition[]> = {
  "revenue-king": [
    { id: "price-under-15k", labelKey: "productsRevenueKing.filterOptions.priceUnder15k", fallback: "Under $15,000", interval: { min: 0, max: 14999.999 } },
    { id: "price-15k-20k", labelKey: "productsRevenueKing.filterOptions.price15to20k", fallback: "$15,000 - $20,000", interval: { min: 15000, max: 20000 } },
    { id: "price-20k-plus", labelKey: "productsRevenueKing.filterOptions.priceAbove20k", fallback: "Above $20,000", interval: { min: 20000, max: Number.POSITIVE_INFINITY } },
  ],
  "elite-flagship": [
    { id: "price-under-35k", labelKey: "productsEliteFlagship.filterOptions.priceUnder35k", fallback: "Under $35,000", interval: { min: 0, max: 34999.999 } },
    { id: "price-35k-50k", labelKey: "productsEliteFlagship.filterOptions.price35to50k", fallback: "$35,000 - $50,000", interval: { min: 35000, max: 50000 } },
    { id: "price-50k-65k", labelKey: "productsEliteFlagship.filterOptions.price50to65k", fallback: "$50,000 - $65,000", interval: { min: 50000, max: 65000 } },
    { id: "price-65k-plus", labelKey: "productsEliteFlagship.filterOptions.priceAbove65k", fallback: "Above $65,000", interval: { min: 65000, max: Number.POSITIVE_INFINITY } },
  ],
  "utility-pro": [
    { id: "price-under-20k", labelKey: "productsUtilityPro.filterOptions.priceUnder20k", fallback: "Under $20,000", interval: { min: 0, max: 19999.999 } },
    { id: "price-20k-35k", labelKey: "productsUtilityPro.filterOptions.price20to35k", fallback: "$20,000 - $35,000", interval: { min: 20000, max: 35000 } },
    { id: "price-35k-plus", labelKey: "productsUtilityPro.filterOptions.priceAbove35k", fallback: "Above $35,000", interval: { min: 35000, max: Number.POSITIVE_INFINITY } },
  ],
};

function groupLabel(t: Translate, category: string, suffix: string, fallback: string): string {
  const prefix = category === "revenue-king"
    ? "productsRevenueKing"
    : category === "elite-flagship"
      ? "productsEliteFlagship"
      : "productsUtilityPro";
  return t(`${prefix}.filterGroups.${suffix}`, fallback);
}

export function buildCatalogFilterGroups(
  category: string,
  products: CatalogProduct[],
  t: Translate,
): CatalogFilterGroup[] {
  const common = [
    categoricalGroup("vehicleClass", groupLabel(t, category, category === "utility-pro" ? "vehicleType" : "bodyStyle", "Vehicle Class"), "vehicleClasses", products, t),
    categoricalGroup("batteryChemistry", groupLabel(t, category, "batteryChemistry", "Battery Chemistry"), "batteryChemistries", products, t),
    intervalGroup("rangeKm", groupLabel(t, category, "range", "Range"), "rangeKm", rangeDefinitions[category] ?? [], products, t),
    intervalGroup("priceUsd", groupLabel(t, category, "price", "Price"), "priceUsd", priceDefinitions[category] ?? [], products, t),
  ];

  const categoryGroups = category === "revenue-king"
    ? [
        categoricalGroup("steeringSetup", groupLabel(t, category, "steeringSetup", "Steering Setup"), "steeringSetups", products, t),
        categoricalGroup("inventoryStatus", groupLabel(t, category, "availability", "Availability"), "inventoryStatuses", products, t),
      ]
    : category === "elite-flagship"
      ? [
          categoricalGroup("voltagePlatform", groupLabel(t, category, "chargingStandard", "Voltage Platform"), "voltagePlatforms", products, t),
          categoricalGroup("powertrainType", groupLabel(t, category, "powertrainType", "Powertrain Type"), "powertrainTypes", products, t),
          categoricalGroup("inventoryStatus", groupLabel(t, category, "availability", "Availability"), "inventoryStatuses", products, t),
        ]
      : [
          categoricalGroup("drivetrain", groupLabel(t, category, "drivetrain", "Drivetrain"), "drivetrains", products, t),
          categoricalGroup("v2lAvailability", groupLabel(t, category, "v2lAvailability", "V2L Availability"), "v2lAvailability", products, t),
          intervalGroup("groundClearanceMm", groupLabel(t, category, "groundClearance", "Ground Clearance"), "groundClearanceMm", [
            { id: "clearance-200-plus", labelKey: "productsUtilityPro.filterOptions.highClearance", fallback: "High Clearance (200mm+)", interval: { min: 200, max: Number.POSITIVE_INFINITY } },
          ], products, t),
          categoricalGroup("inventoryStatus", groupLabel(t, category, "availability", "Availability"), "inventoryStatuses", products, t),
        ];

  return [...common, ...categoryGroups].filter((group): group is CatalogFilterGroup => group !== null);
}

export function filterCatalogProducts<T extends CatalogProduct>(
  products: T[],
  activeFilters: Record<string, Set<string>>,
  groups: CatalogFilterGroup[],
): T[] {
  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const selectedGroups = Object.entries(activeFilters).filter(([, selected]) => selected.size > 0);

  return products.filter((product) => selectedGroups.every(([groupId, selected]) => {
    const group = groupsById.get(groupId);
    if (!group) return false;
    return group.options.some((option) => selected.has(option.id) && option.matches(product));
  }));
}
