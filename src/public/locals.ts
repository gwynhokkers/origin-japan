import type { Catalogue } from "../catalogue";
import type { EnquiryServices } from "../enquiry-services";

export function publicLocals(locals: App.Locals): { catalogue: Catalogue; enquiry: EnquiryServices } {
  if (!locals.catalogue || !locals.enquiry) throw new Error("Public pages need a catalogue");
  return { catalogue: locals.catalogue, enquiry: locals.enquiry };
}
