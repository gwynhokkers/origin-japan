import type { Catalogue, Lead, Vehicle, VehicleEnquiryInput } from "./catalogue";

export function inMemoryCatalogue(
  records: {
    vehicles?: readonly Vehicle[];
    leads?: readonly Lead[];
  } = {},
): Catalogue {
  const vehicles = records.vehicles ?? [];
  const leads = [...(records.leads ?? [])];

  return {
    async vehicles() {
      return vehicles;
    },
    async leads() {
      return leads;
    },
    async saveVehicleEnquiry(input: VehicleEnquiryInput) {
      const lead: Lead = { id: `lead-${leads.length + 1}`, ...input };
      leads.push(lead);
      return lead;
    },
  };
}
