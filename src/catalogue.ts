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

export type Lead = {
  id: string;
};

/** Vehicles and leads a public page can read. Tests stand in for EmDash with memory. */
export type Catalogue = {
  vehicles(): Promise<readonly Vehicle[]>;
  leads(): Promise<readonly Lead[]>;
};
