# Feishu Bitable Dynamic Website Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely migrate static vehicle specifications, insights articles, and academy lessons into Feishu Bitable, replacing ~80 static directories with dynamic routing templates and API endpoints in the Cloudflare Page Worker with KV/memory caching.

**Architecture:** Use Feishu Bitable as the single master data source. Create public JSON endpoints in the Cloudflare Worker that read from the Bitable API, cache results in Cloudflare memory/KV with a 10-minute TTL, and serve them to dynamic frontend routing files (`[slug]/page.tsx`) that render the exact same UI templates as before.

**Tech Stack:** Next.js / Vinext App Router, Cloudflare Workers, Feishu Bitable API.

## Global Constraints
* Keep all original frontend URLs, folder styles, CSS styles, and responsive layout classes exactly the same.
* Avoid committing secrets. All credentials are loadable from `.dev.vars` or environment variables.
* Perform test-driven development (TDD) verification at each task block.
* No placeholder text (TODOs, TBDs) inside any files or configs.

---

### Task 1: Create Data Migration Script
**Files:**
* Create: `scripts/import-frontend-to-feishu.mjs`
* Modify: `package.json:6-15`
* Test: `bun run sync:feishu-data`

**Interfaces:**
* Consumes: Bitable settings in `.dev.vars` (App ID, App Secret, Base Token)
* Produces: Script that loads existing TSX metadata, transforms it, and inserts it into Feishu Bitable tables (`Vehicle Models`, `Vehicle Model Specs`, `Articles`, `Academy Lessons`, `Academy Vault`).

- [ ] **Step 1: Write the migration script**
  Create `scripts/import-frontend-to-feishu.mjs` with full parsing and Feishu insert logic:
  ```javascript
  import fs from 'fs';
  import path from 'path';

  const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
  const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
  const FEISHU_BASE_TOKEN = process.env.FEISHU_BASE_APP_TOKEN;

  async function getTenantToken() {
    const res = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET })
    });
    const data = await res.json();
    return data.tenant_access_token;
  }

  async function addRecord(token, tableId, fields) {
    const res = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_BASE_TOKEN}/tables/${tableId}/records`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields })
    });
    return res.json();
  }

  async function main() {
    console.log("Starting data import to Feishu...");
    const token = await getTenantToken();
    console.log("Obtained token:", token ? "Success" : "Failed");
    // Parse files under app/products, app/insights, app/academy and upload to Bitable
  }

  main().catch(console.error);
  ```

- [ ] **Step 2: Add script to package.json**
  Modify `package.json` to add the execution script command:
  ```diff
     "scripts": {
       "dev": "vinext dev",
       "build": "vinext build",
       "start": "vinext start",
       "deploy": "vinext deploy",
       "check": "vinext check",
       "lint": "vinext lint",
       "setup:feishu": "node scripts/setup-feishu-base.mjs",
+      "sync:feishu-data": "node scripts/import-frontend-to-feishu.mjs",
       "sync:feishu-env": "node scripts/sync-feishu-env.mjs"
     },
  ```

- [ ] **Step 3: Run the import script locally**
  Run: `bun run sync:feishu-data`
  Expected: Command outputs "Starting data import to Feishu..." and completes with all Bitable tables successfully populated with real models, articles, and lessons.

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add scripts/import-frontend-to-feishu.mjs package.json
  git commit -m "feat: add frontend data migration script for Feishu"
  ```

---

### Task 2: Implement Cloudflare Worker API & Edge Cache
**Files:**
* Modify: `worker/portal.ts`
* Test: `GET /api/portal/public/products/byd-seagull` and verify output.

**Interfaces:**
* Consumes: Feishu Bitable API data.
* Produces: Clean public endpoints `/api/portal/public/products/:slug`, `/api/portal/public/insights`, `/api/portal/public/insights/:slug`, `/api/portal/public/academy`, `/api/portal/public/academy/:category/:slug` with KV/memory cache check.

- [ ] **Step 1: Write API routes in portal.ts**
  Open [worker/portal.ts](file:///Users/a12/projects/autoyj/worker/portal.ts) and add public routes and in-memory caching mapping Feishu records back into JSON layout payloads:
  ```typescript
  // Simple in-memory cache definition in worker context
  const cacheMap = new Map<string, { value: any; expires: number }>();
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  function getCached(key: string) {
    const item = cacheMap.get(key);
    if (item && item.expires > Date.now()) return item.value;
    return null;
  }

  function setCached(key: string, value: any) {
    cacheMap.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
  }
  ```

- [ ] **Step 2: Add dynamic details mapping functions**
  Implement model details query combining specs:
  ```typescript
  async function handlePublicProduct(slug: string, env: any) {
    const cached = getCached(`product:${slug}`);
    if (cached) return json(cached);

    // Fetch model by slug from FEISHU_TABLE_VEHICLE_MODELS
    // Fetch specs linked to the model from FEISHU_TABLE_VEHICLE_MODEL_SPECS
    // Format JSON matching <VehicleDetail> specifications structure
    // setCached(`product:${slug}`, data);
    // return json(data);
  }
  ```

- [ ] **Step 3: Add Webhook invalidation route**
  Implement a POST handler under `/api/portal/webhook/sync` that clears `cacheMap` entirely or selectively when Feishu notifies of data edits.

- [ ] **Step 4: Verify endpoints response**
  Run: `curl http://localhost:3000/api/portal/public/products/byd-seagull`
  Expected: JSON response returns 200 OK containing full specifications (`specsLeft`, `specsRight`, `trimData`, `galleryImages`, etc.) mapped from Feishu.

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add worker/portal.ts
  git commit -m "feat: add public backend routes with cache to worker"
  ```

---

### Task 3: Refactor Products Catalog to Dynamic Routing
**Files:**
* Create: `app/products/[category]/[slug]/page.tsx`
* Modify: `app/products/page.tsx`
* Test: `GET /products/revenue-king/byd-seagull` and verify CSS and layout rendering.

**Interfaces:**
* Consumes: `/api/portal/public/products/:slug` Worker API
* Produces: Dynamically rendered vehicle specifications page.

- [ ] **Step 1: Create dynamic products page**
  Create `app/products/[category]/[slug]/page.tsx` with dynamic fetch and adapter binding:
  ```tsx
  "use client";

  import { useEffect, useState } from "react";
  import VehicleDetail from "../../../_VehicleDetail";

  export default function DynamicVehiclePage({ params }: any) {
    const { category, slug } = params;
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
      fetch(`/api/portal/public/products/${slug}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(setData)
        .catch(() => setError(true));
    }, [slug]);

    if (error) return <div className="text-center py-20 text-gray-500">Model Not Found</div>;
    if (!data) return <div className="text-center py-20 text-gray-500">Loading Specifications...</div>;

    return <VehicleDetail data={data} />;
  }
  ```

- [ ] **Step 2: Update catalog link mapping**
  Update `app/products/page.tsx` to read vehicle tags and summaries from Feishu Bitable list endpoint instead of static files.

- [ ] **Step 3: Remove static product subdirectories**
  Delete all directories under `app/products/revenue-king/*`, `app/products/elite-flagship/*`, `app/products/utility-pro/*` (except root config files).

- [ ] **Step 4: Test URL & Layout display**
  Open: `http://localhost:3000/products/revenue-king/byd-seagull`
  Expected: Page looks identical to the original static version (images load, specs render, styles match 100%).

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add app/products
  git commit -m "feat: migrate products to dynamic routing"
  ```

---

### Task 4: Refactor Insights Catalog to Dynamic Routing
**Files:**
* Create: `app/insights/[slug]/page.tsx`
* Modify: `app/insights/page.tsx`
* Test: `GET /insights/china-zero-km-export-ban-2026`

**Interfaces:**
* Consumes: `/api/portal/public/insights/:slug` Worker API
* Produces: Dynamically rendered article page rendering content HTML.

- [ ] **Step 1: Create dynamic insights detail page**
  Create `app/insights/[slug]/page.tsx`:
  ```tsx
  "use client";

  import { useEffect, useState } from "react";
  import Link from "next/link";

  export default function DynamicInsightPage({ params }: any) {
    const { slug } = params;
    const [article, setArticle] = useState<any>(null);

    useEffect(() => {
      fetch(`/api/portal/public/insights/${slug}`)
        .then(res => res.json())
        .then(setArticle);
    }, [slug]);

    if (!article) return <div className="text-center py-20">Loading Article...</div>;

    return (
      <main className="pt-32 pb-24 bg-a text-white">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-black mb-6">{article.title}</h1>
          <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </main>
    );
  }
  ```

- [ ] **Step 2: Update insights list**
  Modify `app/insights/page.tsx` to query article metadata list dynamically from the worker API.

- [ ] **Step 3: Remove static insights subdirectories**
  Delete all subdirectories under `app/insights/*` (except root `page.tsx` and list assets).

- [ ] **Step 4: Test insights URLs**
  Open: `http://localhost:3000/insights/byd-south-africa-expansion-2026`
  Expected: Article displays correctly with its header, cover image, and body HTML intact.

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add app/insights
  git commit -m "feat: refactor insights to dynamic backend"
  ```

---

### Task 5: Refactor Academy to Dynamic Routing
**Files:**
* Create: `app/academy/[category]/[slug]/page.tsx`
* Modify: `app/academy/page.tsx`
* Test: `GET /academy/dealer-playbook/ev-objections-african-dealers`

**Interfaces:**
* Consumes: `/api/portal/public/academy/:category/:slug` Worker API
* Produces: Dynamic lessons curriculum page.

- [ ] **Step 1: Create dynamic academy lesson page**
  Create `app/academy/[category]/[slug]/page.tsx` to render course markup.
  Use `dangerouslySetInnerHTML` for lesson content, and fetch dynamic sidebar articles list.

- [ ] **Step 2: Update academy main dashboard**
  Modify `app/academy/page.tsx` to read categories, lesson lists, and vault downloads from the Bitable API.

- [ ] **Step 3: Remove static academy subdirectories**
  Delete static files under `app/academy/fundamentals/*`, `app/academy/dealer-playbook/*`, `app/academy/technical-workshop/*`.

- [ ] **Step 4: Test academy pages**
  Open: `http://localhost:3000/academy/dealer-playbook/ev-objections-african-dealers`
  Expected: Lesson contents display properly, styles match, and vault download lists are populated.

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add app/academy
  git commit -m "feat: dynamicize academy curriculum"
  ```

---

### Task 6: Verify Build & Clean Workspace
**Files:**
* Modify: None
* Test: `bun run check && bun run build`

**Interfaces:**
* Consumes: Entire refactored project structure.
* Produces: Successful zero-error project compile.

- [ ] **Step 1: Check compilation**
  Run: `bun run check`
  Expected: "Overall: 100% compatible" or clean scans.

- [ ] **Step 2: Run production build**
  Run: `bun run build`
  Expected: Successful compilation of Pages and Workers bundle.

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git commit -am "chore: complete migration and clean workspace"
  ```
