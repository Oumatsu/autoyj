import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { SOCIAL_MEDIA_LINKS } from "../../components/SocialMediaLinks";

describe("Social media links", () => {
  test("uses the supplied official profiles as a single shared configuration", () => {
    expect(SOCIAL_MEDIA_LINKS).toEqual([
      { name: "YouTube", href: "https://www.youtube.com/channel/UC49C6pgblg6MsnRv-93MqeA", platform: "youtube" },
      { name: "Instagram", href: "https://www.instagram.com/youguard.cn/", platform: "instagram" },
      { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61592775856601", platform: "facebook" },
      { name: "TikTok", href: "https://www.tiktok.com/@youguardevroy?is_from_webapp=1&sender_device=pc", platform: "tiktok" },
    ]);
  });

  test("renders the shared platform links in the desktop header, mobile menu, and always-visible footer group", async () => {
    const [navbar, footer] = await Promise.all([
      readFile(new URL("../../components/Navbar.tsx", import.meta.url), "utf8"),
      readFile(new URL("../../components/Footer.tsx", import.meta.url), "utf8"),
    ]);

    expect(navbar).toContain("<SocialMediaLinks variant=\"dropdown\"");
    expect(navbar).toContain("<SocialMediaLinks variant=\"mobile-menu\"");
    expect(footer).toContain("<SocialMediaLinks variant=\"footer\"");
    expect(footer.indexOf('<SocialMediaLinks variant="footer"')).toBeGreaterThan(footer.indexOf('id="footer-navigation"'));
  });
});
