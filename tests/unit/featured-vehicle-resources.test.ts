import { describe, expect, test } from "bun:test";

describe("featured vehicle resources", () => {
  test("provides a selector for positive featured ranks", async () => {
    const loadedModule = await import("../../lib/featured-vehicle-resources").catch(() => null);

    expect(loadedModule).not.toBeNull();
    expect(typeof loadedModule?.selectFeaturedVehicleResources).toBe("function");
  });

  test("selects only positive pin ranks in rank then record-id order", async () => {
    const { selectFeaturedVehicleResources } = await import("../../lib/featured-vehicle-resources");
    const resources = selectFeaturedVehicleResources([
      { id: "V-3", featuredRank: 2, featuredImageUrl: "", imageUrl: "three.jpg" },
      { id: "V-0", featuredRank: 0, featuredImageUrl: "hidden.jpg", imageUrl: "zero.jpg" },
      { id: "V-2", featuredRank: 1, featuredImageUrl: "", imageUrl: "two.jpg" },
      { id: "V-1", featuredRank: 1, featuredImageUrl: "one-featured.jpg", imageUrl: "one.jpg" },
      { id: "V-x", featuredRank: null, featuredImageUrl: "", imageUrl: "none.jpg" },
    ]);

    expect(resources.map((resource) => resource.id)).toEqual(["V-1", "V-2", "V-3"]);
  });

  test("uses the featured attachment first and falls back to the resource image", async () => {
    const { selectFeaturedVehicleResources } = await import("../../lib/featured-vehicle-resources");
    const resources = selectFeaturedVehicleResources([
      { id: "attachment", featuredRank: 1, featuredImageUrl: "https://cdn.example/featured.jpg", imageUrl: "https://cdn.example/resource.jpg" },
      { id: "fallback", featuredRank: 2, featuredImageUrl: "", imageUrl: "https://cdn.example/resource.jpg" },
    ]);

    expect(resources.map((resource) => resource.imageUrl)).toEqual(["https://cdn.example/featured.jpg", "https://cdn.example/resource.jpg"]);
  });

  test("keeps the same-origin featured-image proxy URL returned for a Feishu attachment", async () => {
    const { selectFeaturedVehicleResources } = await import("../../lib/featured-vehicle-resources");
    const proxyUrl = "/api/portal/vehicles/recvsDG2qxKGX9/featured-image";

    const resources = selectFeaturedVehicleResources([
      { id: "attachment-proxy", featuredRank: 1, featuredImageUrl: proxyUrl, imageUrl: "" },
    ]);

    expect(resources[0]?.imageUrl).toBe(proxyUrl);
  });

  test("does not render a filename left by the legacy attachment sync as an image URL", async () => {
    const { selectFeaturedVehicleResources } = await import("../../lib/featured-vehicle-resources");
    const resources = selectFeaturedVehicleResources([
      {
        id: "legacy-attachment",
        featuredRank: 1,
        featuredImageUrl: "image.png",
        imageUrl: "https://cdn.example/resource.jpg",
      },
    ]);

    expect(resources[0]?.imageUrl).toBe("https://cdn.example/resource.jpg");
  });

  test("accepts only the configured local featured-image directory", async () => {
    const { featuredLocalImageUrl, selectFeaturedVehicleResources } = await import("../../lib/featured-vehicle-resources");

    expect(featuredLocalImageUrl("/pic/vehicle-resources/yuan-plus.png")).toBe("/pic/vehicle-resources/yuan-plus.png");
    expect(featuredLocalImageUrl("/pic/vehicle-resources/BYD Yuan Plus/430km Beyond/image.webp")).toBe("/pic/vehicle-resources/BYD%20Yuan%20Plus/430km%20Beyond/image.webp");
    expect(featuredLocalImageUrl("/pic/vehicle-resources/BYD%20Yuan%20Plus/430km%20Beyond/image.webp"))
      .toBe("/pic/vehicle-resources/BYD%20Yuan%20Plus/430km%20Beyond/image.webp");
    expect(featuredLocalImageUrl("/pic/other/image.png")).toBe("");
    expect(featuredLocalImageUrl("/pic/vehicle-resources/../private.png")).toBe("");
    expect(selectFeaturedVehicleResources([
      { id: "local", featuredRank: 1, featuredImageUrl: "/pic/vehicle-resources/yuan-plus.png", imageUrl: "https://cdn.example/fallback.jpg" },
    ])[0]?.imageUrl).toBe("/pic/vehicle-resources/yuan-plus.png");
  });

  test("extracts the first usable URL from a synced Feishu attachment", async () => {
    const { featuredImageUrlFromAttachment } = await import("../../lib/featured-vehicle-resources");

    expect(featuredImageUrlFromAttachment([
      { file_token: "token-only" },
      { tmp_url: "https://files.example/featured.jpg" },
    ])).toBe("https://files.example/featured.jpg");
  });

  test("extracts the attachment token so the browser never requests a protected Feishu URL directly", async () => {
    const { featuredAttachmentTokenFromAttachment } = await import("../../lib/featured-vehicle-resources");

    expect(featuredAttachmentTokenFromAttachment([
      { name: "image.png" },
      { file_token: "featured-token", url: "https://open.feishu.cn/open-apis/drive/v1/medias/featured-token/download" },
    ])).toBe("featured-token");
  });

  test("treats malformed stored attachment data as no featured image", async () => {
    const { featuredImageUrlFromAttachment } = await import("../../lib/featured-vehicle-resources");

    expect(featuredImageUrlFromAttachment("not-json")).toBe("");
  });
});
