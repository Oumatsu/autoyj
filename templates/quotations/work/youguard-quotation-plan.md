# YouGuard Quotation Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a browser-editable, one-page A4 landscape quotation template that prints cleanly to PDF.

**Architecture:** A standalone HTML file embeds its CSS and small JavaScript print handler. The official Logo SVG is stored alongside the file and referenced locally, so the document remains usable offline.

**Tech Stack:** HTML5, CSS3 print media rules, vanilla JavaScript.

## Global Constraints

- Use a black background, warm-white text, and YouGuard gold `#c09d59` accents.
- Use the downloaded public Logo SVG in the upper-left page header.
- Keep all business values editable with `contenteditable`.
- Include customer details; vehicle details and quantity; FOB, ECTN, charger, freight, and CIF costs; payment information.
- Print as one landscape A4 page and remove controls from printed output.

---

### Task 1: Create branded editable document

**Files:**
- Create: `outputs/youguard-quotation-template.html`
- Copy: `work/youguard-logo.svg` to `outputs/youguard-logo.svg`

**Interfaces:**
- Consumes: official `youguard-logo.svg` as a local image asset.
- Produces: a standalone quotation document with editable fields and `window.print()` export control.

- [ ] **Step 1: Write a visual acceptance checklist**

Check that the HTML contains: a black A4 landscape page, logo at upper left, client details, vehicle line-item table, FOB/ECTN/charger/freight/CIF summary, payment details, and print button.

- [ ] **Step 2: Create the document shell and header**

Create an `@page { size: A4 landscape; margin: 0; }` print rule and a `.page` container sized to 297mm by 210mm. Add the Logo image and quotation metadata fields in the header.

- [ ] **Step 3: Add editable commercial fields**

Use table cells and text blocks marked `contenteditable="true"` for client information, vehicle details, quantity, FOB price, ECTN charge, charger charge, sea freight, CIF total, bank/payment details, and commercial notes.

- [ ] **Step 4: Add print-only behavior**

Provide a button whose click listener calls `window.print()`. In `@media print`, hide controls, retain background colors using `print-color-adjust: exact`, and remove page shadow/margins.

- [ ] **Step 5: Run structural verification**

Run: `Select-String -Path outputs/youguard-quotation-template.html -Pattern 'contenteditable|window.print|@media print|ECTN|CIF|FOB'`

Expected: every required export and commercial field is found.

### Task 2: Verify visual rendering

**Files:**
- Verify: `outputs/youguard-quotation-template.html`

**Interfaces:**
- Consumes: completed local HTML and SVG asset.
- Produces: verified print-ready layout.

- [ ] **Step 1: Open or render the HTML at a desktop viewport**

Confirm the table and payment fields stay within one 297mm × 210mm page and that no information overlaps.

- [ ] **Step 2: Inspect print styles**

Confirm the print control is hidden and the background remains black with gold rules and warm-white typography.

- [ ] **Step 3: Re-run structural verification**

Run: `Select-String -Path outputs/youguard-quotation-template.html -Pattern 'contenteditable|window.print|@media print|ECTN|CIF|FOB'`

Expected: all terms still appear after final styling.
