import Reviews from "./Reviews.astro";

export default {
  title: "Public/Sections/Reviews",
  component: Reviews,
};

export const TwoReviews = {
  args: {
    heading: "Brilliant reviews",
    googleHref: "https://www.google.com/search?q=Origin+Japan",
    reviews: [
      { name: "Ada Lovelace", quote: "Straightforward from the first call." },
      { name: "Grace Hopper", quote: "The car arrived as described." },
    ],
  },
};
