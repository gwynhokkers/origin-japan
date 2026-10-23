import type { Catalogue, ContactLeadInput, ImportRequestInput, LeadInput, Vehicle, VehicleEnquiryInput } from "../catalogue";
import type { LeadServices } from "../lead-services";
import { leadInbox } from "./contact";
import { isOnStock } from "./vehicles";

/** Form values and errors are keyed by the field's name in the form. */
export type LeadView = {
  confirmed?: boolean;
  spamRejected?: boolean;
  saveFailed?: boolean;
  values?: Readonly<Record<string, string>>;
  errors?: Readonly<Record<string, string>>;
};

export type LeadResult = { status: number; view?: LeadView };

type Values = Readonly<Record<string, string>>;

type LeadKind<L extends LeadInput> = {
  fields: readonly string[];
  errors(values: Values): Record<string, string>;
  lead(values: Values): L;
  mail(lead: L): { subject: string; text: string };
};

export function receiveVehicleEnquiry(
  request: Request,
  vehicle: Vehicle,
  catalogue: Catalogue,
  services: LeadServices,
): Promise<LeadResult> {
  if (!isOnStock(vehicle)) return Promise.resolve({ status: 400 });
  const form: LeadKind<VehicleEnquiryInput> = {
    fields: ["first-name", "email", "message"],
    errors: (values) => ({
      ...required(values, "first-name", "Enter your first name."),
      ...emailError(values),
      ...required(values, "message", "Enter a message."),
    }),
    lead: (values) => ({
      kind: "vehicle enquiry",
      vehicle: vehicle.title?.trim() ?? "",
      firstName: values["first-name"] ?? "",
      email: values.email ?? "",
      message: values.message ?? "",
    }),
    mail: (lead) => ({
      subject: `Vehicle enquiry: ${lead.vehicle}`,
      text: [
        `Vehicle: ${lead.vehicle}`,
        `First name: ${lead.firstName}`,
        `Email: ${lead.email}`,
        "Message:",
        lead.message,
      ].join("\n"),
    }),
  };
  return receiveLead(request, form, catalogue, services);
}

export function receiveContactLead(
  request: Request,
  catalogue: Catalogue,
  services: LeadServices,
): Promise<LeadResult> {
  const form: LeadKind<ContactLeadInput> = {
    fields: ["first-name", "surname", "email", "phone", "message"],
    errors: (values) => ({
      ...required(values, "first-name", "Enter your first name."),
      ...emailError(values),
      ...required(values, "message", "Enter a message."),
    }),
    lead: (values) => ({
      kind: "contact lead",
      firstName: values["first-name"] ?? "",
      surname: values.surname || undefined,
      email: values.email ?? "",
      phone: values.phone || undefined,
      message: values.message ?? "",
    }),
    mail: (lead) => ({
      subject: `Contact lead: ${[lead.firstName, lead.surname].filter(Boolean).join(" ")}`,
      text: [
        `First name: ${lead.firstName}`,
        `Surname: ${lead.surname ?? ""}`,
        `Email: ${lead.email}`,
        `Phone: ${lead.phone ?? ""}`,
        "Message:",
        lead.message,
      ].join("\n"),
    }),
  };
  return receiveLead(request, form, catalogue, services);
}

export function receiveImportRequest(
  request: Request,
  catalogue: Catalogue,
  services: LeadServices,
): Promise<LeadResult> {
  const form: LeadKind<ImportRequestInput> = {
    fields: ["first-name", "email", "phone", "make", "model", "year", "message"],
    errors: (values) => ({
      ...required(values, "first-name", "Enter your first name."),
      ...emailError(values),
      ...required(values, "make", "Enter the make."),
      ...required(values, "model", "Enter the model."),
      ...yearError(values),
      ...required(values, "message", "Enter a message."),
    }),
    lead: (values) => ({
      kind: "import request",
      firstName: values["first-name"] ?? "",
      email: values.email ?? "",
      phone: values.phone || undefined,
      make: values.make ?? "",
      model: values.model ?? "",
      year: Number(values.year),
      message: values.message ?? "",
    }),
    mail: (lead) => ({
      subject: `Import request: ${lead.make} ${lead.model} ${lead.year}`,
      text: [
        `First name: ${lead.firstName}`,
        `Email: ${lead.email}`,
        `Phone: ${lead.phone ?? ""}`,
        `Make: ${lead.make}`,
        `Model: ${lead.model}`,
        `Year: ${lead.year}`,
        "Message:",
        lead.message,
      ].join("\n"),
    }),
  };
  return receiveLead(request, form, catalogue, services);
}

/** Checks the fields, then the spam check, then saves. A lead that saved is confirmed even if the email fails. */
async function receiveLead<L extends LeadInput>(
  request: Request,
  form: LeadKind<L>,
  catalogue: Catalogue,
  services: LeadServices,
): Promise<LeadResult> {
  const data = await request.formData();
  const values = Object.fromEntries(form.fields.map((field) => [field, fieldText(data, field)]));
  const errors = form.errors(values);
  if (Object.keys(errors).length > 0) return { status: 400, view: { values, errors } };

  let accepted = false;
  try {
    accepted = await services.checkSpam(fieldText(data, "cf-turnstile-response"));
  } catch {
    accepted = false;
  }
  if (!accepted) return { status: 400, view: { values, spamRejected: true } };

  const lead = form.lead(values);
  try {
    await catalogue.saveLead(lead);
  } catch (error) {
    console.error(`A ${lead.kind} could not be saved`, error);
    return { status: 500, view: { values, saveFailed: true } };
  }
  try {
    await services.sendEmail({ to: leadInbox, ...form.mail(lead) });
  } catch (error) {
    console.error(`The ${lead.kind} email failed after the lead was saved`, error);
  }
  return { status: 200, view: { confirmed: true } };
}

function required(values: Values, field: string, message: string): Record<string, string> {
  return values[field] ? {} : { [field]: message };
}

function emailError(values: Values): Record<string, string> {
  if (!values.email) return { email: "Enter your email." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return { email: "Enter a valid email address." };
  return {};
}

function yearError(values: Values): Record<string, string> {
  const text = values.year ?? "";
  if (!text) return { year: "Enter the year." };
  const year = Number(text);
  const latest = new Date().getFullYear() + 1;
  if (!/^\d{4}$/.test(text) || year < 1900 || year > latest) return { year: "Enter a year such as 1997." };
  return {};
}

function fieldText(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}
