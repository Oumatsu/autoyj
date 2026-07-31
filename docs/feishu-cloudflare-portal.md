# Youguard Feishu + Cloudflare Portal

This branch wires the project into the target split:

- Frontend: Cloudflare Pages/Workers through the existing Vinext app.
- Middle layer: `/api/portal/*` in `worker/portal.ts`, running inside Cloudflare Worker.
- Backend: Feishu Base / Lark Base as the business database and internal operating console.

## First-Phase Flow

1. User signs in at `/portal` with an email and access code stored in Feishu Base.
2. Worker checks `Internal Users` first, then `External Accounts`, and sets an HTTP-only portal session cookie.
3. Portal reads model specs from `Vehicle Models` and live supply from `Vehicles`.
   - External users first see a model-level list: brand, model, segment, in-stock quantity, preorder availability, and FOB price range.
   - Clicking a model opens merged source rows by year, trim, external color, interior color, configuration, supply type, lead time, location, and FOB price.
4. Price visibility is enforced in Worker:
   - `hidden`: stock only, no price returned.
   - `partner`: partner cooperation price returned.
   - `vip`: VIP/customer price returned when present.
5. Customer creates an inquiry. Worker writes:
   - one row in `Inquiries`
   - one row in `Negotiations`
6. Staff works inside Feishu Base and creates quote rows in `Quotes`.
7. Customer can counter or accept a quote from `/portal`.
8. Accepting a quote creates a draft row in `Orders`.

## Required Feishu Tables

The setup script creates these tables:

- `Internal Users`: company staff accounts, roles, permissions, and commission rates.
- `External Accounts`: partner/customer accounts, company details, and price permissions.
- `Vehicle Models`: model/version master table. It stores model identity, guide price, status, image/source metadata, and review notes.
- `Vehicle Model Specs`: full parameter detail table. It stores category/spec/value rows for complete Dongchedi-style configuration data.
- `Vehicles`: supply/inventory resources. It describes whether that model has stock, colors, supplier, price, and lead time.
- `Inquiries`
- `Quotes`
- `Negotiations`
- `Orders`

Field names are intentionally stable English API names, for example `User ID`, `Account ID`, `Model ID`, `Vehicle ID`, `Partner Price`, and `Quote No`. Staff can create Chinese views in Feishu without changing API field names.

The localhost quick-login buttons remain for development only. They simulate real account sessions:

- `Admin` and `Sales` simulate `Internal Users`.
- `Partner` and `Customer` simulate `External Accounts`.

In production, users do not choose a role. The role and permissions come from the account row after login.

`Vehicle Models` and `Vehicles` are deliberately separated:

- `Vehicle Models` stores stable model identity and metadata: brand, model, year, version, China guide price, source, image, status, and review notes.
- `Vehicle Model Specs` stores full configuration facts as rows: model ID, category, spec name, spec value, unit, visibility level, sort order, confidence, source, and notes. This lets AI add new parameters as data rows instead of changing table schema.
- `Vehicles` stores supply facts: resource ID, model ID, external display color, supplier original color, configuration, supplier, recorder, location, stock quantity, preorder lead time, FOB prices, cost, price validity, and listing status.

External color and internal color are separate:

- External color fields are standardized for customers and partners: `Exterior Color` and `Interior Color`.
- Internal color fields preserve supplier source data: `Supplier Exterior Color`, `Supplier Interior Color`, `Color Code`, `Color Notes`, and `Color Confirmed`.

The first-phase portal does not expose export status on the customer-facing inventory flow. The current business focus is Ethiopia, so the external inventory experience prioritizes supply availability and FOB price. Export/compliance fields can be reintroduced later when multi-market rules matter.

External supply rows are merged for readability. If these customer-visible fields are the same, the portal shows one row and sums quantity:

`Brand + Model + Year + Trim + Exterior Color + Interior Color + Configuration + Supply Type + Lead Time + Location + FOB Price`

Internal Feishu rows remain separate so staff can still trace supplier, recorder, cost, files, and private notes.

The portal is backward-compatible while migrating. If `FEISHU_TABLE_VEHICLE_MODELS` is not configured, Worker derives a basic model library from `Vehicles` so the UI still works.

## Create The Feishu Base

The local machine needs `lark-cli` signed in.

```bash
npm run setup:feishu
```

The script writes `.dev.vars.feishu.example` with the generated Base token, table IDs, and a new `PORTAL_SESSION_SECRET`.

Copy those values into `.dev.vars`, then fill:

```env
FEISHU_APP_ID=
FEISHU_APP_SECRET=
```

If `lark-cli` is already configured locally, the app id, Base ids, and `PORTAL_SESSION_SECRET` can be prepared automatically:

```bash
npm run sync:feishu-env
```

By default this writes `.dev.vars.local`, which is ignored by Git. For the current Vinext/Cloudflare local dev flow, write the values into `.dev.vars` explicitly:

```bash
npm run sync:feishu-env -- --target .dev.vars
```

`lark-cli config show` masks `appSecret`, so the sync script will not invent or copy `****` into the env file. Add the real `FEISHU_APP_SECRET` once from Feishu Developer Console, or re-run `lark-cli config init --app-id <id> --app-secret-stdin` if you want to re-bind the local CLI. `PORTAL_SESSION_SECRET` is not a Feishu value; it is generated locally and used only to sign the portal session cookie.

For Cloudflare deployment, set the same values as Worker vars/secrets.

## Cloudflare Variables

Required:

```env
FEISHU_APP_ID=
FEISHU_APP_SECRET=
FEISHU_BASE_APP_TOKEN=
FEISHU_TABLE_INTERNAL_USERS=
FEISHU_TABLE_EXTERNAL_ACCOUNTS=
FEISHU_TABLE_CUSTOMERS=
FEISHU_TABLE_VEHICLE_MODELS=
FEISHU_TABLE_VEHICLE_MODEL_SPECS=
FEISHU_TABLE_VEHICLES=
FEISHU_TABLE_INQUIRIES=
FEISHU_TABLE_QUOTES=
FEISHU_TABLE_NEGOTIATIONS=
FEISHU_TABLE_ORDERS=
FEISHU_TABLE_ARTICLES=
FEISHU_TABLE_ACADEMY_LESSONS=
FEISHU_TABLE_ACADEMY_VAULT=
PORTAL_SESSION_SECRET=
PORTAL_COOKIE_NAME=youguard_portal
```

`FEISHU_APP_SECRET` and `PORTAL_SESSION_SECRET` should be stored as secrets in Cloudflare.

## Portal Endpoints

- `POST /api/portal/session`
- `DELETE /api/portal/session`
- `POST /api/portal/dev-session` local development only
- `GET /api/portal/bootstrap`
- `POST /api/portal/inquiries`
- `POST /api/portal/quotes/:quoteNo/counter`
- `POST /api/portal/quotes/:quoteNo/accept`

The browser never calls Feishu directly. It always calls Cloudflare Worker first, and Worker filters fields before returning data.
