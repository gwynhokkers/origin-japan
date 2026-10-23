import type { Catalogue, Lead, SiteContent, SiteNavigation, Vehicle, VehicleEnquiryInput } from "./catalogue";

export function inMemoryCatalogue(
  records: {
    vehicles?: readonly Vehicle[];
    leads?: readonly Lead[];
    site?: SiteContent;
    navigation?: SiteNavigation;
  } = {},
): Catalogue {
  const vehicles = [...(records.vehicles ?? [])];
  const leads = [...(records.leads ?? [])];
  const site = records.site ?? {};
  const navigation = records.navigation ?? {};

  return {
    async vehicles() {
      return vehicles;
    },
    async saveVehicle(vehicle) {
      const index = vehicles.findIndex((existing) => existing.slug === vehicle.slug);
      if (index === -1) {
        vehicles.push(vehicle);
        return;
      }
      vehicles[index] = { ...vehicle, id: vehicles[index]?.id ?? vehicle.id };
    },
    async leads() {
      return leads;
    },
    async saveVehicleEnquiry(input: VehicleEnquiryInput) {
      const lead: Lead = { id: `lead-${leads.length + 1}`, ...input };
      leads.push(lead);
      return lead;
    },
    async siteContent() {
      return site;
    },
    async navigation() {
      return navigation;
    },
  };
}
