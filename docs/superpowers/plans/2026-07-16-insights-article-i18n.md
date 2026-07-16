# Insights Article I18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 120 Chinese and Amharic Insights translation records and link every record bidirectionally to its source Article.

**Architecture:** Treat Articles as the immutable English source and I18n Locale as the translation source of truth. Build an in-memory manifest keyed by article slug, validate it before mutation, create records in one serial batch, then verify forward and reverse relationships from live Base data.

**Tech Stack:** Node.js, Markdown, Feishu Base via `lark-cli base +...`

## Global Constraints

- Do not modify Articles source fields.
- Create exactly four records per Published article: title, overview, date, content.
- Preserve Markdown syntax, URLs, image paths, brands, figures, and units.
- Set Module to 洞察 and Linked Articles to exactly one source record.
- Do not push or deploy.

---

### Task 1: Build and validate the translation manifest

**Files:**
- Read: `example/insights/*/*/article.md`
- Read: live `Articles` and `I18n Locale` Base tables

**Interfaces:**
- Consumes: 30 Published Articles records and 30 matching Markdown files
- Produces: 120 rows shaped as `Key, ZH, EN, AM, Module, Notes, Linked Articles`

- [ ] Confirm Articles contains 30 unique Published slugs and I18n Locale contains no `insights.articles.*` keys.
- [ ] Parse each Markdown file into title, overview, date, and body content using the existing import boundary.
- [ ] Translate reader-visible text to Chinese and Amharic while protecting Markdown syntax and non-translatable tokens.
- [ ] Validate 120 unique keys, non-empty locale cells, valid Markdown structure, and one article record ID per row.

### Task 2: Create the 120 I18n Locale records

**Files:**
- Modify remotely: Base `Xvdfbpk7cadLrnsVCFFcHbhOnCb`, table `tblATd4EWHge1l1k`

**Interfaces:**
- Consumes: validated 120-row manifest
- Produces: 120 new I18n Locale records with Linked Articles values

- [ ] Call `lark-cli base +record-batch-create` once with fields `Key, ZH, EN, AM, Module, Notes, Linked Articles` and 120 rows.
- [ ] Capture all returned record IDs and stop on any partial or rejected write.

### Task 3: Verify forward and reverse links

**Files:**
- Read remotely: `I18n Locale.Linked Articles`
- Read remotely: `Articles.I18n Locale`

**Interfaces:**
- Consumes: created record IDs and the source article ID map
- Produces: verification evidence for record count, locale completeness, and bidirectional links

- [ ] Query `insights.articles.*` records and verify the count is 120 with four keys per slug.
- [ ] Verify every created record has non-empty EN, ZH, AM and exactly one Linked Articles target.
- [ ] Verify every Published Article has exactly four reverse I18n Locale links matching its slug.
- [ ] Spot-check title, overview, date, and Markdown content for one early, one middle, and one late article.
