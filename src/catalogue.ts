export type Vehicle = {
  id: string;
};

export type Lead = {
  id: string;
};

/** Vehicles and leads a public page can read. Tests stand in for EmDash with memory. */
export type Catalogue = {
  vehicles(): Promise<readonly Vehicle[]>;
  leads(): Promise<readonly Lead[]>;
};
