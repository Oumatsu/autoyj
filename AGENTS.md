## Project Iron Laws (项目铁则)

All AI agents and contributors must strictly enforce the following engineering iron laws:

1. **Screenshot-less Development Mode (无截图模式开发)**:
   - Do NOT use screenshots, visual snapshots, or OCR to evaluate UI layouts or test regressions.
   - Verify UI correctness programmatically through semantic DOM assertions (`page.getByRole()`, `page.getByLabel()`), network interception, accessibility tree scans (`@axe-core/playwright`), and console zero-error traps.
   - Screenshots and traces are permitted ONLY as post-mortem forensic attachments on failure (`screenshot: "only-on-failure"`).

2. **AI-Native Engineering & Eval-First TDD (AI 原生工程体系)**:
   - Every feature or bug fix must be driven by automated tests (Eval-Driven Development).
   - Zero-Human-Check: No pull request or push may rely on manual clicking or human inspection for correctness.
   - Business math (pricing, trade terms, volume discounts) and workflow state machines must reside in pure domain modules (`lib/`) and be covered by exhaustive unit tests.

3. **Playwright Standard Best Practices (Playwright 工业级准则)**:
   - Use semantic, user-facing locators (`getByRole`, `getByText`, `getByLabel`, `[data-testid]`). Avoid brittle CSS paths or raw XPaths.
   - Implement explicit lifecycle settling (`domcontentloaded` + locator visibility) and cookie/context isolation across multi-lingual and multi-role journeys.
   - Full specification: see `docs/agents/engineering-standards.md`.

4. **4-Tier Test Suite & Local Pre-Push Gate (四层测试金字塔与本地门禁)**:
   - Tier 1: Domain Unit Tests (`tests/unit/domain/`)
   - Tier 2: Component Interaction Tests (`tests/component/`)
   - Tier 3: Isolated Integration & API Tests (`tests/integration/`)
   - Tier 4: Comprehensive Playwright E2E (`tests/e2e/`)
   - All code pushed to remote must pass the local `.husky/pre-push` gate (`bun run pre-push` covering Lint, D1 Init, Tier 1-3, W3C, E2E, and Google Lighthouse 100/100 Matrix).

5. **Single Source of Truth & Zero Dual Definitions (单一事实来源与严禁双重定义/状态)**:
   - **No Dual Definitions (严禁双重类型与接口定义)**: All types, schemas, and enums must be defined in exactly ONE canonical location (e.g. `lib/`, `types/`, D1 schema) and imported everywhere. Never redefine duplicate interfaces or parallel types across client/server.
   - **No Dual State (严禁双重/分裂状态)**: Never maintain parallel or desynchronized state variables that track the same entity. Multi-level hierarchical views (e.g. Model Level 1 -> Variant Level 2 -> Color/Location Level 3) MUST derive from the exact same underlying record dataset (`vehicles: Vehicle[]`).
   - **Mathematical Consistency by Construction (构造级数据一致性)**: Card header metrics (e.g. `stockQuantity`) and expanded detail rows must derive from the identical collection to guarantee `sum(detail.quantity) ≡ header.quantity` in all states without divergent matching logic.

6. **Mature Frameworks & Zero Hand-Rolled Wheels (严禁重复造轮子 · 优先采纳成熟框架与生态标准)**:
   - **Ecosystem-First Architecture**: Always leverage battle-tested open-source libraries and standard framework plugins (e.g. `vite-plugin-pwa`, `workbox`, `@tolgee/react`, `better-auth`, `zod`, `drizzle-orm`, `lucide-react`) rather than hand-rolling fragile custom equivalents.
   - **Standard Protocols**: Strictly adhere to established RFCs and W3C/WHATWG web standards (e.g. RFC 8291/8292 for Web Push, WCAG 2.1 for a11y, Web App Manifest specs).
   - **Zero Custom Baggage**: Restrict custom code strictly to **core automotive B2B domain logic** (pricing math, trade terms, multi-role inquiry state machines). All infrastructure and platform capabilities must build on top of industry-standard packages.

## Agent skills

### Engineering standards

See `docs/agents/engineering-standards.md` for full rules and implementation guides.

### Issue tracker

Issues for this repository are tracked in GitHub Issues with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

This repository uses a single-context domain documentation layout. See `docs/agents/domain.md`.

