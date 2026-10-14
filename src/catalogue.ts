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
};

export type Lead = {
  id: string;
};

/** Vehicles and leads a public page can read. Tests stand in for EmDash with memory. */
export type Catalogue = {
  vehicles(): Promise<readonly Vehicle[]>;
  leads(): Promise<readonly Lead[]>;
};
