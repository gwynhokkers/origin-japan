import type { Catalogue, Vehicle } from "../catalogue";
import type { EnquiryServices } from "../enquiry-services";
import { enquiryInbox } from "./contact";
import { isOnStock } from "./vehicles";

export type EnquiryValues = { firstName: string; email: string; message: string };

export type EnquiryView = {
  confirmed?: boolean;
  spamRejected?: boolean;
  values?: EnquiryValues;
  errors?: { firstName?: string; email?: string; message?: string };
};

export async function receiveVehicleEnquiry(
  request: Request,
  vehicle: Vehicle,
  catalogue: Catalogue,
  services: EnquiryServices,
): Promise<{ status: number; view?: EnquiryView }> {
  if (!isOnStock(vehicle)) return { status: 400 };

  const form = await request.formData();
  const values = {
    firstName: fieldText(form, "first-name"),
    email: fieldText(form, "email"),
    message: fieldText(form, "message"),
  };
  const errors = enquiryErrors(values);
  if (errors) return { status: 400, view: { values, errors } };

  let accepted = false;
  try {
    accepted = await services.checkSpam(fieldText(form, "cf-turnstile-response"));
  } catch {
    accepted = false;
  }
  if (!accepted) return { status: 400, view: { values, spamRejected: true } };

  const lead = await catalogue.saveVehicleEnquiry({
    vehicle: vehicle.title?.trim() ?? "",
    ...values,
  });
  try {
    await services.sendEmail({
      to: enquiryInbox,
      subject: `Vehicle enquiry: ${lead.vehicle ?? ""}`,
      text: [
        `Vehicle: ${lead.vehicle ?? ""}`,
        `First name: ${lead.firstName ?? ""}`,
        `Email: ${lead.email ?? ""}`,
        "Message:",
        lead.message ?? "",
      ].join("\n"),
    });
  } catch (error) {
    console.error("Vehicle enquiry email failed after the lead was saved", error);
  }
  return { status: 200, view: { confirmed: true } };
}

export function enquiryErrors(values: EnquiryValues): EnquiryView["errors"] | undefined {
  const errors: NonNullable<EnquiryView["errors"]> = {};
  if (!values.firstName) errors.firstName = "Enter your first name.";
  if (!values.email) errors.email = "Enter your email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email address.";
  if (!values.message) errors.message = "Enter a message.";
  return errors.firstName || errors.email || errors.message ? errors : undefined;
}

function fieldText(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}
