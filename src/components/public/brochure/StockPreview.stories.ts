import type { Vehicle } from "../../../catalogue";
import StockPreview from "./StockPreview.astro";

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

export default {
  title: "Public/Sections/Stock preview",
  component: StockPreview,
};

export const InStock = {
  args: { heading: "In the showroom", stock: [levorg] },
};
