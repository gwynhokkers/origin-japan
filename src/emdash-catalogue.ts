import { getEmDashCollection } from "emdash";
import type { Catalogue, Lead, Vehicle } from "./catalogue";

export const emdashCatalogue: Catalogue = {
  vehicles: () => list("vehicles"),
  leads: () => list("leads"),
};

async function list(collection: string): Promise<readonly Vehicle[] | readonly Lead[]> {
  const { entries, error } = await getEmDashCollection(collection);
  if (error) throw error;

  return entries.map((entry) => ({ id: entry.id }));
}
