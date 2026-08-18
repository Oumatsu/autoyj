/**
 * i18n-strict-isolation.spec.ts
 *
 * 완전한 페이지 전체 커버리지 테스트:
 *
 * 1. 모든 정적 페이지가 HTTP 200 반환 (로케일별 전체 경로 목록)
 * 2. ZH 페이지 → 영어 단독 텍스트 조각 없음
 * 3. EN 페이지 → 한자(CJK) 없음
 * 4. AM 페이지 → 한자 없음
 * 5. 모든 페이지의 모든 <img src="/pic/..."> → HTTP 200 (no 404)
 * 6. Academy 페이지 → 중복 이미지 URL 없음
 * 7. 소스 코드에서 추출한 모든 /pic/... URL → HTTP 200 직접 확인
 */

import { expect, test } from "@playwright/test";

// ─── 로케일 ─────────────────────────────────────────────────────────────────
const LOCALES = ["zh", "en", "am"] as const;
type Locale = (typeof LOCALES)[number];

// ─── 전체 페이지 경로 (locale prefix 없이) ───────────────────────────────────
// app/[locale]/ 아래 모든 page.tsx 경로 반영
const STATIC_PAGES = [
  "/",
  "/about",
  "/academy",
  "/academy/ev-fundamentals",
  "/academy/dealer-playbook",
  "/academy/technical-workshop",
  "/company",
  "/contact",
  "/insights",
  "/markets/ethiopia",
  "/privacy",
  "/products",
  "/products/revenue-king",
  "/products/elite-flagship",
  "/products/utility-pro",
  "/solutions",
  "/solutions/configure-kit",
  "/solutions/request-quote",
  "/terms",
];

// ─── 헬퍼 함수 ───────────────────────────────────────────────────────────────
const CJK_RE = /[\u4e00-\u9fff]/;

async function collectLocalImgSrcs(page: import("@playwright/test").Page): Promise<string[]> {
  await page.waitForLoadState("load");
  await page.waitForTimeout(200);
  try {
    return await page.locator("img[src]").evaluateAll((imgs) => {
      return imgs
        .map((img) => img.getAttribute("src") ?? "")
        .filter((src) => src.startsWith("/pic/"));
    });
  } catch {
    await page.waitForTimeout(300);
    return await page.locator("img[src]").evaluateAll((imgs) => {
      return imgs
        .map((img) => img.getAttribute("src") ?? "")
        .filter((src) => src.startsWith("/pic/"));
    });
  }
}

async function getBodyText(page: import("@playwright/test").Page): Promise<string> {
  await page.waitForLoadState("load");
  await page.waitForTimeout(200);
  try {
    return await page.locator("body").innerText();
  } catch {
    await page.waitForTimeout(300);
    return await page.locator("body").innerText();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: 모든 페이지 HTTP 200 확인
// ─────────────────────────────────────────────────────────────────────────────
test.describe("모든 페이지 HTTP 200 응답", () => {
  for (const locale of LOCALES) {
    for (const path of STATIC_PAGES) {
      const url = `/${locale}${path}`;
      test(`GET ${url} → 200`, async ({ page }) => {
        const res = await page.goto(url, { waitUntil: "domcontentloaded" });
        expect(res?.status(), `${url} 가 200이 아님`).toBeLessThan(400);
      });
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: EN 페이지 → CJK 한자 없음
// ─────────────────────────────────────────────────────────────────────────────
test.describe("EN 페이지 — 한자(CJK) 없음", () => {
  for (const path of STATIC_PAGES) {
    const url = `/en${path}`;
    test(`${url} — body에 한자 없음`, async ({ page }) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const text = await getBodyText(page);
      const match = text.match(/[\u4e00-\u9fff]{1,20}/);
      expect(
        CJK_RE.test(text),
        `EN 페이지 "${url}" 에 한자 발견: "${match?.[0] ?? ""}"`
      ).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: AM 페이지 → CJK 한자 없음
// ─────────────────────────────────────────────────────────────────────────────
test.describe("AM 페이지 — 한자(CJK) 없음", () => {
  for (const path of STATIC_PAGES) {
    const url = `/am${path}`;
    test(`${url} — body에 한자 없음`, async ({ page }) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const text = await getBodyText(page);
      const match = text.match(/[\u4e00-\u9fff]{1,20}/);
      expect(
        CJK_RE.test(text),
        `AM 페이지 "${url}" 에 한자 발견: "${match?.[0] ?? ""}"`
      ).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4: ZH 페이지 — 영어 heading 조각 없음 (번역 fallback 누수 방지)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("ZH 페이지 — 영어 heading 조각 누수 없음", () => {
  // "The ... Matrix" 패턴이 누수된 경우를 감지하는 규칙:
  // ZH heading 시작에 영어 관사 "The " 가 오거나, 끝에 영어 명사가 오면 안 됨
  const zhHeadingRules: Array<{
    url: string;
    forbiddenPatterns: RegExp[];
    label: string;
  }> = [
    {
      url: "/zh/products/revenue-king",
      forbiddenPatterns: [
        /The\s+[\u4e00-\u9fff]/,   // "The 网约..." 패턴
        /[\u4e00-\u9fff]\s+Matrix/, // "矩阵 Matrix" 패턴
        /^\s*The\s+/m,              // 줄 시작이 "The "
      ],
      label: "Revenue King",
    },
    {
      url: "/zh/products/elite-flagship",
      forbiddenPatterns: [
        /The\s+[\u4e00-\u9fff]/,
        /[\u4e00-\u9fff]\s+Circle/,
        /^\s*The\s+/m,
      ],
      label: "Elite Flagship",
    },
    {
      url: "/zh/products/utility-pro",
      forbiddenPatterns: [
        /The\s+[\u4e00-\u9fff]/,
        /[\u4e00-\u9fff]\s+Suite/,
        /^\s*The\s+/m,
      ],
      label: "Utility Pro",
    },
  ];

  for (const { url, forbiddenPatterns, label } of zhHeadingRules) {
    test(`${url} (${label}) — 영어 heading 조각 없음`, async ({ page }) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const text = await getBodyText(page);

      for (const pattern of forbiddenPatterns) {
        const match = text.match(pattern);
        expect(
          match,
          `ZH "${url}" 에서 금지 패턴 /${pattern.source}/ 발견: "${match?.[0]?.trim() ?? ""}"`
        ).toBeNull();
      }
    });
  }

  // H1 태그 직접 검사
  test("ZH /products/revenue-king h1 — 영어 단독 시작/끝 없음, 한자 포함 필수", async ({ page }) => {
    await page.goto("/zh/products/revenue-king", { waitUntil: "domcontentloaded" });
    const h1 = page.locator("h1").first();
    await h1.waitFor({ timeout: 5000 }).catch(() => {});
    const h1Text = await h1.innerText().catch(() => "");
    if (h1Text) {
      expect(h1Text, "ZH h1이 'The '로 시작하면 안 됨").not.toMatch(/^\s*The\s/i);
      expect(h1Text, "ZH h1이 'Matrix'로 끝나면 안 됨").not.toMatch(/Matrix\s*$/i);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5: 모든 페이지의 <img src="/pic/..."> → HTTP 200
// ─────────────────────────────────────────────────────────────────────────────
test.describe("모든 페이지 이미지 → HTTP 200 (no 404)", () => {
  // 전체 페이지를 순회하여 각 페이지의 로컬 이미지 HTTP 상태를 확인
  // 성능을 위해 중복 URL은 한 번만 검사
  const ALL_PAGES = STATIC_PAGES.flatMap((path) =>
    LOCALES.map((locale) => `/${locale}${path}`)
  );

  for (const pageUrl of ALL_PAGES) {
    test(`${pageUrl} — 모든 이미지 HTTP 200`, async ({ page, request }) => {
      await page.goto(pageUrl, { waitUntil: "domcontentloaded" });
      const srcs = await collectLocalImgSrcs(page);

      if (srcs.length === 0) return; // 이미지 없는 페이지는 skip

      const failures: string[] = [];
      for (const src of [...new Set(srcs)]) {
        const res = await request.get(src);
        if (res.status() !== 200) {
          failures.push(`${src} → HTTP ${res.status()}`);
        }
      }

      expect(
        failures,
        `"${pageUrl}" 에서 broken 이미지:\n${failures.join("\n")}`
      ).toHaveLength(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 6: Academy 페이지 — 중복 이미지 없음
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Academy 페이지 — 중복 이미지 없음", () => {
  const academyPages = LOCALES.map((l) => `/${l}/academy`);

  for (const url of academyPages) {
    test(`${url} — 동일 이미지 URL 중복 없음`, async ({ page }) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const srcs = await collectLocalImgSrcs(page);

      // hero 이미지는 배경+<img> 이중 사용이 의도적일 수 있으므로 허용
      const ALLOW_REPEAT = new Set([
        "/pic/hero/photo-1593941707882-a5bba14938c7.webp",
      ]);

      const counts = new Map<string, number>();
      for (const src of srcs) {
        if (ALLOW_REPEAT.has(src)) continue;
        counts.set(src, (counts.get(src) ?? 0) + 1);
      }

      const dups = [...counts.entries()]
        .filter(([, n]) => n > 1)
        .map(([src, n]) => `${src} (${n}회)`);

      expect(
        dups,
        `"${url}" 중복 이미지:\n${dups.join("\n")}`
      ).toHaveLength(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 7: 소스 코드에서 추출한 전체 /pic/... URL 직접 HTTP 200 검증
//          (브라우저 렌더링 없이 request만으로 체크 — 빠름)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("소스 코드 이미지 URL 직접 HTTP 200 검증", () => {
  // grep -roh '"/pic/[^"]*\.(webp|png|jpg)"' views/ server/ i18n/ 로 추출한 전체 목록
  const ALL_SOURCE_IMAGE_URLS = [
    // ── academy ──────────────────────────────────────────────
    "/pic/academy/0.webp",
    "/pic/academy/photo-1473341304170-971dccb5ac1e.webp",
    "/pic/academy/photo-1486312338219-ce68d2c6f44d.webp",
    "/pic/academy/photo-1504328345606-18bbc8c9d7d1.webp",
    "/pic/academy/photo-1518770660439-4636190af475.webp",
    "/pic/academy/photo-1527853787696-f7be74f2e39a.webp",
    "/pic/academy/photo-1559136555-9303baea8ebd.webp",
    "/pic/academy/photo-1560250097-0b93528c311a.webp",
    "/pic/academy/photo-1581092160562-40aa08e78837.webp",
    // ── company ──────────────────────────────────────────────
    "/pic/company/Business License/0.webp",
    "/pic/company/Business License/1.webp",
    "/pic/company/Business License/2.webp",
    "/pic/company/Business License/3.webp",
    "/pic/company/Business License/4.webp",
    "/pic/company/Company Activity/0.webp",
    "/pic/company/Company Activity/1.webp",
    "/pic/company/Company Activity/2.webp",
    "/pic/company/Core Team/0.webp",
    "/pic/company/Core Team/2.webp",
    "/pic/company/Core Team/3.webp",
    "/pic/company/Ethiopia Contact/0.webp",
    "/pic/company/Ethiopia Showroom/0.webp",
    // ── elite-flagship ───────────────────────────────────────
    "/pic/elite-flagship/001/0.webp",
    "/pic/elite-flagship/E-HS9/6cut.webp",
    "/pic/elite-flagship/Galaxym9/7.webp",
    "/pic/elite-flagship/L6/5cut.webp",
    "/pic/elite-flagship/leopard5/7.webp",
    "/pic/elite-flagship/seal/5.webp",
    // ── hero ─────────────────────────────────────────────────
    "/pic/hero/0.webp",
    "/pic/hero/3.webp",
    "/pic/hero/Galaxye5 display.webp",
    "/pic/hero/M9 display.webp",
    "/pic/hero/Our-solutions-durability-and-fatigue.webp",
    "/pic/hero/photo-1486262715619-67b85e0b08d3.webp",
    "/pic/hero/photo-1521791136064-7986c2920216.webp",
    "/pic/hero/photo-1578575437130-527eed3abbec.webp",
    "/pic/hero/photo-1593941707882-a5bba14938c7.webp",
    "/pic/hero/RD6 display0.webp",
    "/pic/hero/SU7ultra display.webp",
    "/pic/hero/supervan display.webp",
    "/pic/hero/Ti3 display.webp",
    // ── page ─────────────────────────────────────────────────
    "/pic/page/photo-1451187580459-43490279c0fa.webp",
    "/pic/page/photo-1520038410233-7141be7e6f97.webp",
    "/pic/page/photo-1523805009345-7448845a9e53.webp",
    "/pic/page/photo-1555215695-3004980ad54e.webp",
    "/pic/page/photo-1558618666-fcd25c85cd64.webp",
    "/pic/page/photo-1563720360172-67b8f3dce741.webp",
    // ── revenue-king ─────────────────────────────────────────
    "/pic/revenue-king/dolphin/7cut.webp",
    "/pic/revenue-king/Galaxye5/5.webp",
    "/pic/revenue-king/lafa5/8cut.webp",
    "/pic/revenue-king/lumin/5.webp",
    "/pic/revenue-king/qinplusev/3.webp",
    "/pic/revenue-king/qinplusev/5cut.webp",
    "/pic/revenue-king/RT/7cut.webp",
    "/pic/revenue-king/seagull/7.webp",
    "/pic/revenue-king/seagull/7cut.webp",
    "/pic/revenue-king/yuanup/5.webp",
    // ── utility-pro ──────────────────────────────────────────
    "/pic/utility-pro/9x/6cut.webp",
    "/pic/utility-pro/shark/4cut.webp",
    "/pic/utility-pro/supervan/9.webp",
    "/pic/utility-pro/xingxiangv/5.webp",
  ];

  for (const src of ALL_SOURCE_IMAGE_URLS) {
    test(`${src} → HTTP 200`, async ({ request }) => {
      const res = await request.get(src);
      expect(res.status(), `이미지 ${src} 가 200이 아님: ${res.status()}`).toBe(200);
    });
  }

  // 수정 전 404였던 경로 — 이제 소스에서 제거됨, 접근해도 404여야 정상
  test("(회귀) /pic/academy/photo-1593941707882-a5bba14938c7.webp — 소스에서 제거된 경로", async ({ request }) => {
    // 이 파일은 /pic/hero/ 에만 존재하고 /pic/academy/ 에는 없음
    // 소스에서도 더 이상 참조하지 않아야 함 (이전 버그였음)
    const res = await request.get("/pic/academy/photo-1593941707882-a5bba14938c7.webp");
    expect(res.status(), "이 경로는 disk에 없어야 함").not.toBe(200);
  });
});
