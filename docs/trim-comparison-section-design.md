# Trim Comparison Section

## Goal

Replace the old trim block with a source-aware configuration section. The page must support any number of trims per model and must not present unverified trim equipment as confirmed data.

## Frontend Shape

The product detail page reads `trimComparison` from the public product API.

```ts
type TrimComparison = {
  status: "Verified" | "Partial" | "TBC" | string;
  trims: Trim[];
  commonFeatures: FeatureGroup[];
  sourceSummary?: string;
  lastVerifiedAt?: string;
};
```

Each trim is rendered in order, from entry trim to highest trim. Higher trims display `addedFeatures` and `upgradedFeatures` as the visible difference from the lower trim. Shared equipment is rendered only once in the bottom `commonFeatures` block.

## Base Model

Use a child table for trim rows and a few summary fields on `Vehicle Models`.

Child table: `Vehicle Trim Configurations`

- `Model ID`
- `Vehicle Model`
- `Trim Name`
- `Trim Order`
- `Trim Price Display`: currency/number, RMB amount only; frontend formats currency.
- `Range Display`: number, CLTC range in km only; frontend appends `km CLTC`.
- `Battery Capacity kWh`: number only; frontend appends `kWh`.
- `Battery Chemistry`: select, chemistry only; frontend appends `battery`.
- `Drivetrain Display`: select, normalized drivetrain option.
- `Motor Power kW`: number only; frontend appends `kW`.
- `Motor Torque N-m`: number only; frontend appends `N-m`.
- `DC Fast Charge Supported`: checkbox.
- `DC Fast Charge Time Hours`: number only; frontend appends `h`.
- `DC Fast Charge Min Percent`: number only.
- `DC Fast Charge Max Percent`: number only.
- `Base Spec Summary JSON`
- `Added Features JSON`
- `Upgraded Features JSON`
- `Recommended`
- `Source URL`
- `Source Status`
- `Last Verified At`
- `Notes`

Vehicle Models summary fields:

- `Trim Section Status`
- `Common Features JSON`
- `Trim Source Summary`
- `Trim Last Verified At`

Legacy rollback fields currently retained:

- `Legacy Trim Price Display`
- `Legacy Range Display`
- `Legacy Battery Display`
- `Legacy Drivetrain Display`
- `Legacy Motor Display`
- `Legacy Charging Display`

These six legacy fields can be deleted after production has been verified against the structured fields.

## API Fallback Order

1. Read `Vehicle Trim Configurations` when `FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS` is configured.
2. Fall back to the legacy `Trim Data JSON` only as a TBC display bridge.

## Data Rule

Only source-backed data should be marked `Verified`. Missing or unclear data remains `TBC`.
