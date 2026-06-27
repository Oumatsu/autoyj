# autoYJ Feishu + Cloudflare Portal

This branch wires the project into the target split:

- Frontend: Cloudflare Pages/Workers through the existing Vinext app.
- Middle layer: `/api/portal/*` in `worker/portal.ts`, running inside Cloudflare Worker.
- Backend: Feishu Base / Lark Base as the business database and internal operating console.

## First-Phase Flow

1. Customer signs in at `/portal` with an email and access code stored in Feishu Base.
2. Worker validates the customer against the `Customers` table and sets an HTTP-only portal session cookie.
3. Portal reads inventory from `Vehicles`.
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

- `Customers`
- `Vehicles`
- `Inquiries`
- `Quotes`
- `Negotiations`
- `Orders`

Field names are intentionally stable English API names, for example `Customer ID`, `Vehicle ID`, `Partner Price`, and `Quote No`. Staff can create Chinese views in Feishu without changing API field names.

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
FEISHU_TABLE_CUSTOMERS=
FEISHU_TABLE_VEHICLES=
FEISHU_TABLE_INQUIRIES=
FEISHU_TABLE_QUOTES=
FEISHU_TABLE_NEGOTIATIONS=
FEISHU_TABLE_ORDERS=
PORTAL_SESSION_SECRET=
PORTAL_COOKIE_NAME=autoyj_portal
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
