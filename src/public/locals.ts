import type { Catalogue } from "../catalogue";
import type { LeadServices } from "../lead-services";

export function publicLocals(locals: App.Locals): { catalogue: Catalogue; leadServices: LeadServices } {
  if (!locals.catalogue || !locals.leadServices) throw new Error("Public pages need a catalogue");
  return { catalogue: locals.catalogue, leadServices: locals.leadServices };
}
