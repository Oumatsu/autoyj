import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import VehicleDetail from "../../app/products/_VehicleDetail";
import { TolgeeWrapper } from "../../components/TolgeeWrapper";
import { getPublicProduct } from "../../server/db/public-content";

const ALL_VEHICLES: Array<{ category: string; slug: string }> = [
  // Revenue King
  { category: "revenue-king", slug: "geely-geome" },
  { category: "revenue-king", slug: "byd-yuan-up" },
  { category: "revenue-king", slug: "leapmotor-lafa5" },
  { category: "revenue-king", slug: "byd-seagull" },
  { category: "revenue-king", slug: "leapmotor-t03" },
  { category: "revenue-king", slug: "changan-lumin" },
  { category: "revenue-king", slug: "wuling-bingo-plus" },
  { category: "revenue-king", slug: "byd-dolphin" },
  { category: "revenue-king", slug: "gac-aion-rt" },
  { category: "revenue-king", slug: "leopard-ti3" },
  { category: "revenue-king", slug: "gac-aion-y-plus" },
  { category: "revenue-king", slug: "geely-galaxy-e5" },
  { category: "revenue-king", slug: "byd-qin-plus" },
  { category: "revenue-king", slug: "geely-geometry-c" },
  { category: "revenue-king", slug: "gac-aion-i60" },
  { category: "revenue-king", slug: "gac-aion-v" },
  { category: "revenue-king", slug: "deepal-s07" },
  { category: "revenue-king", slug: "deepal-s05" },
  { category: "revenue-king", slug: "linghui-e7" },
  { category: "revenue-king", slug: "mg-mg4-ev" },
  { category: "revenue-king", slug: "dongfeng-nammi-01" },
  { category: "revenue-king", slug: "changan-nevo-q05" },
  // Elite Flagship
  { category: "elite-flagship", slug: "byd-seal" },
  { category: "elite-flagship", slug: "byd-han-ev" },
  { category: "elite-flagship", slug: "geely-galaxy-m9" },
  { category: "elite-flagship", slug: "byd-sealion-7" },
  { category: "elite-flagship", slug: "fangchengbao-leopard-5" },
  { category: "elite-flagship", slug: "fangchengbao-ti7" },
  { category: "elite-flagship", slug: "xiaomi-yu7" },
  { category: "elite-flagship", slug: "byd-tang-l-ev" },
  { category: "elite-flagship", slug: "li-auto-l6" },
  { category: "elite-flagship", slug: "xpeng-g9" },
  { category: "elite-flagship", slug: "zeekr-001" },
  { category: "elite-flagship", slug: "xiaomi-su7-ultra" },
  { category: "elite-flagship", slug: "stelato-s9" },
  { category: "elite-flagship", slug: "aito-m9" },
  { category: "elite-flagship", slug: "hongqi-e-hs9" },
  { category: "elite-flagship", slug: "leapmotor-d19" },
  { category: "elite-flagship", slug: "voyah-taishan-x8" },
  // Utility Pro
  { category: "utility-pro", slug: "byd-shark" },
  { category: "utility-pro", slug: "radar-rd6" },
  { category: "utility-pro", slug: "tank-500-hi4t" },
  { category: "utility-pro", slug: "fangchengbao-leopard-8" },
  { category: "utility-pro", slug: "zeekr-9x" },
  { category: "utility-pro", slug: "gwm-cannon-ev" },
  { category: "utility-pro", slug: "dongfeng-rich-6-ev" },
  { category: "utility-pro", slug: "farizon-xingxiang-v" },
];

describe("All Vehicle Detail Pages - Zero Runtime Errors & Zero Key Leaks", () => {
  for (const { category, slug } of ALL_VEHICLES) {
    test(`renders ${category}/${slug} vehicle detail page across all locales without errors or raw key leaks`, async () => {
      const productData = await getPublicProduct(null, slug);
      expect(productData).not.toBeNull();

      for (const locale of ["zh", "en", "am"]) {
        const html = renderToString(
          <TolgeeWrapper locale={locale}>
            <VehicleDetail data={productData! as any} />
          </TolgeeWrapper>
        );

        expect(html).not.toContain("productsDetail.values");
        expect(html).not.toContain("productsDetail.models");
        expect(html).not.toContain("productsDetail.variants");
        expect(html.includes("[object Object]")).toBe(false);
      }
    });
  }
});
