import StockFilters from "./StockFilters.astro";

export default {
  title: "Public/Molecules/Stock filters",
  component: StockFilters,
};

const choices = {
  makes: ["Honda", "Subaru", "Toyota"],
  models: [],
  bodies: ["Coupe", "MPV", "Estate"],
  years: [2016, 2013, 1997],
  transmissions: ["Manual", "Automatic"],
  grades: ["4.5", "4"],
};

export const Showroom = { args: { base: "/showroom", filters: {}, choices } };

export const MakeChosen = {
  args: {
    base: "/showroom",
    filters: { make: "Toyota", mileageMax: 90000 },
    choices: { ...choices, models: ["Estima Aeras", "Supra RZ"] },
    sort: "price",
  },
};

export const SoldStock = { args: { base: "/sold", filters: {}, choices } };
