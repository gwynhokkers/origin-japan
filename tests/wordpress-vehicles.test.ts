import { expect, test } from "vitest";
import { vehiclesFromWordpress } from "../src/wordpress-vehicles";

test("a sold listing keeps its slug, taxonomy labels, and the meta price", async () => {
  const { vehicles, reports } = await vehiclesFromWordpress(
    wxr(
      listing({
        id: "2688",
        slug: "2688",
        title: "Volvo V60 T5",
        date: "2025-09-17 10:00:00",
        content: "<p>One owner.&nbsp;</p><ul><li>Full&amp; history</li><li>Two keys</li></ul>",
        terms: {
          make: ["volvo", "Volvo"],
          serie: ["v60-t5", "V60 T5"],
          body: ["estate", "Estate"],
          "ca-year": ["2014", "2014"],
          transmission: ["automatic", "Automatic"],
          mileage: ["81560", "81,560"],
          price: ["9550", "9550"],
        },
        meta: {
          price: "7995",
          stm_genuine_price: "7995",
          car_mark_as_sold: "on",
          badge_text: "DEPOSIT TAKEN",
          _thumbnail_id: "2640",
          gallery: 'a:2:{i:1;s:4:"2639";i:2;s:4:"2690";}',
        },
      }),
      attachment("2640", "https://originjapan.co.uk/front.jpg"),
      attachment("2690", "https://originjapan.co.uk/rear.jpg"),
    ),
  );

  expect(reports).toEqual([]);
  expect(vehicles).toEqual([
    {
      id: "2688",
      slug: "2688",
      title: "Volvo V60 T5",
      make: "Volvo",
      model: "V60 T5",
      body: "Estate",
      year: 2014,
      transmission: "Automatic",
      mileageMiles: 81560,
      pricePounds: 7995,
      photos: ["https://originjapan.co.uk/front.jpg", "https://originjapan.co.uk/rear.jpg"],
      sellersNotes: "One owner.\n\nFull& history\n\nTwo keys",
      availability: "sold",
      publishedAt: "2025-09-17T10:00:00.000Z",
    },
  ]);
});

test("on water and in prep keep no public price, and a priced car with no badge is for sale", async () => {
  const { vehicles, reports } = await vehiclesFromWordpress(
    wxr(
      listing({
        id: "1",
        slug: "carry",
        title: "Suzuki Carry",
        content: "<p>In transit.</p>",
        terms: completeTerms({ mileage: ["", ""] }),
        meta: { price: "8995", badge_text: "ON WATER", _thumbnail_id: "10" },
      }),
      listing({
        id: "2",
        slug: "v40",
        title: "Volvo V40",
        content: "<p>Awaiting prep.</p>",
        terms: completeTerms(),
        meta: { stm_genuine_price: "7995", badge_text: "IN PREP", _thumbnail_id: "10" },
      }),
      listing({
        id: "3",
        slug: "chaser",
        title: "Toyota Chaser",
        content: "<p>THIS CAR IS STILL IN PREP - photos to follow.</p>",
        terms: completeTerms(),
        meta: { price: "20000", _thumbnail_id: "10" },
      }),
      attachment("10", "https://originjapan.co.uk/thumb.jpg"),
    ),
  );

  const carry = vehicles.find((vehicle) => vehicle.slug === "carry");
  const v40 = vehicles.find((vehicle) => vehicle.slug === "v40");
  const chaser = vehicles.find((vehicle) => vehicle.slug === "chaser");

  expect(carry).toMatchObject({ availability: "on water", draft: true });
  expect(carry?.pricePounds).toBeUndefined();
  expect(v40).toMatchObject({ availability: "in prep" });
  expect(v40?.pricePounds).toBeUndefined();
  expect(v40?.draft).toBeUndefined();
  expect(chaser).toMatchObject({ pricePounds: 20000 });
  expect(chaser?.availability).toBeUndefined();
  expect(chaser?.draft).toBeUndefined();
  expect(reports).toEqual([
    {
      slug: "carry",
      message: "Draft, missing mileage.",
    },
    {
      slug: "chaser",
      message: "Seller's notes say this car is still in prep. It is imported for sale.",
    },
  ]);
});

test("an integer gallery keeps the featured image first and skips ids the export does not contain", async () => {
  const { vehicles } = await vehiclesFromWordpress(
    wxr(
      listing({
        id: "4",
        slug: "pearl",
        title: "Volvo V70",
        content: "<p>Three keys.</p>",
        terms: completeTerms({ make: ["volvo", "Volvo"], serie: ["v70", "V70"] }),
        meta: {
          price: "8500",
          car_mark_as_sold: "on",
          _thumbnail_id: "20",
          gallery: "a:3:{i:0;i:3407;i:1;i:21;i:2;i:22;}",
        },
      }),
      attachment("20", "https://originjapan.co.uk/pearl-front.jpg"),
      attachment("21", "https://originjapan.co.uk/pearl-side.jpg"),
    ),
  );

  expect(vehicles[0]?.photos).toEqual([
    "https://originjapan.co.uk/pearl-front.jpg",
    "https://originjapan.co.uk/pearl-side.jpg",
  ]);
});

test("a listing that cannot be shown is a draft, and other post types are skipped", async () => {
  const { vehicles } = await vehiclesFromWordpress(
    wxr(
      listing({
        id: "9",
        slug: "impreza",
        title: "2010 Subaru Impreza",
        content: "",
        terms: { make: ["subaru", "Subaru"], body: ["hatchback", "Hatchback"] },
        meta: { car_mark_as_sold: "on", _thumbnail_id: "10" },
      }),
      `<item><title>About</title><wp:post_type>page</wp:post_type><wp:status>publish</wp:status><wp:post_name>about</wp:post_name></item>`,
      attachment("10", "https://originjapan.co.uk/thumb.jpg"),
    ),
  );

  expect(vehicles.map((vehicle) => vehicle.slug)).toEqual(["impreza"]);
  expect(vehicles[0]).toMatchObject({
    draft: true,
    availability: "sold",
    make: "Subaru",
  });
  expect(vehicles[0]?.model).toBeUndefined();
  expect(vehicles[0]?.year).toBeUndefined();
  expect(vehicles[0]?.transmission).toBeUndefined();
  expect(vehicles[0]?.sellersNotes).toBeUndefined();
});

function completeTerms(overrides: Record<string, [string, string]> = {}): Record<string, [string, string]> {
  return {
    make: ["suzuki", "Suzuki"],
    serie: ["carry", "Carry"],
    body: ["pickup", "Pickup"],
    "ca-year": ["1993", "1993"],
    transmission: ["manual", "Manual"],
    mileage: ["12000", "12000"],
    ...overrides,
  };
}

function wxr(...items: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
${items.join("\n")}
</channel>
</rss>`;
}

function listing(input: {
  id: string;
  slug: string;
  title: string;
  date?: string;
  content: string;
  terms: Record<string, [string, string]>;
  meta: Record<string, string>;
}): string {
  const terms = Object.entries(input.terms)
    .filter(([, value]) => value[0])
    .map(
      ([domain, [nicename, label]]) =>
        `<category domain="${domain}" nicename="${nicename}"><![CDATA[${label}]]></category>`,
    )
    .join("");
  const meta = Object.entries(input.meta)
    .map(
      ([key, value]) =>
        `<wp:postmeta><wp:meta_key>${key}</wp:meta_key><wp:meta_value><![CDATA[${value}]]></wp:meta_value></wp:postmeta>`,
    )
    .join("");
  return `<item>
<title>${input.title}</title>
<content:encoded><![CDATA[${input.content}]]></content:encoded>
<wp:post_id>${input.id}</wp:post_id>
<wp:post_date>${input.date ?? "2025-09-17 10:00:00"}</wp:post_date>
<wp:post_date_gmt>${input.date ?? "2025-09-17 10:00:00"}</wp:post_date_gmt>
<wp:post_name>${input.slug}</wp:post_name>
<wp:status>publish</wp:status>
<wp:post_type>listings</wp:post_type>
${terms}
${meta}
</item>`;
}

function attachment(id: string, url: string): string {
  return `<item>
<title>${id}</title>
<wp:post_id>${id}</wp:post_id>
<wp:post_type>attachment</wp:post_type>
<wp:attachment_url>${url}</wp:attachment_url>
<wp:status>inherit</wp:status>
</item>`;
}
