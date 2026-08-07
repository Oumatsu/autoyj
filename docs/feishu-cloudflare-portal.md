# Youguard Feishu + Cloudflare Portal

This branch wires the project into the target split:

- Frontend: Cloudflare Pages/Workers through the existing Vinext app.
- Middle layer: `/api/portal/*` in `server/api/portal.ts`, running inside the Cloudflare Worker.
- Backend: Cloudflare D1 is the request-time system of record; Feishu Base / Lark Base is read only by the Cron sync job in `server/jobs/feishu-sync.ts`.

## First-Phase Flow

1. User signs in at `/portal` with an email and access code stored in D1 after Feishu synchronization.
2. Worker checks D1 user/account rows and sets an HTTP-only portal session cookie.
3. Portal reads model specs from D1 tables populated by the scheduled Feishu sync.
   - External users first see a model-level list: brand, model, segment, in-stock quantity, preorder availability, and FOB price range.
   - Clicking a model opens merged source rows by year, trim, external color, interior color, configuration, supply type, lead time, location, and FOB price.
4. Price visibility is enforced in Worker:
   - `hidden`: stock only, no price returned.
   - `partner`: partner cooperation price returned.
   - `vip`: VIP/customer price returned when present.
5. Customer creates an inquiry. Worker writes the inquiry and participant records directly to D1:
   - one row in `Inquiries`
6. Portal users read and update inquiry, negotiation, quote, and order records in D1.
7. Accepting a quote creates a draft order in D1.

## Feishu Source Tables

The scheduled sync reads these Feishu tables and replaces their corresponding D1 snapshots:

- `Vehicle Models`: model identity and metadata.
- `Vehicle Trim Configurations`: complete trim/configuration rows.
- `Vehicles`: supplier inventory and pricing.
- `Articles`: Insights content.
- `Academy Lessons`: Academy lesson content.
- `Academy Vault`: downloadable Academy resources.

The portal never fetches Feishu at request time. Empty or malformed source snapshots fail the
relevant sync and preserve the existing D1 data.

The localhost quick-login buttons remain for development only. They use the same D1-backed session
endpoint as production:

- `Admin` and `Sales` are internal users.
- `Partner` and `Customer` are external users.

In production, users do not choose a role. The role and permissions come from the account row after login.

`Vehicle Models`, `Vehicle Trim Configurations`, and `Vehicles` are deliberately separated:

- `Vehicle Models` stores stable model identity and metadata: brand, model, year, version, China guide price, source, image, status, and review notes.
- `Vehicle Trim Configurations` stores complete trim facts as rows and keeps every source field available to the D1 portal.
- `Vehicles` stores supply facts: resource ID, model ID, external display color, supplier original color, configuration, supplier, recorder, location, stock quantity, preorder lead time, FOB prices, cost, price validity, and listing status.
- The admin model profile uses verified trim rows when available; otherwise it derives distinct trims from `Vehicles.细分型号`. The `Vehicle Models.version` marketing label is never presented as a trim.

External color and internal color are separate:

- External color fields are standardized for customers and partners: `Exterior Color` and `Interior Color`.
- Internal color fields preserve supplier source data: `Supplier Exterior Color`, `Supplier Interior Color`, `Color Code`, `Color Notes`, and `Color Confirmed`.

The first-phase portal does not expose export status on the customer-facing inventory flow. The current business focus is Ethiopia, so the external inventory experience prioritizes supply availability and FOB price. Export/compliance fields can be reintroduced later when multi-market rules matter.

External supply rows are merged for readability. If these customer-visible fields are the same, the portal shows one row and sums quantity:

`Brand + Model + Year + Trim + Exterior Color + Interior Color + Configuration + Supply Type + Lead Time + Location + FOB Price`

Internal D1 rows remain separate so staff can still trace supplier, recorder, cost, files, and private notes.

The portal is backward-compatible while migrating. If `FEISHU_TABLE_VEHICLE_MODELS` is not configured, Worker derives a basic model library from `Vehicles` so the UI still works.

## Configure Feishu Sync

The local machine needs `lark-cli` signed in when creating or inspecting the Feishu Base.

```bash
bun run setup:feishu
```

The setup script writes an ignored local env file with the generated Base token and table IDs.

If `lark-cli` is already configured locally, the app id, Base ids, and `PORTAL_SESSION_SECRET` can be prepared automatically:

```bash
bun run sync:feishu-env
```

By default this writes `.dev.vars.local`, which is ignored by Git. For the current Vinext/Cloudflare local dev flow, write the values into `.dev.vars` explicitly:

```bash
bun run sync:feishu-env -- --target .dev.vars
```

`lark-cli config show` masks `appSecret`, so the sync script will not invent or copy `****` into the env file. Add the real `FEISHU_APP_SECRET` once from Feishu Developer Console, or re-run `lark-cli config init --app-id <id> --app-secret-stdin` if you want to re-bind the local CLI. `PORTAL_SESSION_SECRET` is not a Feishu value; it is generated locally and used only to sign the portal session cookie.

For Cloudflare deployment, configure the Feishu values used by the scheduled Worker and store
`FEISHU_APP_SECRET` and `PORTAL_SESSION_SECRET` as secrets.

## Cloudflare Variables

Required for the scheduled sync:

```env
FEISHU_APP_ID=
FEISHU_APP_SECRET=
FEISHU_BASE_APP_TOKEN=
FEISHU_TABLE_VEHICLE_MODELS=
FEISHU_VIEW_PROFILES=
FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS=
FEISHU_VIEW_VEHICLE_TRIM_CONFIGURATIONS=
FEISHU_TABLE_VEHICLES=
FEISHU_TABLE_ARTICLES=
FEISHU_TABLE_ACADEMY_LESSONS=
FEISHU_TABLE_ACADEMY_VAULT=
PORTAL_SESSION_SECRET=
PORTAL_COOKIE_NAME=youguard_portal
```

`PORTAL_DB` is a D1 binding. `FEISHU_APP_SECRET` and `PORTAL_SESSION_SECRET` should be stored as
Cloudflare secrets rather than committed vars.

## Portal Endpoints

- `POST /api/portal/session`
- `DELETE /api/portal/session`
- `POST /api/portal/dev-session` local development only
- `GET /api/portal/bootstrap`
- `GET /api/portal/catalog`
- `GET /api/portal/vehicles`
- `GET /api/portal/vehicle-models`
- `POST /api/portal/inquiries`
- `POST /api/portal/inquiries/:inquiryNo/notes`
- `PATCH /api/portal/inquiries/:inquiryNo/status`
- `POST /api/portal/quotes/:quoteNo/counter`
- `POST /api/portal/quotes/:quoteNo/accept`
- `GET /api/portal/public/products`
- `GET /api/portal/public/insights`
- `GET /api/portal/public/academy`

The browser never calls Feishu directly. It always calls the Cloudflare Worker, which reads and
writes D1 and filters fields before returning data.
