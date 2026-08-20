import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const portalApi = readFileSync("server/api/portal.ts", "utf8");

test("vehicle API maps the dedicated featured rank and attachment without reusing website recommendation", () => {
  const start = portalApi.indexOf("async function handleGetVehicles");
  const end = portalApi.indexOf("async function handleUpdateVehicleRecommendation", start);
  const handler = portalApi.slice(start, end);

  expect(handler).toContain('rowField(fields, "置顶优秀车源")');
  expect(handler).toContain('rowField(fields, "置顶优秀车源图片")');
  expect(handler).toContain('rowField(fields, "置顶优秀车源图片相对地址", "图片URL")');
  expect(handler).toContain("featuredRank");
  expect(handler).toContain("featuredImageUrl");
  expect(handler).toContain('`/api/portal/vehicles/${encodeURIComponent(String(row.id))}/featured-image`');
  expect(handler).toContain('imageUrl: asText(rowField(fields, "image_url"');
});

test("featured image route proxies the Feishu attachment with server credentials", () => {
  expect(portalApi).toContain("async function handleGetFeaturedVehicleImage");
  expect(portalApi).toContain("await feishuToken(env)");
  expect(portalApi).toContain("/featured-image");
});
