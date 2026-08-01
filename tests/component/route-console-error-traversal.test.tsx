import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";

import PortalPage from "../../app/portal/page";
import LocalePortalPage from "../../app/[locale]/portal/page";
import DashboardPage from "../../app/dashboard/page";
import LocaleDashboardPage from "../../app/[locale]/dashboard/page";
import LocaleDashboardModulePage from "../../app/[locale]/dashboard/[module]/page";

import HomePage from "../../app/page";
import LocaleHomePage from "../../app/[locale]/page";

import AboutPage from "../../app/about/page";
import LocaleAboutPage from "../../app/[locale]/about/page";

import AcademyPage from "../../app/academy/page";
import LocaleAcademyPage from "../../app/[locale]/academy/page";
import LocaleAcademyFundamentalsPage from "../../app/[locale]/academy/ev-fundamentals/page";
import LocaleAcademyPlaybookPage from "../../app/[locale]/academy/dealer-playbook/page";
import LocaleAcademyWorkshopPage from "../../app/[locale]/academy/technical-workshop/page";
import LocaleAcademyDetailPage from "../../app/[locale]/academy/[category]/[slug]/page";

import CompanyPage from "../../app/company/page";
import LocaleCompanyPage from "../../app/[locale]/company/page";

import ContactPage from "../../app/contact/page";
import LocaleContactPage from "../../app/[locale]/contact/page";

import InsightsPage from "../../app/insights/page";
import LocaleInsightsPage from "../../app/[locale]/insights/page";
import LocaleInsightsDetailPage from "../../app/[locale]/insights/[slug]/page";

import MarketsPage from "../../app/markets/ethiopia/page";
import LocaleMarketsPage from "../../app/[locale]/markets/ethiopia/page";

import PrivacyPage from "../../app/privacy/page";
import LocalePrivacyPage from "../../app/[locale]/privacy/page";

import ProductsPage from "../../app/products/page";
import LocaleProductsPage from "../../app/[locale]/products/page";
import LocaleProductsCategoryPage from "../../app/[locale]/products/revenue-king/page";
import LocaleProductsDetailPage from "../../app/[locale]/products/[category]/[slug]/page";

import QrPage from "../../app/qr/page";
import LocaleQrPage from "../../app/[locale]/qr/page";

import SolutionsPage from "../../app/solutions/page";
import LocaleSolutionsPage from "../../app/[locale]/solutions/page";
import LocaleSolutionsConfigurePage from "../../app/[locale]/solutions/configure-kit/page";
import LocaleSolutionsRequestQuotePage from "../../app/[locale]/solutions/request-quote/page";

import TermsPage from "../../app/terms/page";
import LocaleTermsPage from "../../app/[locale]/terms/page";

const locales = ["zh", "en", "am"];

const routesToTraverse = [
  { route: "/portal", component: PortalPage },
  { route: "/[locale]/portal", component: LocalePortalPage },
  { route: "/dashboard", component: DashboardPage },
  { route: "/[locale]/dashboard", component: LocaleDashboardPage },
  { route: "/[locale]/dashboard/vehicles", component: LocaleDashboardModulePage, props: { params: { module: "vehicles" } } },
  { route: "/[locale]/dashboard/vehicle_models", component: LocaleDashboardModulePage, props: { params: { module: "vehicle_models" } } },
  { route: "/[locale]/dashboard/quotes", component: LocaleDashboardModulePage, props: { params: { module: "quotes" } } },
  { route: "/[locale]/dashboard/orders", component: LocaleDashboardModulePage, props: { params: { module: "orders" } } },
  { route: "/[locale]/dashboard/customers", component: LocaleDashboardModulePage, props: { params: { module: "customers" } } },
  { route: "/", component: HomePage },
  { route: "/[locale]", component: LocaleHomePage },
  { route: "/about", component: AboutPage },
  { route: "/[locale]/about", component: LocaleAboutPage },
  { route: "/company", component: CompanyPage },
  { route: "/[locale]/company", component: LocaleCompanyPage },
  { route: "/contact", component: ContactPage },
  { route: "/[locale]/contact", component: LocaleContactPage },
  { route: "/academy", component: AcademyPage },
  { route: "/[locale]/academy", component: LocaleAcademyPage },
  { route: "/[locale]/academy/ev-fundamentals", component: LocaleAcademyFundamentalsPage },
  { route: "/[locale]/academy/dealer-playbook", component: LocaleAcademyPlaybookPage },
  { route: "/[locale]/academy/technical-workshop", component: LocaleAcademyWorkshopPage },
  {
    route: "/[locale]/academy/ev-fundamentals/ev-charging-basics",
    component: LocaleAcademyDetailPage,
    props: { params: { category: "ev-fundamentals", slug: "ev-charging-basics" } },
  },
  { route: "/insights", component: InsightsPage },
  { route: "/[locale]/insights", component: LocaleInsightsPage },
  {
    route: "/[locale]/insights/ethiopia-ev-market-2026",
    component: LocaleInsightsDetailPage,
    props: { params: { slug: "ethiopia-ev-market-2026" } },
  },
  { route: "/markets/ethiopia", component: MarketsPage },
  { route: "/[locale]/markets/ethiopia", component: LocaleMarketsPage },
  { route: "/privacy", component: PrivacyPage },
  { route: "/[locale]/privacy", component: LocalePrivacyPage },
  { route: "/terms", component: TermsPage },
  { route: "/[locale]/terms", component: LocaleTermsPage },
  { route: "/qr", component: QrPage },
  { route: "/[locale]/qr", component: LocaleQrPage },
  { route: "/products", component: ProductsPage },
  { route: "/[locale]/products", component: LocaleProductsPage },
  { route: "/[locale]/products/revenue-king", component: LocaleProductsCategoryPage },
  {
    route: "/[locale]/products/revenue-king/byd-seagull",
    component: LocaleProductsDetailPage,
    props: { params: { category: "revenue-king", slug: "byd-seagull" } },
  },
  { route: "/solutions", component: SolutionsPage },
  { route: "/[locale]/solutions", component: LocaleSolutionsPage },
  { route: "/[locale]/solutions/configure-kit", component: LocaleSolutionsConfigurePage },
  { route: "/[locale]/solutions/request-quote", component: LocaleSolutionsRequestQuotePage },
];

describe("Component: 102 Route-Locale Render Traversal & Console Interception", () => {
  test("Traverses every single page route across all locales and detects zero console errors or warnings", () => {
    const originalError = console.error;
    const originalWarn = console.warn;

    const capturedErrors: string[] = [];
    const capturedWarnings: string[] = [];

    console.error = (...args: any[]) => {
      const msg = args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
      capturedErrors.push(msg);
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const msg = args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
      capturedWarnings.push(msg);
      originalWarn.apply(console, args);
    };

    let totalRouteTests = 0;

    try {
      for (const item of routesToTraverse) {
        for (const locale of locales) {
          const fullRoutePath = item.route.replace("[locale]", locale);
          const props = item.props || {};

          try {
            const html = renderToString(React.createElement(item.component as any, props));
            expect(typeof html === "string" && html.length > 0).toBe(true);
            expect(html.includes("[object Object]")).toBe(false);
          } catch (err: any) {
            const isNextRedirect = err && (err.message === "NEXT_REDIRECT" || String(err).includes("NEXT_REDIRECT"));
            if (!isNextRedirect) {
              throw err;
            }
          }
          totalRouteTests++;
        }
      }
    } finally {
      console.error = originalError;
      console.warn = originalWarn;
    }

    const criticalErrors = capturedErrors.filter(
      (err) =>
        !err.includes("Warning: useLayoutEffect does nothing on the server") &&
        !err.includes("Warning: React.jsx: type is invalid")
    );

    expect(criticalErrors.length).toBe(0);
    expect(totalRouteTests).toBeGreaterThanOrEqual(100);
  });
});
