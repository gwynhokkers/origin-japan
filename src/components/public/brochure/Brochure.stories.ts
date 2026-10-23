import type { BrochureBlock, Vehicle } from "../../../catalogue";
import Brochure from "./Brochure.astro";

const levorg: Vehicle = {
  id: "levorg-2016",
  slug: "subaru-levorg-2-0-gt-s",
  title: "Subaru Levorg 2.0 GT-S 2016",
  make: "Subaru",
  model: "Levorg 2.0 GT-S",
  body: "Estate",
  year: 2016,
  transmission: "Automatic",
  mileageMiles: 42000,
  pricePounds: 11495,
  photos: ["https://photos.example/levorg-front.jpg"],
  sellersNotes: "One owner from Osaka, with a full service history.",
};

const blocks: BrochureBlock[] = [
  {
    kind: "opening",
    body: "Cars already in the UK, and personal imports from Japan.",
    linkLabel: "Current stock",
    linkHref: "/showroom",
  },
  {
    kind: "section",
    heading: "Already in the UK",
    body: "These cars are here, inspected, and ready to view.",
  },
  {
    kind: "feature",
    heading: "Personal imports",
    body: "We bid at the Japanese auctions for you.",
    image: { src: "/images/home-dusk-row-2000.jpg", alt: "A row of imported cars at dusk" },
    linkLabel: "Personal Import Service",
    linkHref: "/personal-import",
  },
  { kind: "stock", heading: "In the showroom" },
  { kind: "reviews", heading: "Brilliant reviews" },
];

export default {
  title: "Public/Sections/Brochure",
  component: Brochure,
};

export const Home = {
  args: {
    page: "home",
    title: "Japanese cars, bought properly",
    blocks,
    stock: [levorg],
    reviews: [
      { name: "Ada Lovelace", quote: "Straightforward from the first call." },
      { name: "Grace Hopper", quote: "The car arrived as described." },
    ],
    googleHref: "https://www.google.com/search?q=Origin+Japan",
    photos: [],
  },
};
