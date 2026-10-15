import { expect, test } from "vitest";
import type { Vehicle } from "../src/catalogue";
import { importWordpressListings } from "../src/import-wordpress";

const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
<item>
<title>Subaru Levorg</title>
<content:encoded><![CDATA[<p>One owner.</p>]]></content:encoded>
<wp:post_id>4</wp:post_id>
<wp:post_date_gmt>2026-08-06 09:00:00</wp:post_date_gmt>
<wp:post_name>levorg</wp:post_name>
<wp:status>publish</wp:status>
<wp:post_type>listings</wp:post_type>
<category domain="make" nicename="subaru"><![CDATA[Subaru]]></category>
<category domain="serie" nicename="levorg"><![CDATA[Levorg 2.0 GT-S]]></category>
<category domain="body" nicename="estate"><![CDATA[Estate]]></category>
<category domain="ca-year" nicename="2016"><![CDATA[2016]]></category>
<category domain="transmission" nicename="automatic"><![CDATA[Automatic]]></category>
<category domain="mileage" nicename="42000"><![CDATA[42000]]></category>
<wp:postmeta><wp:meta_key>price</wp:meta_key><wp:meta_value><![CDATA[11495]]></wp:meta_value></wp:postmeta>
<wp:postmeta><wp:meta_key>_thumbnail_id</wp:meta_key><wp:meta_value><![CDATA[8]]></wp:meta_value></wp:postmeta>
</item>
<item>
<title>8</title>
<wp:post_id>8</wp:post_id>
<wp:post_type>attachment</wp:post_type>
<wp:attachment_url>https://originjapan.co.uk/thumb.jpg</wp:attachment_url>
</item>
</channel>
</rss>`;

test("a live gallery replaces the export photo, and the saved vehicle uses the stored path", async () => {
  const saved: Vehicle[] = [];
  const reports = await importWordpressListings(xml, {
    async fetchPage(slug) {
      expect(slug).toBe("levorg");
      return `<div class="elementor-widget-motors-single-listing-gallery-mosaic">
        <img src="https://originjapan.co.uk/front.webp">
        <img src="https://originjapan.co.uk/rear.webp">
      </div>`;
    },
    async storePhotos(slug, urls) {
      expect(slug).toBe("levorg");
      expect(urls).toEqual([
        "https://originjapan.co.uk/front.webp",
        "https://originjapan.co.uk/rear.webp",
      ]);
      return {
        paths: urls.map((url) => `/_emdash/api/media/file/${url.split("/").pop()}`),
        failed: [],
      };
    },
    async save(vehicle) {
      saved.push(vehicle);
    },
  });

  expect(reports).toEqual([]);
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({
    slug: "levorg",
    publishedAt: "2026-08-06T09:00:00.000Z",
    photos: ["/_emdash/api/media/file/front.webp", "/_emdash/api/media/file/rear.webp"],
    pricePounds: 11495,
  });
  expect(saved[0]?.draft).toBeUndefined();
});

test("when the live page has no gallery, the export photo is stored instead", async () => {
  let stored: readonly string[] = [];
  await importWordpressListings(xml, {
    async fetchPage() {
      return "<html>no gallery</html>";
    },
    async storePhotos(_slug, urls) {
      stored = urls;
      return { paths: ["/_emdash/api/media/file/thumb.jpg"], failed: [] };
    },
    async save() {},
  });

  expect(stored).toEqual(["https://originjapan.co.uk/thumb.jpg"]);
});
