# ADR 0002: AI-Native Engineering, Screenshot-less Development, and Playwright Standards

## Status
Accepted

## Context
As an AI-Native engineering organization building high-frequency multi-lingual web applications (Next.js/Vinext on Cloudflare Edge with Feishu & D1 SQLite integration), traditional developer habits such as visual screenshot inspection, manual smoke testing, and arbitrary ad-hoc E2E scripts lead to:
1. High token burn and hallucinations from parsing image screenshots.
2. Flaky test suites that fail on network settling or CSS changes.
3. Wasteful consumption of private CI runner quotas.
4. Escaped regressions requiring manual human inspection.

## Decisions

1. **Strict Screenshot-less Development Paradigm**:
   - Forbid the use of screenshots, OCR, or vision APIs as primary validation mechanisms during development.
   - Mandate programmatic validation: Semantic DOM assertions (`getByRole`, `getByLabel`), network response interception, console error listening, and W3C WCAG accessibility tree validation via `@axe-core/playwright`.
   - Screenshots and video traces are restricted solely to automated post-mortem failure diagnostics (`screenshot: "only-on-failure"`).

2. **AI-Native Eval-First & TDD Discipline**:
   - Every bug fix and feature addition must begin with automated test evaluations.
   - Core commercial math (tier discounts, volume tiers, trade terms EXW/FOB/CIF) and workflow status machines must remain pure functions in `lib/` with exhaustive test coverage.
   - Enforce the "Zero-Human-Check" rule: all regression risks must be caught by automated test suites without requiring human manual verification.

3. **Playwright Standardization**:
   - Enforce user-facing semantic locators (`getByRole`, `getByText`, `getByLabel`, `[data-testid]`) over brittle CSS selector paths or XPaths.
   - Enforce explicit page lifecycle settling (`domcontentloaded` + locator wait) and cookie/session context isolation across multi-locale and multi-role testing suites.

4. **Local 4-Tier Zero-Quota Quality Gate**:
   - Move exhaustive testing from costly private GitHub Actions runners to local Git pre-push hooks (`.husky/pre-push` running `bun run pre-push`).
   - The pre-push quality gate runs all 6 phases: Static Linting, D1 Init, Tier 1-3 Tests (760+ tests), W3C/PWA Standards Audit, Tier 4 Playwright E2E (297 scenarios), and Google Lighthouse 100/100 multi-route audit matrix.

## Consequences
- Fast, deterministic, and offline-capable developer feedback loop.
- Zero GitHub Actions quota burn on private repository branches.
- Total elimination of visual testing hallucinations and multi-locale layout flakiness.
- High long-term maintainability and bulletproof code quality across releases.
