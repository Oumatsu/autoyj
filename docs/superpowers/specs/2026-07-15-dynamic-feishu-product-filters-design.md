# Dynamic Feishu Product Filters Design

## Goal

Make every product-category filter derive from real `Vehicle Models` values and match products correctly, without changing any Feishu Base schema or record.

## Data Contract

`GET /api/portal/public/products` keeps presentation `tags` unchanged and adds a separate `filterData` object built from existing Base fields:

- `vehicleClasses`: `Vehicle Class`, falling back to `Segment` only when empty.
- `batteryChemistries`: atomic values parsed from `Battery Chemistry Auto`.
- `rangeKm`: `CLTC Range Min KM Auto` and `CLTC Range Max KM Auto`.
- `priceUsd`: `Guide Price Min USD Auto` and `Guide Price Max USD Auto`.
- `steeringSetups`: `Steering Setup`.
- `powertrainTypes`: `Powertrain Type`.
- `inventoryStatuses`: `Inventory Status`.
- `voltagePlatforms`: `Voltage Platform (V)`, formatted as a voltage label.
- `v2lAvailability`: `V2L Availability`.
- `drivetrains`: `Drivetrain Display Auto`.
- `groundClearanceMm`: `Ground Clearance (mm)`.

Unknown fields remain empty and never produce guessed filter values.

## Frontend Behavior

Each category page builds its visible filter groups after API products arrive. Categorical options are distinct values present in that category. Numeric range and price options keep business-friendly ranges, but an option is shown only when at least one product interval overlaps it.

Product interval `[productMin, productMax]` matches selected interval `[filterMin, filterMax]` when:

```text
max(productMin, filterMin) <= min(productMax, filterMax)
```

Bounds are inclusive. Multiple selected options in one group use OR. Different groups use AND. Search remains an additional AND condition.

## Category Groups

- Revenue King: vehicle class, battery chemistry, range, price, steering setup, inventory status.
- Elite Flagship: vehicle class, battery chemistry, range, price, voltage platform, powertrain type, inventory status.
- Utility Pro: vehicle class, battery chemistry, range, price, drivetrain, V2L availability, high-clearance range, inventory status.

Groups and options with no matching product are omitted. Presentation tags remain card-only and are not used for filtering.

## Safety

Implementation reads existing Base fields through the current Worker request. It does not call Base create, update, upsert, delete, field, table, or view mutation APIs.

## Verification

- Unit-test Base field normalization and interval overlap.
- Unit-test same-group OR and cross-group AND behavior.
- Regression-test all three pages no longer call `v.tags.some(...)` for filtering.
- Run `npm test`, `npm run check`, and `npm run build`.
