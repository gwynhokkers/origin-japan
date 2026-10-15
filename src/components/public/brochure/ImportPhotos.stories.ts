import ImportPhotos from "./ImportPhotos.astro";

export default {
  title: "Public/Sections/Import photos",
  component: ImportPhotos,
};

export const SeveralPhotos = {
  args: {
    heading: "Previous personal imports",
    photos: [
      { src: "https://photos.example/import-1.jpg", alt: "A white estate at the docks" },
      { src: "https://photos.example/import-2.jpg", alt: "A dark coupe on the trailer" },
      { src: "https://photos.example/import-3.jpg", alt: "A silver saloon in the yard" },
    ],
  },
};
