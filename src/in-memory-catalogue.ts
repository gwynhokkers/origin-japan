import type { Catalogue, Lead, Vehicle } from "./catalogue";

export function inMemoryCatalogue(
  records: {
    vehicles?: readonly Vehicle[];
    leads?: readonly Lead[];
  } = {},
): Catalogue {
  const vehicles = records.vehicles ?? [];
  const leads = records.leads ?? [];

  return {
    async vehicles() {
      return vehicles;
    },
    async leads() {
      return leads;
    },
  };
}
