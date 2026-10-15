import VehicleGallery from "./VehicleGallery.astro";

const title = "Subaru Levorg 2.0 GT-S 2016";

export default {
  title: "Public/Sections/Vehicle gallery",
  component: VehicleGallery,
};

export const SeveralPhotos = {
  args: {
    title,
    photos: [
      "https://photos.example/levorg-front.jpg",
      "https://photos.example/levorg-rear.jpg",
      "https://photos.example/levorg-interior.jpg",
    ],
  },
};

export const OnePhoto = {
  args: {
    title,
    photos: ["https://photos.example/levorg-front.jpg"],
  },
};
