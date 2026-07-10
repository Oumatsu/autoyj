# Academy Lessons Dynamic Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate static academy lesson pages and category pages to dynamic routing fetched from `/api/portal/public/academy`.

**Architecture:** Create a client-side dynamic route `app/academy/[category]/[slug]/page.tsx` that fetches lesson content on mount. Refactor `app/academy/page.tsx` and the three category landing pages to fetch lesson data dynamically. Clean up static lesson subdirectories.

**Tech Stack:** Next.js / Vinext, React, Client-side fetching.

## Global Constraints
- Do not use TailwindCSS unless requested (retain existing CSS styles).
- Use bun instead of npm or npx.
- Maintain identical styling, headers, metadata formatting, and widgets.

---

### Task 1: Create Dynamic Lesson Page Route
**Files:**
- Create: `app/academy/[category]/[slug]/page.tsx`

- [ ] **Step 1: Write the dynamic route component**
  Create the dynamic route file `app/academy/[category]/[slug]/page.tsx` as a Client Component ("use client"). Use `React.use()` to retrieve dynamic `params` (category and slug). Fetch the lesson data from `/api/portal/public/academy/${category}/${slug}`. Also fetch `/api/portal/public/academy` to retrieve sibling lessons of the same category for the "More" sidebar widget.
- [ ] **Step 2: Add styling and render helper**
  Ensure styling matches the original static layout perfectly. Render content using `dangerouslySetInnerHTML={{ __html: data.content }}`. Add loading and 404 (Not Found) state handlers.
- [ ] **Step 3: Verify basic dynamic page rendering**
  Temporarily check build or compatibility.

### Task 2: Refactor Academy Landing Page
**Files:**
- Modify: `app/academy/page.tsx`

- [ ] **Step 1: Replace static lists with dynamic API data**
  Import `useEffect` and `useState` to fetch the index from `/api/portal/public/academy` on mount. Populate `fundamentalsArticles`, `playbookArticles`, `workshopArticles`, and `vaultItems` dynamically.
- [ ] **Step 2: Maintain scroll tabs and visual design**
  Ensure standard page sections, headers, and tabs function normally with the dynamic data.

### Task 3: Refactor Category Landing Pages
**Files:**
- Modify: `app/academy/ev-fundamentals/page.tsx`
- Modify: `app/academy/dealer-playbook/page.tsx`
- Modify: `app/academy/technical-workshop/page.tsx`

- [ ] **Step 1: Update EV Fundamentals page**
  Refactor `app/academy/ev-fundamentals/page.tsx` to fetch the full index from `/api/portal/public/academy` on mount and filter for `fundamentals` category.
- [ ] **Step 2: Update Dealer Playbook page**
  Refactor `app/academy/dealer-playbook/page.tsx` to fetch the full index from `/api/portal/public/academy` on mount and filter for `playbook` category.
- [ ] **Step 3: Update Technical Workshop page**
  Refactor `app/academy/technical-workshop/page.tsx` to fetch the full index from `/api/portal/public/academy` on mount and filter for `workshop` category.

### Task 4: Static Cleanup
**Files:**
- Delete: static subdirectories inside `app/academy/ev-fundamentals/`, `app/academy/dealer-playbook/`, `app/academy/technical-workshop/`

- [ ] **Step 1: Delete all static directories except category page.tsx**
  Remove static subfolders using git/file tools.
- [ ] **Step 2: Run build validation**
  Run `bun run build` to verify clean build without static lessons.
