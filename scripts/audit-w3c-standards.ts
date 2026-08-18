import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { HtmlValidate } from "html-validate";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

interface AuditResult {
  category: string;
  item: string;
  status: "PASS" | "WARN" | "FAIL";
  details: string;
}

const results: AuditResult[] = [];

function record(category: string, item: string, status: "PASS" | "WARN" | "FAIL", details: string) {
  results.push({ category, item, status, details });
  const icon = status === "PASS" ? "✅" : status === "WARN" ? "⚠️" : "❌";
  console.log(`${icon} [${category}] ${item} - ${details}`);
}

async function auditManifest() {
  console.log("\n🔍 1. Auditing W3C Web App Manifest...");
  const manifestPath = resolve(import.meta.dir, "../public/manifest.webmanifest");
  if (!existsSync(manifestPath)) {
    record("W3C Manifest", "Manifest File Exists", "FAIL", "public/manifest.webmanifest not found");
    return;
  }
  record("W3C Manifest", "Manifest File Exists", "PASS", "Found public/manifest.webmanifest");

  let manifest: any;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
    record("W3C Manifest", "JSON Validity", "PASS", "Valid JSON syntax");
  } catch (err: any) {
    record("W3C Manifest", "JSON Validity", "FAIL", `Invalid JSON: ${err.message}`);
    return;
  }

  // Check required W3C Manifest properties
  const required = ["name", "short_name", "start_url", "display", "icons", "theme_color", "background_color"];
  for (const key of required) {
    if (manifest[key]) {
      record("W3C Manifest", `Property: ${key}`, "PASS", `Present (${JSON.stringify(manifest[key]).slice(0, 30)}...)`);
    } else {
      record("W3C Manifest", `Property: ${key}`, "FAIL", `Missing required field: ${key}`);
    }
  }

  // Display mode
  if (["standalone", "fullscreen", "minimal-ui", "browser"].includes(manifest.display)) {
    record("W3C Manifest", "Display Mode", "PASS", `Valid mode: ${manifest.display}`);
  } else {
    record("W3C Manifest", "Display Mode", "FAIL", `Invalid display mode: ${manifest.display}`);
  }

  // Icons array check
  if (Array.isArray(manifest.icons) && manifest.icons.length > 0) {
    record("W3C Manifest", "Icons Array", "PASS", `${manifest.icons.length} icon definitions found`);
    let has192 = false;
    let has512 = false;
    let hasMaskable = false;

    for (const icon of manifest.icons) {
      const iconPath = resolve(import.meta.dir, `../public${icon.src}`);
      if (existsSync(iconPath)) {
        record("W3C Manifest Icon File", icon.src, "PASS", `File exists (${icon.sizes || "any"}, ${icon.type})`);
      } else {
        record("W3C Manifest Icon File", icon.src, "FAIL", `File not found on disk: ${icon.src}`);
      }
      if (icon.sizes === "192x192") has192 = true;
      if (icon.sizes === "512x512") has512 = true;
      if (icon.purpose?.includes("maskable")) hasMaskable = true;
    }

    if (has192 && has512) {
      record("W3C Manifest", "Standard Icon Dimensions (192+512)", "PASS", "Both 192x192 and 512x512 present");
    } else {
      record("W3C Manifest", "Standard Icon Dimensions", "WARN", "Missing either 192x192 or 512x512 icon");
    }

    if (hasMaskable) {
      record("W3C Manifest", "Android Maskable Icon (Safe-Zone)", "PASS", "Maskable icon defined");
    } else {
      record("W3C Manifest", "Android Maskable Icon", "WARN", "No maskable icon defined (Android 12+ Adaptive icons)");
    }
  } else {
    record("W3C Manifest", "Icons Array", "FAIL", "Icons array is empty or missing");
  }
}

async function auditServiceWorker() {
  console.log("\n🔍 2. Auditing W3C Service Worker API...");
  const swPath = resolve(import.meta.dir, "../public/sw.js");
  if (!existsSync(swPath)) {
    record("W3C ServiceWorker", "sw.js Exists", "FAIL", "public/sw.js not found");
    return;
  }
  const sw = readFileSync(swPath, "utf-8");

  if (sw.includes("addEventListener(\"install\"") && sw.includes("addEventListener(\"activate\"")) {
    record("W3C ServiceWorker", "Lifecycle Events (install/activate)", "PASS", "Install and activate event listeners present");
  } else {
    record("W3C ServiceWorker", "Lifecycle Events", "FAIL", "Missing install/activate listeners");
  }

  if (sw.includes("addEventListener(\"fetch\"")) {
    record("W3C ServiceWorker", "Network Interception (fetch)", "PASS", "Fetch event listener present");
  } else {
    record("W3C ServiceWorker", "Network Interception", "WARN", "No fetch listener found");
  }

  if (sw.includes("addEventListener(\"push\"") && sw.includes("addEventListener(\"notificationclick\"")) {
    record("W3C ServiceWorker", "Push & Notification API", "PASS", "Push and NotificationClick event listeners present");
  } else {
    record("W3C ServiceWorker", "Push & Notification API", "WARN", "Missing push / notificationclick listeners");
  }
}

async function auditHtmlAndAccessibility(baseUrl: string) {
  console.log(`\n🔍 3. Auditing W3C HTML5 & WCAG a11y via browser on ${baseUrl}...`);
  const htmlValidator = new HtmlValidate({
    extends: ["html-validate:recommended"],
  });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const testRoutes = ["/en", "/zh", "/am", "/en/products", "/en/portal", "/en/about", "/en/contact"];

  for (const route of testRoutes) {
    const url = `${baseUrl}${route}`;
    console.log(`\n  Testing ${url}...`);

    try {
      const resp = await page.goto(url, { waitUntil: "load", timeout: 30000 });
      await page.waitForTimeout(500);
      if (!resp || resp.status() !== 200) {
        record("Page HTTP", route, "FAIL", `Status ${resp?.status()}`);
        continue;
      }
      record("Page HTTP", route, "PASS", `Status 200 OK`);

      // 1. Check HTML5 Doctype and lang attribute
      const htmlLang = await page.getAttribute("html", "lang");
      if (htmlLang) {
        record("W3C HTML5", `${route} html[lang]`, "PASS", `lang="${htmlLang}"`);
      } else {
        record("W3C HTML5", `${route} html[lang]`, "FAIL", "Missing html[lang] attribute");
      }

      // 2. Check meta viewport
      const viewport = await page.$("meta[name=\"viewport\"]");
      if (viewport) {
        record("W3C HTML5", `${route} meta[viewport]`, "PASS", "Viewport meta tag present");
      } else {
        record("W3C HTML5", `${route} meta[viewport]`, "FAIL", "Missing viewport meta tag");
      }

      // 3. Check link[rel=manifest]
      const manifestLink = await page.$("link[rel=\"manifest\"]");
      if (manifestLink) {
        record("W3C PWA Link", `${route} link[rel=manifest]`, "PASS", "Manifest linked in head");
      } else {
        record("W3C PWA Link", `${route} link[rel=manifest]`, "FAIL", "Missing manifest link");
      }

      // 4. Run Axe-Core (W3C WCAG 2.1 Accessibility Audit)
      const axeResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      if (axeResults.violations.length === 0) {
        record("W3C WCAG 2.1 a11y", `${route} Accessibility`, "PASS", "0 critical/serious WCAG violations");
      } else {
        const issues = axeResults.violations
          .map((v) => `${v.id} (${v.nodes.length} instances): ${v.help}`)
          .join(" | ");
        record("W3C WCAG 2.1 a11y", `${route} Accessibility`, "WARN", `${axeResults.violations.length} notice(s): ${issues.slice(0, 120)}...`);
      }

      // 5. Run HTML-Validate on page source
      const pageHtml = await page.content();
      const report = await htmlValidator.validateString(pageHtml);
      if (report.valid) {
        record("W3C HTML Structure", `${route} HTML5 Validator`, "PASS", "HTML5 structure compliant");
      } else {
        const errors = report.results[0]?.messages.slice(0, 2).map((m) => `${m.ruleId}: ${m.message}`).join(" | ");
        record("W3C HTML Structure", `${route} HTML5 Validator`, "WARN", `${report.errorCount} notice(s): ${errors}`);
      }

    } catch (err: any) {
      record("Page Audit", route, "FAIL", `Error: ${err.message}`);
    }
  }

  await browser.close();
}

async function main() {
  console.log("===================================================================");
  console.log("🌐 STARTING COMPREHENSIVE W3C & PWA STANDARDS AUDIT");
  console.log("===================================================================");

  await auditManifest();
  await auditServiceWorker();
  await auditHtmlAndAccessibility("http://localhost:3000");

  console.log("\n===================================================================");
  console.log("📊 AUDIT SUMMARY REPORT");
  console.log("===================================================================");

  const passes = results.filter((r) => r.status === "PASS").length;
  const warns = results.filter((r) => r.status === "WARN").length;
  const fails = results.filter((r) => r.status === "FAIL").length;

  console.log(`Total Checks: ${results.length}`);
  console.log(`✅ PASS: ${passes}`);
  console.log(`⚠️ WARN: ${warns}`);
  console.log(`❌ FAIL: ${fails}`);
  console.log("===================================================================");
}

main().catch(console.error);
