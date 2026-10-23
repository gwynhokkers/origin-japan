import VehicleEnquiry from "./VehicleEnquiry.astro";

const slug = "subaru-levorg-2-0-gt-s";

export default {
  title: "Public/Vehicle enquiry",
  component: VehicleEnquiry,
};

export const Empty = {
  args: { slug },
};

export const FieldError = {
  args: {
    slug,
    view: {
      values: { "first-name": "", email: "ada@example.com", message: "Is the Levorg still available?" },
      errors: { "first-name": "Enter your first name." },
    },
  },
};

export const Confirmation = {
  args: {
    slug,
    view: { confirmed: true },
  },
};
