/** Availability of a public vehicle. A draft has none. A public price means for sale. */
export type Availability = "in prep" | "on water" | "sold";

export type Vehicle = {
  id: string;
  slug?: string;
  title?: string;
  make?: string;
  model?: string;
  body?: string;
  year?: number;
  transmission?: string;
  mileageMiles?: number;
  pricePounds?: number;
  photos?: readonly string[];
  sellersNotes?: string;
  vin?: string;
  availability?: Availability;
  /** Unfinished. Not on the site, and it has no availability. */
  draft?: boolean;
  /** When the vehicle was published. Newest published is the stock fallback, not the model year. */
  publishedAt?: string;
  /** Adam's order inside the priced group, or inside in-prep and on-water. Lower comes first. */
  order?: number;
};

/** A component Adam places on a brochure page. Buyers read the blocks in this order. */
export type BrochureBlock =
  | { kind: "opening"; body?: string; linkLabel?: string; linkHref?: string }
  | { kind: "section"; heading: string; body?: string }
  | { kind: "stock"; heading?: string }
  | { kind: "reviews"; heading?: string }
  | { kind: "photos"; heading?: string }
  | { kind: "details" }
  | { kind: "exhibit"; caption?: string };

/** Copy Adam edits for one public page. Blocks are the sections he can reorder. */
export type PageCopy = {
  slug: string;
  title?: string;
  body?: string;
  blocks?: readonly BrochureBlock[];
};

/** A short review with the reviewer's name. */
export type Review = {
  name: string;
  quote: string;
};

/** A photo on the personal import page. It is not a vehicle. */
export type ImportPhoto = {
  src: string;
  alt?: string;
};

/** Pages, reviews, and import photos. An omitted list keeps the public default. */
export type SiteContent = {
  pages?: readonly PageCopy[];
  reviews?: readonly Review[];
  googleReviewsUrl?: string;
  importPhotos?: readonly ImportPhoto[];
};

/** A vehicle enquiry names one vehicle. Adam reads it in the admin. */
export type Lead = {
  id: string;
  vehicle?: string;
  firstName?: string;
  email?: string;
  message?: string;
};

export type VehicleEnquiryInput = {
  vehicle: string;
  firstName: string;
  email: string;
  message: string;
};

/** Vehicles and leads a public page can read. Tests stand in for EmDash with memory. */
export type Catalogue = {
  vehicles(): Promise<readonly Vehicle[]>;
  leads(): Promise<readonly Lead[]>;
  saveVehicle(vehicle: Vehicle): Promise<void>;
  saveVehicleEnquiry(input: VehicleEnquiryInput): Promise<Lead>;
  siteContent(): Promise<SiteContent>;
};
