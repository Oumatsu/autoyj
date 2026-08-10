"use client";

import { useState, useCallback, useMemo } from "react";
import { LocaleLink } from "@/i18n/LocaleLink";

import { useTranslation } from "@/i18n/useTranslation";
import { getVehicleGalleryImages } from "@/lib/static-assets";
import {
  detailModelKey,
  detailVariantKey,
  translatedDetailValue,
  translatedDetailValues,
  translatedDetailString,
} from "@/views/products/detailTranslations";

type Category = "revenue-king" | "elite-flagship" | "utility-pro";

interface GalleryImage {
  src: string;
  cat: string;
  label: string;
}

interface VehicleSpec {
  label: string;
  value: string;
  green?: boolean;
  gold?: boolean;
}

interface VehicleFit {
  icon: string;
  title: string;
  desc: string;
  accent: string;
}

interface TrimItem {
  name: string;
  range: string;
  accel: string;
  sunroof: string;
  airbags: string;
  seat: string;
  fob: string;
  rec?: boolean;
}

interface TrimKeySpec {
  label: string;
  value: string;
}

interface TrimFeatureGroup {
  category: string;
  items: string[];
}

interface TrimComparisonTrim {
  trimConfigId?: string;
  name: string;
  order?: number;
  priceRmb?: number;
  priceDisplay?: string;
  rangeKm?: number;
  rangeDisplay?: string;
  batteryCapacityKwh?: number;
  batteryChemistry?: string;
  batteryDisplay?: string;
  drivetrain?: string;
  drivetrainDisplay?: string;
  motorPowerKw?: number;
  motorTorqueNm?: number;
  motorDisplay?: string;
  dcFastChargeSupported?: boolean;
  dcFastChargeTimeHours?: number;
  dcFastChargeMinPercent?: number;
  dcFastChargeMaxPercent?: number;
  chargingDisplay?: string;
  keySpecs?: TrimKeySpec[];
  baseFeatures?: string[];
  addedFeatures?: string[];
  upgradedFeatures?: string[];
  sourceStatus?: "Verified" | "Needs Source" | "TBC" | string;
  sourceUrl?: string;
  recommended?: boolean;
}

interface TrimComparisonData {
  status?: "Verified" | "Partial" | "TBC" | string;
  trims: TrimComparisonTrim[];
  commonFeatures?: TrimFeatureGroup[];
  sourceSummary?: string;
  lastVerifiedAt?: string;
}

interface TrimLadderFeature {
  text: string;
  value: string;
  sourceLevel: number;
  sourceTrim: string;
}

interface TrimLadderRow {
  trim: TrimComparisonTrim;
  currentFeatures: string[];
  entryFeatures: string[];
  inheritedFeatures: TrimLadderFeature[];
}

interface TrimLadderFeatureGroup {
  sourceLevel: number;
  items: string[];
}

interface DetailData {
  modelId: string;
  slug: string;
  vehicle: {
    brand: string;
    name: string;
    fob: string;
    battery: string;
    batteryType: string;
    range: string;
    charging: string;
    img: string;
    status: string;
    statusText: string;
  };
  category: Category;
  title: string;
  subtitle: string;
  heroDesc: string;
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  stat3Label: string;
  stat3Value: string;
  whyTitle: string;
  whyDesc: string;
  features: { icon: string; title: string; desc: string }[];
  specsLeft: VehicleSpec[];
  specsRight: VehicleSpec[];
  fits: VehicleFit[];
  relatedModels: { name: string; href: string }[];
  tags: string[];
  galleryImages?: GalleryImage[];
  batchLevels?: { units: number; display: string }[];
  batchMargin?: { low: string; high: string };
  trimComparison?: TrimComparisonData;
  trimData?: TrimItem[];
  trimNote?: string;
}

const DEFAULT_BATCH_LEVELS = [
  { units: 10, display: "$45K – $65K" },
  { units: 20, display: "$90K – $130K" },
  { units: 50, display: "$225K – $325K" },
  { units: 100, display: "$450K – $650K" },
];

const DEFAULT_BATCH_MARGIN = { low: "$4,500", high: "$6,500" };

function compactItems(items: Array<string | undefined>): string[] {
  return items.filter((item): item is string => Boolean(item));
}

function uniqueItems(items: string[]): string[] {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function stripCarriedPrefix(item: string) {
  return item.replace(/^Carried from [^:]+:\s*/i, "").trim();
}

function normalizeFeatureKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function parseTrimFeature(item: string) {
  const clean = stripCarriedPrefix(item);
  const colonIndex = clean.indexOf(":");
  if (colonIndex === -1) {
    const label = clean.trim();
    return {
      key: normalizeFeatureKey(label),
      label,
      value: "Standard",
      display: label,
    };
  }

  const label = clean.slice(0, colonIndex).trim();
  const rawValue = clean.slice(colonIndex + 1).trim();
  const parts = rawValue.split(/\s*->\s*/).map((part) => part.trim()).filter(Boolean);
  const value = parts.length ? parts[parts.length - 1] : rawValue;

  return {
    key: normalizeFeatureKey(label),
    label,
    value,
    display: value ? `${label}: ${value}` : label,
  };
}

function buildTrimLadderRows(trims: TrimComparisonTrim[]): TrimLadderRow[] {
  const inherited: TrimLadderFeature[] = [];

  return trims.map((trim, index) => {
    const entryFeatures = index === 0 ? uniqueItems(trim.baseFeatures || []).map(stripCarriedPrefix) : [];
    const inheritedFeatures = inherited.map((feature) => ({ ...feature }));
    const levelFeatures = uniqueItems([...(trim.addedFeatures || []), ...(trim.upgradedFeatures || [])]).map(parseTrimFeature);
    const levelFinals = new Map<string, ReturnType<typeof parseTrimFeature>>();
    levelFeatures.forEach((feature) => {
      if (feature.key) levelFinals.set(feature.key, feature);
    });
    const currentFeatures: string[] = [];

    levelFinals.forEach((feature) => {
      const previous = inherited.find((item) => normalizeFeatureKey(parseTrimFeature(item.text).label) === feature.key);
      if (previous?.value === feature.value) return;
      currentFeatures.push(previous ? `${feature.label}: ${previous.value} -> ${feature.value}` : feature.display);
    });

    const row: TrimLadderRow = {
      trim,
      currentFeatures,
      entryFeatures,
      inheritedFeatures,
    };

    const nextFeatures = index === 0 ? entryFeatures.map(parseTrimFeature) : Array.from(levelFinals.values());
    nextFeatures.forEach((feature) => {
      if (!feature.key) return;
      const existingIndex = inherited.findIndex((item) => normalizeFeatureKey(parseTrimFeature(item.text).label) === feature.key);
      const next = {
        text: feature.display,
        value: feature.value,
        sourceLevel: index + 1,
        sourceTrim: trim.name,
      };
      if (existingIndex >= 0) {
        if (inherited[existingIndex].value !== feature.value) inherited[existingIndex] = next;
      } else {
        inherited.push({
          ...next,
        });
      }
    });

    return row;
  });
}

function groupTrimLadderFeatures(features: TrimLadderFeature[]): TrimLadderFeatureGroup[] {
  return features.reduce<TrimLadderFeatureGroup[]>((groups, feature) => {
    const group = groups.find((item) => item.sourceLevel === feature.sourceLevel);
    if (group) {
      group.items.push(feature.text);
    } else {
      groups.push({ sourceLevel: feature.sourceLevel, items: [feature.text] });
    }
    return groups;
  }, []);
}

function legacyTrimComparison(data: DetailData, v: DetailData["vehicle"]): TrimComparisonData | null {
  if (!data.trimData || data.trimData.length === 0) return null;

  return {
    status: "TBC",
    trims: data.trimData.map((trim, index) => ({
      name: trim.name,
      order: index + 1,
      priceDisplay: trim.fob,
      rangeDisplay: trim.range,
      keySpecs: [
        { label: "Range", value: trim.range },
        { label: "0-100 km/h", value: trim.accel },
        { label: "Airbags", value: trim.airbags },
        { label: "Seat", value: trim.seat },
      ].filter((item) => item.value),
      baseFeatures: uniqueItems([trim.range, trim.sunroof, trim.seat]),
      addedFeatures: index === 0 ? [] : uniqueItems([trim.sunroof, trim.airbags, trim.seat]),
      upgradedFeatures: [],
      recommended: trim.rec,
      sourceStatus: "TBC",
    })),
    commonFeatures: [
      {
        category: "EV platform",
        items: compactItems([
          v.batteryType,
          data.specsLeft.find((s) => /Drive/.test(s.label))?.value,
          data.specsLeft.find((s) => /Top Speed/.test(s.label))?.value,
        ]),
      },
      {
        category: "Battery & charging",
        items: compactItems([
          v.battery,
          v.charging,
          data.specsRight.find((s) => /Warranty/.test(s.label))?.value,
        ]),
      },
      {
        category: "Body basics",
        items: compactItems([
          data.specsRight.find((s) => /Dimensions/.test(s.label))?.value,
          data.specsRight.find((s) => /Wheelbase/.test(s.label))?.value,
          data.specsRight.find((s) => /Seating/.test(s.label))?.value,
        ]),
      },
    ].filter((group) => group.items.length > 0),
    sourceSummary: data.trimNote || "Legacy trim data needs source verification before it is used for quoting.",
  };
}

type Translate = (
  key: string,
  fallbackOrOptions?: string | Record<string, string | number>,
) => unknown;

function TrimPoster({ data, v, t }: { data: DetailData; v: DetailData["vehicle"]; t: Translate }) {
  const comparison = data.trimComparison || legacyTrimComparison(data, v);
  if (!comparison) return null;

  const trims = [...comparison.trims].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const ladderRows = buildTrimLadderRows(trims);
  const commonGroups = comparison.commonFeatures?.filter((group) => group.items.length > 0) || [];
  if (trims.length === 0 && commonGroups.length === 0) return null;
  const sourceTone = comparison.status === "Verified" ? "text-accent" : comparison.status === "Partial" ? "text-theme" : "text-red-300";

  return (
    <section className="py-14 md:py-20 bg-a">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="label mb-3">{t("productsDetail.ui.allVersions", "All Versions - Side by Side") as string}</div>
            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-white">
              {v.brand} {v.name} {t("productsDetail.ui.trimMap", "Trim Map") as string}
            </h2>
            <p className="text-gray-500 text-sm font-light mt-3 max-w-2xl">
              {t("productsDetail.ui.trimMapDescription", "Version cards first, then only the equipment that changes. Shared equipment is separated below so dealers can see the real differences faster.") as string}
            </p>
          </div>
          <div className={`text-[10px] font-black uppercase tracking-[.18em] ${sourceTone}`}>
            {comparison.status || "TBC"} {t("productsDetail.ui.trimData", "trim data") as string}
          </div>
        </div>

        {trims.length > 0 ? (
        <div className="max-w-full overflow-x-auto pb-2 mb-8">
          <div className="flex min-w-[720px] items-end gap-4">
            {ladderRows.map(({ trim, currentFeatures, entryFeatures, inheritedFeatures }, index) => {
              const inheritedGroups = groupTrimLadderFeatures(inheritedFeatures);
              return (
            <div
              key={trim.name}
              className={`relative min-w-[230px] flex-1 rounded-[1.25rem] p-5 border transition-colors ${
                trim.recommended
                  ? "bg-accent/[0.08] border-accent/45 shadow-[0_0_40px_rgba(16,185,129,.08)]"
                  : "bg-white/[0.025] border-white/10"
              }`}
              style={{ minHeight: `${300 + index * 38}px` }}
            >
              {trim.recommended && (
                <div className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-[8px] font-black uppercase tracking-[.16em] text-black">
                  {t("productsDetail.ui.recommended", "Recommended") as string}
                </div>
              )}
              <div className="text-[10px] font-black uppercase tracking-[.18em] text-gray-600 mb-2">
                {t("productsDetail.ui.level", "Level") as string} {index + 1}
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-5">
                {trim.name}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  [t("productsDetail.ui.price", "Price") as string, trim.priceDisplay],
                  [t("productsDetail.ui.range", "Range") as string, trim.rangeDisplay],
                  [t("productsDetail.ui.battery", "Battery") as string, trim.batteryDisplay],
                  [t("productsDetail.ui.drive", "Drive") as string, trim.drivetrainDisplay],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={`${trim.name}-${label}`}>
                    <div className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1">{label}</div>
                    <div className="text-sm font-black italic text-white">{value}</div>
                  </div>
                ))}
              </div>
              {index === 0 ? (
                <div className="text-[9px] font-black uppercase tracking-[.16em] text-gray-600 mb-3">{t("productsDetail.ui.entryEquipment", "Entry equipment") as string}</div>
              ) : (
                <div className="text-[9px] font-black uppercase tracking-[.16em] text-accent mb-3">{t("productsDetail.ui.addsOverPrevious", "Adds over previous trim") as string}</div>
              )}
              <div className="space-y-2">
                {(currentFeatures.length ? currentFeatures : entryFeatures).map((item, itemIndex) => (
                  <div key={`${trim.name}-current-${itemIndex}-${item}`} className="text-[10px] font-black uppercase tracking-wider text-white">
                    {item}
                  </div>
                ))}
                {inheritedGroups.length > 0 && (
                  <div className="pt-3 space-y-2 border-t border-white/[0.06]">
                    {inheritedGroups.map((group) => (
                      <div key={`${trim.name}-inherited-level-${group.sourceLevel}`} className="space-y-2">
                        {group.items.map((item, itemIndex) => (
                          <div key={`${trim.name}-inherited-${group.sourceLevel}-${itemIndex}-${item}`} className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            {item}
                          </div>
                        ))}
                        <div className="text-[9px] font-black uppercase tracking-[.14em] text-gray-600">
                          ({t("productsDetail.ui.fromLevel", "from Level") as string} {group.sourceLevel})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-5 text-[8px] font-black uppercase tracking-[.16em] text-gray-700">
                {trim.sourceStatus || "TBC"}
              </div>
            </div>
              );
            })}
          </div>
        </div>
        ) : (
          <div className="mb-8 rounded-[1.25rem] border border-red-400/20 bg-red-400/[0.04] p-6">
            <div className="text-[10px] font-black uppercase tracking-[.18em] text-red-300 mb-3">{t("productsDetail.ui.versionLadderPending", "Version ladder pending") as string}</div>
            <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-3">
              {t("productsDetail.ui.trimAdditionsUnverified", "Trim-level additions are not verified yet") as string}
            </h3>
            <p className="max-w-3xl text-sm font-light leading-relaxed text-gray-400">
              {t("productsDetail.ui.trimPendingDescription", "The section is ready for source-backed trim records. Until each version is verified, this page only shows shared model-level configuration below.") as string}
            </p>
          </div>
        )}

        {trims.length > 0 && (
        <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-black/25 mb-8">
          <div className="min-w-[920px]">
            <div
              className="grid border-b border-white/10"
              style={{ gridTemplateColumns: `220px repeat(${trims.length}, minmax(150px, 1fr))` }}
            >
              <div className="p-4 text-[10px] font-black uppercase tracking-[.2em] text-gray-600">
                {t("productsDetail.ui.coreSpec", "Core Spec") as string}
              </div>
              {trims.map((trim) => (
                <div
                  key={trim.name}
                  className={`p-4 text-center border-l border-white/5 ${trim.recommended ? "bg-accent/[0.08]" : ""}`}
                >
                  <div className="text-[10px] font-black uppercase tracking-[.14em] text-white">{trim.name}</div>
                  <div className="text-[9px] font-black uppercase tracking-[.12em] text-gray-600 mt-1">{trim.priceDisplay || "TBC"}</div>
                </div>
              ))}
            </div>

            {[
              { group: t("productsDetail.ui.powertrain", "Powertrain") as string, rows: [[t("productsDetail.ui.range", "Range") as string, "rangeDisplay"], [t("productsDetail.ui.battery", "Battery") as string, "batteryDisplay"], [t("productsDetail.ui.drivetrain", "Drivetrain") as string, "drivetrainDisplay"], [t("productsDetail.ui.motor", "Motor") as string, "motorDisplay"], [t("productsDetail.ui.charging", "Charging") as string, "chargingDisplay"]] },
              { group: t("productsDetail.ui.packageLogic", "Package Logic") as string, rows: [[t("productsDetail.ui.baseEquipment", "Base Equipment") as string, "baseFeatures"], [t("productsDetail.ui.addedFeatures", "Added Features") as string, "addedFeatures"], [t("productsDetail.ui.upgrades", "Upgrades") as string, "upgradedFeatures"]] },
            ].map((section) => (
              <div key={section.group}>
                <div className="px-4 py-3 bg-white/[0.035] border-b border-white/5 text-[10px] font-black uppercase tracking-[.18em] text-accent">
                  {section.group}
                </div>
                {section.rows.map(([label, key]) => (
                  <div
                    key={label}
                    className="grid border-b border-white/[0.04] last:border-b-0"
                    style={{ gridTemplateColumns: `220px repeat(${trims.length}, minmax(150px, 1fr))` }}
                  >
                    <div className="px-4 py-3 text-[10px] font-black uppercase tracking-[.1em] text-gray-500">
                      {label}
                    </div>
                    {trims.map((trim) => {
                      const rawValue = trim[key as keyof TrimComparisonTrim];
                      const value = Array.isArray(rawValue) ? rawValue.slice(0, 4).join("; ") : String(rawValue || "TBC");
                      const isPositive = key === "addedFeatures" || key === "upgradedFeatures";
                      return (
                        <div
                          key={`${trim.name}-${label}`}
                          className={`px-4 py-3 text-center text-xs font-bold border-l border-white/[0.04] ${
                            trim.recommended ? "bg-accent/[0.06]" : ""
                          }`}
                        >
                          <span className={isPositive ? "text-accent" : value === "TBC" ? "text-gray-600" : "text-white"}>
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        )}

        <div className="rounded-[2rem] border border-theme/20 bg-theme/[0.045] p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <div className="label label-gold mb-3">{t("productsDetail.ui.allTrimsInclude", "All Trims Include") as string}</div>
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">
                {t("productsDetail.ui.trimFramework", "Trim Framework - Standard Equipment Across Every Version") as string}
              </h3>
            </div>
            <LocaleLink href="/contact" className="btn-primary px-7 py-3 rounded text-xs font-black tracking-widest uppercase italic flex-shrink-0">
              {t("productsDetail.ui.requestTrimPricing", "Request Trim Pricing") as string}
            </LocaleLink>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commonGroups.map((group) => (
              <div key={group.category} className="rounded-2xl bg-black/20 border border-white/5 p-5">
                <div className="text-[10px] font-black uppercase tracking-[.18em] text-theme mb-4">{group.category}</div>
                <div className="space-y-2">
                  {group.items.map((item, itemIndex) => (
                    <div key={`${group.category}-${itemIndex}-${item}`} className="flex gap-2 text-xs text-gray-400 font-light leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] sm:text-[10px] text-gray-700 mt-5">
            {(data.trimNote || `* Current model year. All trims share core platform specifications. Pricing on request - varies by order volume and destination port.`).split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 ? <br /> : null}</span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function VehicleDetail({ data: rawData }: { data: DetailData }) {
  const { t } = useTranslation();
  const data = useMemo<DetailData>(() => {
    if (!rawData || typeof rawData !== "object") return rawData;

    const modelText = (field: string, fallback: string) =>
      translatedDetailString(t, detailModelKey(rawData.slug, field), fallback);
    const valueText = (fallback: string) => translatedDetailValue(t, fallback);
    const valueArray = (fallback: string[]) => translatedDetailValues(t, fallback);
    const localizeTrim = (trim: TrimComparisonTrim): TrimComparisonTrim => {
      if (!trim || !trim.trimConfigId) return trim;
      const variantText = (field: string, fallback: string) =>
        translatedDetailString(t, detailVariantKey(trim.trimConfigId!, field), fallback);
      return {
        ...trim,
        name: variantText("name", trim.name),
        batteryDisplay: valueText(trim.batteryDisplay || ""),
        drivetrain: valueText(trim.drivetrain || ""),
        drivetrainDisplay: valueText(trim.drivetrainDisplay || ""),
        chargingDisplay: valueText(trim.chargingDisplay || ""),
        sourceStatus: valueText(trim.sourceStatus || ""),
        baseFeatures: valueArray(trim.baseFeatures || []),
        addedFeatures: valueArray(trim.addedFeatures || []),
        upgradedFeatures: valueArray(trim.upgradedFeatures || []),
        keySpecs: trim.keySpecs?.map((spec) => ({
          label: valueText(spec.label || ""),
          value: valueText(spec.value || ""),
        })),
      };
    };

    const localized: DetailData = { ...rawData };
    (["heroDesc", "whyDesc", "trimNote"] as const).forEach((field) => {
      const value = rawData[field];
      if (typeof value === "string") (localized as unknown as Record<string, unknown>)[field] = modelText(field, value);
    });
    if (rawData.subtitle) localized.subtitle = valueText(rawData.subtitle);
    if (rawData.stat1Value) localized.stat1Value = valueText(rawData.stat1Value);
    if (rawData.stat2Value) localized.stat2Value = valueText(rawData.stat2Value);
    if (rawData.stat3Value) localized.stat3Value = valueText(rawData.stat3Value);
    if (rawData.vehicle) {
      localized.vehicle = {
        ...rawData.vehicle,
        brand: modelText("vehicle.brand", rawData.vehicle.brand || ""),
        name: modelText("vehicle.name", rawData.vehicle.name || ""),
        charging: valueText(rawData.vehicle.charging || ""),
        statusText: valueText(rawData.vehicle.statusText || ""),
      };
    }
    if (Array.isArray(rawData.tags)) localized.tags = valueArray(rawData.tags);
    if (Array.isArray(rawData.features)) {
      localized.features = rawData.features.map((feature) => ({
        ...feature,
        title: valueText(feature.title || ""),
        desc: valueText(feature.desc || ""),
      }));
    }
    if (Array.isArray(rawData.specsLeft)) {
      localized.specsLeft = rawData.specsLeft.map((spec) => ({
        ...spec,
        value: valueText(spec.value || ""),
      }));
    }
    if (Array.isArray(rawData.specsRight)) {
      localized.specsRight = rawData.specsRight.map((spec) => ({
        ...spec,
        value: valueText(spec.value || ""),
      }));
    }
    if (Array.isArray(rawData.fits)) {
      localized.fits = rawData.fits.map((fit) => ({
        ...fit,
        title: valueText(fit.title || ""),
        desc: valueText(fit.desc || ""),
        accent: valueText(fit.accent || ""),
      }));
    }
    if (rawData.trimComparison) {
      localized.trimComparison = {
        ...rawData.trimComparison,
        status: valueText(rawData.trimComparison.status || ""),
        trims: Array.isArray(rawData.trimComparison.trims) ? rawData.trimComparison.trims.map(localizeTrim) : [],
        commonFeatures: rawData.trimComparison.commonFeatures?.map((group) => ({
          category: valueText(group.category || ""),
          items: valueArray(group.items || []),
        })),
      };
    }
    return localized;
  }, [rawData, t]);
  const translateSpecLabel = useCallback((label: string) => {
    const key = `specs.${label.trim()}`;
    return t(key, label);
  }, [t]);

  const v = data.vehicle;
  const gallery: GalleryImage[] = data.galleryImages?.length ? data.galleryImages : getVehicleGalleryImages(rawData.slug, v.img);
  const batchLevels = data.batchLevels?.length ? data.batchLevels : DEFAULT_BATCH_LEVELS;
  const batchMargin = data.batchMargin || DEFAULT_BATCH_MARGIN;
  const [galIdx, setGalIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [batchIdx, setBatchIdx] = useState(0);

  const goGallery = useCallback((dir: number) => {
    if (animating) return;
    setAnimating(true);
    setGalIdx((prev) => (prev + dir + gallery.length) % gallery.length);
    setTimeout(() => setAnimating(false), 600);
  }, [animating, gallery.length]);

  const openLightbox = useCallback(() => setLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const prevIdx = (galIdx - 1 + gallery.length) % gallery.length;
  const nextIdx = (galIdx + 1) % gallery.length;

  const batch = batchLevels[batchIdx];

  return (
    <>
      <div className="h-[var(--navbar-h,56px)] lg:hidden bg-black w-full" />
      {/* Hero — bottom gradient (transparent → black) bridges into Gallery's pure black */}
      <section data-vd-hero className="relative lg:min-h-screen flex items-end bg-black w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <style>{`@media (min-width: 1024px) { [data-vd-hero] { aspect-ratio: auto !important; } }`}</style>
        <div className="absolute inset-0">
          <img src={v.img} className="w-full h-full object-cover" style={{ filter: "grayscale(100%) brightness(.6)" }} alt={v.name} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(28,28,28,.5) 28%, transparent 75%)" }} />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 40% at 70% 40%, rgba(16,185,129,.06) 0%, transparent 70%)" }} />
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-0"
          style={{
            height: "clamp(120px, 14vh, 220px)",
            background: [
              `linear-gradient(`,
              `  to top,`,
              `  rgba(0,0,0,1) 0%,`,
              `  rgba(0,0,0,0.92) 18%,`,
              `  rgba(0,0,0,0.72) 38%,`,
              `  rgba(0,0,0,0.38) 62%,`,
              `  rgba(0,0,0,0.12) 82%,`,
              `  rgba(0,0,0,0) 100%`,
              `)`,
            ].join("\n"),
          }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 pb-12 lg:pb-20 pt-20 lg:pt-36">
          <nav className="hidden min-[504px]:flex items-center gap-2 text-[10px] font-black tracking-widest uppercase mb-8 text-gray-600">
            <LocaleLink href="/" className="hover:text-gray-400 transition">{t("productsDetail.ui.home", "Home")}</LocaleLink>
            <span>/</span>
            <LocaleLink href={`/products/${data.category}`} className="hover:text-accent transition text-accent">
              {data.category === "revenue-king" ? t("productsDetail.ui.revenueKing", "Revenue King") : data.category === "elite-flagship" ? t("productsDetail.ui.eliteFlagship", "Elite Flagship") : t("productsDetail.ui.utilityPro", "Utility Pro")}
            </LocaleLink>
            <span>/</span>
            <span className="text-gray-500">{v.brand} {v.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <div className="hidden min-[504px]:flex items-center gap-3 mb-5">
                {data.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[9px] font-black px-3 py-1.5 rounded uppercase tracking-widest" style={{ background: "rgba(16,185,129,.15)", color: "var(--color-green)", border: "1px solid rgba(16,185,129,.25)" }}>{tag}</span>
                ))}
              </div>
              <h1 className="font-black italic uppercase tracking-tighter text-white leading-none mb-2" style={{ fontSize: "clamp(3rem,8vw,7rem)" }}>{v.brand}<br />{v.name}</h1>
              <p className="text-2xl font-light italic text-gray-500 mb-8">{data.subtitle}</p>
              <p className="hidden lg:block text-gray-300 text-base font-light leading-relaxed mb-10 max-w-lg italic border-l-2 pl-6" style={{ borderColor: "rgba(16,185,129,.45)" }}>{data.heroDesc}</p>
              <div className="hidden min-[456px]:flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <LocaleLink href="/qr" className="btn-primary px-6 sm:px-9 py-3 sm:py-4 rounded text-xs sm:text-sm font-black tracking-widest uppercase italic shadow-lg text-center">{t("productsDetail.ui.whatsappInquiry", "WhatsApp Inquiry")}</LocaleLink>
                <LocaleLink href="#specs" className="px-6 sm:px-9 py-3 sm:py-4 rounded text-xs sm:text-sm font-black tracking-widest uppercase italic border border-accent/40 text-accent hover:bg-accent hover:text-black transition text-center">{t("productsDetail.ui.viewFullSpecs", "View Full Specs") as string} ↓</LocaleLink>
              </div>
            </div>
            <div className="hidden min-[812px]:grid grid-cols-3 gap-3">
              <div className="glass rounded-[1.5rem] p-5 text-center border-accent/20"><div className="text-3xl font-black italic text-accent mb-1">{data.stat1Value}</div><div className="text-[8px] font-black tracking-[.25em] uppercase text-gray-600">{t("productsDetail.ui.range", "Range")}</div></div>
              <div className="glass rounded-[1.5rem] p-5 text-center border-theme/20"><div className="text-3xl font-black italic text-theme mb-1">{data.stat2Value}</div><div className="text-[8px] font-black tracking-[.25em] uppercase text-gray-600">{t("productsDetail.ui.price", "Price")}</div></div>
              <div className="glass rounded-[1.5rem] p-5 text-center border-accent/20"><div className="text-xl font-black italic text-white mb-1">{data.stat3Value}</div><div className="text-[8px] font-black tracking-[.25em] uppercase text-gray-600">{t("productsDetail.ui.battery", "Battery")}</div></div>
              <div className="col-span-3 glass rounded-[1.5rem] px-6 py-4 flex items-center justify-between border-theme/10">
                <div className="flex items-center gap-2.5"><div className="pulse-dot" /><span className="text-[10px] font-black tracking-widest uppercase text-gray-500">{t("productsDetail.ui.factoryPrice", "Factory Price")}</span></div>
                <LocaleLink href="/solutions/request-quote" className="text-[10px] font-black tracking-widest uppercase text-theme hover:text-white transition">{t("productsDetail.ui.requestBatchQuote", "Request Batch Quote") as string} →</LocaleLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bridge: Hero (black) → Gallery (black) — same color, no bridge needed */}

      {/* Gallery — 21-stop fine gradient: #000 → mid at 2% intervals, ~1.4 RGB step per stop */}
      <section
        className="py-8 md:py-12 relative"
        style={{
          background: [
            `linear-gradient(to bottom,`,
            `  #000 0%,`,
            `  #000 60%,`,
            `  #010101 62%,`,
            `  #030303 64%,`,
            `  #040404 66%,`,
            `  #060606 68%,`,
            `  #070707 70%,`,
            `  #080808 72%,`,
            `  #0a0a0a 74%,`,
            `  #0b0b0b 76%,`,
            `  #0d0d0d 78%,`,
            `  #0e0e0e 80%,`,
            `  #0f0f0f 82%,`,
            `  #111111 84%,`,
            `  #121212 86%,`,
            `  #141414 88%,`,
            `  #151515 90%,`,
            `  #161616 92%,`,
            `  #181818 94%,`,
            `  #191919 96%,`,
            `  #1b1b1b 98%,`,
            `  #1c1c1c 100%`,
            `)`,
          ].join("\n"),
        }}
      >
        <style>{`@keyframes imgSwitchIn { from { opacity: 0.5; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } } .img-switch-in { animation: imgSwitchIn 500ms cubic-bezier(0.4, 0, 0.2, 1) both; }`}</style>
        <div className="container mx-auto px-2 md:px-6 max-w-7xl">
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute left-0 inset-y-0 w-[9%] sm:w-[14%] md:w-[18%] cursor-pointer overflow-hidden hidden sm:block" onClick={() => goGallery(-1)}>
                <img src={gallery[prevIdx].src} className="h-full object-cover transition-opacity duration-700" alt={gallery[prevIdx].label} style={{ width: "200%", opacity: 0.4, borderRadius: "0 0.75rem 0.75rem 0", objectPosition: "right" }} />
              </div>
              <div className="relative mx-auto w-[90%] sm:w-[70%] md:w-[64%] lg:w-[60%] cursor-zoom-in" style={{ zIndex: 1, aspectRatio: "16/9" }} onClick={openLightbox}>
                <img key={`center-img-${galIdx}`} src={gallery[galIdx].src} className="w-full h-full object-cover rounded-xl img-switch-in" alt={gallery[galIdx].label} />
              </div>
              <div className="absolute right-0 inset-y-0 w-[9%] sm:w-[14%] md:w-[18%] cursor-pointer overflow-hidden hidden sm:block" onClick={() => goGallery(1)}>
                <img src={gallery[nextIdx].src} className="h-full object-cover transition-opacity duration-700" alt={gallery[nextIdx].label} style={{ width: "200%", opacity: 0.4, borderRadius: "0.75rem 0 0 0.75rem", objectPosition: "left" }} />
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); goGallery(-1); }} className="absolute top-1/2 -translate-y-1/2 left-1 sm:left-3 md:left-5 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-black/55 border border-white/10 text-white text-lg sm:text-xl flex items-center justify-center hover:bg-gold/85 hover:text-black transition z-20">&lsaquo;</button>
            <button onClick={(e) => { e.stopPropagation(); goGallery(1); }} className="absolute top-1/2 -translate-y-1/2 right-1 sm:right-3 md:right-5 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-black/55 border border-white/10 text-white text-lg sm:text-xl flex items-center justify-center hover:bg-gold/85 hover:text-black transition z-20">&rsaquo;</button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-6 relative z-10">
            {gallery.map((_, i) => (
              <button key={i} onClick={() => { if (i !== galIdx) goGallery(i - galIdx); }} className={`w-2 h-2 rounded-full transition-all ${i === galIdx ? "bg-gold w-5" : "bg-white/20 hover:bg-white/40"}`} />
            ))}
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95" onClick={closeLightbox}>
          <button className="absolute top-5 right-6 w-10 h-10 rounded-full bg-white/7 border border-white/15 text-white text-lg flex items-center justify-center hover:bg-white/15 transition z-10" onClick={closeLightbox}>&times;</button>
          <button className="absolute top-1/2 -translate-y-1/2 left-5 w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white text-2xl flex items-center justify-center hover:bg-gold/60 hover:text-black transition" onClick={(e) => { e.stopPropagation(); goGallery(-1); }}>&lsaquo;</button>
          <img src={gallery[galIdx].src} className="max-w-[92vw] max-h-[88vh] object-contain rounded-md" alt="" onClick={(e) => e.stopPropagation()} />
          <button className="absolute top-1/2 -translate-y-1/2 right-5 w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white text-2xl flex items-center justify-center hover:bg-gold/60 hover:text-black transition" onClick={(e) => { e.stopPropagation(); goGallery(1); }}>&rsaquo;</button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/30 text-[11px] font-black tracking-[.2em]">{galIdx + 1} / {gallery.length}</div>
        </div>
      )}

      {/* Buyer Logic / Key Features */}
      <section className="py-12 md:py-16" style={{ position: "relative", background: "var(--color-mid)" }}>
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <div className="label mb-5">{t("productsDetail.ui.whyThisModel", "Why this model")}</div>
              <h2 className="sh mb-6" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>{data.whyDesc}</h2>
              <p className="text-gray-300 text-base font-light leading-relaxed mb-8">{v.charging}</p>
              <div className="flex flex-wrap gap-3">{data.tags.slice(1).map((tag: string) => (<span key={tag} className="text-[9px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)" }}>{tag}</span>))}</div>
            </div>
            <div className="flex flex-col gap-4">
              {data.features.map((feat, i) => (
                <div key={i} className="rounded-[2rem] p-7 bg-white/[0.02] border border-accent/10 hover:border-accent/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ background: "rgba(16,185,129,.1)" }}>{feat.icon}</div>
                    <div><h4 className="text-white font-black uppercase tracking-wider text-sm mb-2">{feat.title}</h4><p className="text-gray-300 text-sm font-light leading-relaxed">{feat.desc}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dealer ROI / Business Case */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/pic/page/photo-1449965408869-eaa3f722e40d.webp" className="w-full h-full object-cover" style={{ filter: "brightness(.28) grayscale(20%)" }} alt="" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,10,.80) 0%, rgba(10,10,10,.55) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--color-mid) 0%, transparent 20%, transparent 80%, var(--color-mid) 100%)" }} />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div>
              <div className="label label-gold mb-5">{t("productsDetail.ui.businessCase", "The Business Case")}</div>
              <h2 className="sh mb-5" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>{t("productsDetail.ui.yourMargin", "Your Margin.")}<br /><span className="text-theme">{t("productsDetail.ui.yourMarket", "Your Market")}</span>.</h2>
              <p className="text-gray-300 text-base font-light leading-relaxed mb-8">{t("productsDetail.ui.businessCaseDescription", `Forward-thinking fleet buyers are ready to transition from ICE to EV — but they need the right price point. The ${v.brand} ${v.name} lands exactly in that gap: an accessible entry price backed by a powerful total-cost-of-ownership story. That gap is your margin.`)}</p>
              <div className="space-y-4 mb-8">
                {[t("productsDetail.ui.lowEntryPrice", "Low entry price — accessible minimum order quantity"), t("productsDetail.ui.fastTurnover", "Fast inventory turnover — strong monthly savings close deals quickly"), `${t("productsDetail.ui.typicalBatchGross", "Typical 10-unit batch gross")}: ${batchMargin.low} – ${batchMargin.high}`].map((text, i) => (
                  <div key={i} className="flex items-center gap-3"><div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-black" style={{ background: "rgba(197,160,89,.15)", color: "var(--color-gold)", border: "1px solid rgba(197,160,89,.3)" }}>{i + 1}</div><p className="text-xs font-black uppercase tracking-wider text-gray-400">{text}</p></div>
                ))}
              </div>
              <div className="glass rounded-[1.5rem] p-6 inline-block" style={{ background: "rgba(0,0,0,.4)", borderColor: "rgba(197,160,89,.25)" }}>
                <div className="text-[9px] font-black tracking-widest uppercase text-gray-600 mb-1">{t("productsDetail.ui.estimatedMarginPerUnit", "Estimated Gross Margin per Unit")}</div>
                <div className="text-4xl font-black italic text-theme">{batchMargin.low} – {batchMargin.high}</div>
              </div>
            </div>
            <div className="glass rounded-[2.5rem] p-8 md:p-10" style={{ background: "rgba(0,0,0,.48)" }}>
              <div className="text-[9px] font-black tracking-widest uppercase text-gray-600 mb-8">{t("productsDetail.ui.batchProfitEstimator", "Batch Profit Estimator")}</div>
              <div className="mb-8">
                <div className="flex justify-between mb-4"><span className="text-xs font-black uppercase tracking-wider text-white">{t("productsDetail.ui.unitsOrdered", "Units Ordered")}</span><span className="text-xs font-black text-theme">{t("productsDetail.ui.unitsCount", { count: batch.units })}</span></div>
                <div className="flex gap-2">{batchLevels.map((lvl, i) => (<button key={i} onClick={() => setBatchIdx(i)} className="flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider transition" style={i === batchIdx ? { background: "var(--color-gold)", color: "#000" } : { background: "rgba(255,255,255,.06)", color: "#6B7280" }}>{lvl.units}</button>))}</div>
              </div>
              <div className="rounded-2xl p-6 text-center mb-6" style={{ background: "rgba(197,160,89,.08)", border: "1px solid rgba(197,160,89,.25)" }}>
                <div className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-1">{t("productsDetail.ui.estimatedGrossProfit", "Estimated Gross Profit")}</div>
                <div className="text-4xl font-black italic text-white mb-1">{batch.display}</div>
                <div className="text-[9px] font-black tracking-widest uppercase text-theme">{t("productsDetail.ui.beforeDuties", "Before import duties & local costs")}</div>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-xs"><span className="text-gray-600 font-black uppercase tracking-wider">{t("productsDetail.ui.units", "Units")}</span><span className="text-white font-black">{batch.units}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-600 font-black uppercase tracking-wider">{t("productsDetail.ui.marginPerUnit", "Margin / unit")}</span><span className="text-theme font-black">{batchMargin.low} – {batchMargin.high}</span></div>
                <div className="flex justify-between text-xs border-t pt-3" style={{ borderColor: "rgba(255,255,255,.05)" }}><span className="text-gray-400 font-black uppercase tracking-wider">{t("productsDetail.ui.totalGross", "Total gross")}</span><span className="text-accent font-black">{batch.display}</span></div>
              </div>
             <p className="text-[9px] text-gray-700 text-center">*{t("productsDetail.ui.pricingDisclaimer", "Based on typical emerging market retail pricing.")} <LocaleLink href="/solutions/request-quote" className="text-theme hover:text-white transition">{t("productsDetail.ui.requestDetailedQuote", "Request a detailed quote")}</LocaleLink>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specs */}
      <section id="specs" className="py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/pic/page/photo-1503376780353-7e6692767b70.webp" className="w-full h-full object-cover" style={{ filter: "brightness(.35) grayscale(20%)" }} alt="" />
          <div className="absolute inset-0" style={{ background: "rgba(10,10,10,.60)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--color-mid) 0%, transparent 20%, transparent 80%, var(--color-mid) 100%)" }} />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="label mb-3">{t("productsDetail.ui.fullSpecifications", "Full Specifications")}</div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                {v.brand} {v.name} — {new Date().getFullYear()} {t("productsDetail.ui.model", "Model")}
              </h2>
            </div>
          </div>
           <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-[2rem] p-8" style={{ background: "rgba(0,0,0,.45)", borderColor: "rgba(16,185,129,.2)" }}>
              <div className="text-[9px] font-black tracking-widest uppercase text-accent mb-6 flex items-center gap-2"><span className="w-4 h-px bg-accent inline-block" /> {t("productsDetail.ui.performanceRange", "Performance & Range")}</div>
              {data.specsLeft.map((spec, j) => {
                const g = spec.green ?? /Range|Motor|Fast Charge|Top Speed|0 .100|100 km|Efficiency|kW|hp/.test(spec.label);
                const o = spec.gold ?? /Battery Type|Battery Capacity|Battery Chem|Drive Type|Platform|Energy Density/.test(spec.label);
                return (
                <div key={j} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-b-0 gap-3">
                  <span className="text-[11px] font-bold tracking-[.08em] uppercase text-[#9CA3AF] flex-shrink-0">{translateSpecLabel(spec.label)}</span>
                  <span className={`text-xs font-extrabold text-right ${g ? "text-accent" : o ? "text-theme" : "text-white"}`} style={spec.value === "Not Supported" ? { color: "#6B7280" } : undefined}>{spec.value}</span>
                </div>
                );
              })}
            </div>
            <div className="glass rounded-[2rem] p-8" style={{ background: "rgba(0,0,0,.45)", borderColor: "rgba(197,160,89,.2)" }}>
              <div className="text-[9px] font-black tracking-widest uppercase text-theme mb-6 flex items-center gap-2"><span className="w-4 h-px bg-theme inline-block" /> {t("productsDetail.ui.dimensionsFeatures", "Dimensions & Features")}</div>
              {data.specsRight.map((spec, j) => {
                const g = spec.green ?? /Charge|Export|V2L|Warranty/.test(spec.label);
                const o = spec.gold ?? /Dimensions|Seating?|Airbag|Audio|Ambient|Sunroof|Boot|Wheelbase/.test(spec.label);
                return (
                <div key={j} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-b-0 gap-3">
                  <span className="text-[11px] font-bold tracking-[.08em] uppercase text-[#9CA3AF] flex-shrink-0">{translateSpecLabel(spec.label)}</span>
                  <span className={`text-xs font-extrabold text-right ${g ? "text-accent" : o ? "text-theme" : "text-white"}`} style={spec.value === "Not Supported" ? { color: "#6B7280" } : undefined}>{spec.value}</span>
                </div>
                );
              })}
            </div>
          </div>
          <p className="text-[10px] text-gray-700 mt-5 text-center">{t("productsDetail.ui.specificationsDisclaimer", "Specifications shown for latest model year. Multiple trim levels available — contact us for full trim comparison.")}</p>
        </div>
      </section>

      <TrimPoster data={data} v={v} t={t} />

      {/* Legacy Trim Comparison */}
      {data.trimData && data.trimData.length > 0 && (
        <section className="hidden">
          <div className="container mx-auto px-6 md:px-12">
            <div className="mb-10">
              <div className="label mb-3">All Versions — Side by Side</div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Choose Your Trim</h2>
              <p className="text-gray-500 text-sm font-light mt-2">6 key decision factors — everything else is identical across all trims.</p>
            </div>
            <div className="overflow-x-auto pb-2 rounded-[1.5rem] border border-white/10 bg-white/[0.025]">
              <table className="w-full border-collapse min-w-[720px]">
                <thead>
                  <tr>
                    <th className="py-3.5 px-3.5 text-[10px] font-black tracking-[.15em] uppercase border-b border-white/[0.07] text-left w-[210px] text-[#4B5563]"></th>
                    {data.trimData.map((t) => (
                      <th key={t.name} className={`py-3.5 px-3.5 text-[10px] font-black tracking-[.15em] uppercase border-b border-white/[0.07] text-center ${t.rec ? "border-b-2 border-b-accent bg-accent/[0.07] rounded-t-xl text-white" : "text-[#6B7280]"}`}>
                        {t.range}<br /><span className="text-[9px] font-semibold">{t.name}</span>
                        {t.rec && <span className="block mt-1 text-[8px] font-black tracking-[.12em] bg-accent text-theme px-1.5 py-0.5 rounded inline-block">★ RECOMMENDED</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Range (CLTC)", key: "range" as const, diff: true },
                    { label: "0 – 100 km/h", key: "accel" as const, diff: true },
                    { label: "Sunroof", key: "sunroof" as const, diff: true },
                    { label: "Airbags", key: "airbags" as const, diff: true },
                    { label: "Seat Material", key: "seat" as const, diff: true },
                    { label: "Price Level", key: "fob" as const, diff: true },
                  ].map((row) => (
                    <tr key={row.label} className={row.diff ? "[&>td]:text-[#F3F4F6]" : ""}>
                      <td className={`py-2.5 px-3.5 text-[10px] font-black tracking-[.08em] uppercase text-left ${row.diff ? "text-accent border-l-2 border-l-accent pl-2.5" : "text-[#6B7280]"}`}>{row.label}</td>
                      {data.trimData!.map((t, j) => {
                        const val = t[row.key as keyof TrimItem] as string;
                        const isRec = t.rec;
                        const topRange = [...data.trimData!].sort((a, b) => parseInt(b.range) - parseInt(a.range))[0].range;
                        const isBestRange = row.key === "range" && val === topRange;
                        return (
                          <td key={j} className={`py-2.5 px-3.5 text-xs font-bold border-b border-white/[0.04] text-center align-middle ${isRec ? "bg-accent/[0.07]" : ""}`}>
                            <span style={{ color: isBestRange ? "var(--color-green)" : val === "✗ None" ? "#F87171" : isRec ? "var(--color-green)" : undefined, fontWeight: isBestRange ? 900 : 700 }}>
                              {val}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-5">
              <p className="text-[9px] sm:text-[10px] text-gray-700">
                {(data.trimNote || `* Current model year. All trims share core platform specifications. Pricing on request — varies by order volume & destination port.`).split('\n').map((line, i, arr) => (
                   <span key={i}>{line}{i < arr.length - 1 ? <br /> : null}</span>
                 ))}
              </p>
              <LocaleLink href="/contact" className="btn-primary px-5 sm:px-7 py-2.5 sm:py-3 rounded text-[10px] sm:text-xs font-black tracking-widest uppercase italic flex-shrink-0 whitespace-nowrap">
                Request Trim Pricing →
              </LocaleLink>
            </div>
          </div>
        </section>
      )}

      {data.fits.length > 0 && (
      <section className="py-12 md:py-16 bg-b">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-12"><div className="label justify-center mb-3">{t("productsDetail.ui.idealCustomerProfile", "Ideal Customer Profile")}</div><h2 className="text-2xl font-black uppercase italic tracking-tight text-white">{t("productsDetail.ui.whoShouldBuy", "Who Should Buy This Vehicle?")}</h2></div>
          <div className="grid md:grid-cols-3 gap-5">
            {data.fits.map((fit, i) => (
              <div key={i} className="rounded-[2rem] p-7 bg-white/[0.015] border border-theme/10 hover:border-accent/25 hover:bg-accent/[0.03] transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-lg flex-shrink-0" style={i % 2 === 1 ? { background: "rgba(197,160,89,.1)" } : { background: "rgba(16,185,129,.12)" }}>{fit.icon}</div>
                <h4 className="text-white font-black uppercase tracking-wider text-sm mb-3">{fit.title}</h4>
                <p className="text-gray-300 text-sm font-light leading-relaxed mb-5">{fit.desc}</p>
                <div className="text-[9px] font-black tracking-widest uppercase" style={{ color: i % 2 === 1 ? "var(--color-gold)" : "var(--color-green)" }}>{fit.accent}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* CTA + Related — removed to avoid duplication with global footer */}
    </>
  );
}
