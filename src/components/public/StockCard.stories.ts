import type { Vehicle } from "../../catalogue";
import StockCard from "./StockCard.astro";

const forSale: Vehicle = {
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
  photos: ["https://photos.example/levorg-front.jpg", "https://photos.example/levorg-rear.jpg"],
  sellersNotes: "One owner from Osaka, with a full service history.",
};

export default {
  title: "Public/Stock card",
  component: StockCard,
};

export const ForSale = { args: { vehicle: forSale } };

export const InPrep = {
  args: {
    vehicle: { ...forSale, pricePounds: undefined, availability: "in prep" },
  },
};

export const OnWater = {
  args: {
    vehicle: { ...forSale, pricePounds: undefined, availability: "on water" },
  },
};

export const Sold = {
  args: {
    vehicle: { ...forSale, pricePounds: 8250, availability: "sold" },
  },
};
