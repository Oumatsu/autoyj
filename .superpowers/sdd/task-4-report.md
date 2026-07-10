# Task 4 Report: Refactor Insights Articles to Dynamic Routing

## 1. Overview of Changes
We have successfully migrated the static insights article pages into a single dynamic routing page `app/insights/[slug]/page.tsx` that fetches content on the fly from the Cloudflare Worker `/api/portal/public/insights/:slug` endpoint (which in turn queries Feishu Bitable backend). Additionally, we updated `app/insights/page.tsx` to fetch the article metadata dynamically and deleted all 30 static subdirectories.

## 2. File Modifed & Created
- **Created**: [app/insights/[slug]/page.tsx](file:///Users/a12/projects/autoyj/app/insights/%5Bslug%5D/page.tsx)
- **Modified**: [app/insights/page.tsx](file:///Users/a12/projects/autoyj/app/insights/page.tsx)
- **Deleted**: 30 static subdirectories under `app/insights/` (e.g. `app/insights/china-zero-km-export-ban-2026/`, etc.)
- **Preserved**: `app/insights/page.tsx` and `app/insights/articles.json`

## 3. Implementation Details
### 3.1 Dynamic Detail Route (`app/insights/[slug]/page.tsx`)
- Leveraged `use(params)` to resolve dynamic route parameters in a way compatible with Next.js client routing.
- Fetched the requested article details from `/api/portal/public/insights/${slug}`.
- Sanitized and rendered article content using `dangerouslySetInnerHTML={{ __html: article.content.replace(/images\//g, \`/insights/images/\${article.slug}/\`) }}` to rewrite relative image paths.
- Re-implemented the exact original layout styling, tags, and sidebar widgets (checks, consulatations, CTA).

### 3.2 Dynamic Landing Page (`app/insights/page.tsx`)
- Replaced the hardcoded `articles` metadata array with dynamic state `articles` populated by fetching from `/api/portal/public/insights` on mount.
- Preserved 100% of the sorting ("Recommended", "Newest", "Oldest"), category filtering, counts, and pagination logic without visual regression.

### 3.3 Static Pages Cleanup
- Deleted all 30 subdirectories under `app/insights/` once verified.

## 4. Verification Details
- **Build Status**: Built successfully via `vinext build` with no warnings or type errors.
- **Visual Validation**: Opened `http://localhost:3000/insights/china-zero-km-export-ban-2026` inside Chrome DevTools, verified it loads correctly from the API, and captured a screenshot at `/Users/a12/projects/autoyj/screenshot.png`.
