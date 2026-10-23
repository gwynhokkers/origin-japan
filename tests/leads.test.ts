import { expect, test } from "vitest";
import type { Catalogue } from "../src/catalogue";
import type { LeadMail, LeadServices } from "../src/lead-services";
import { inMemoryCatalogue } from "../src/in-memory-catalogue";
import { requestPublicPage } from "./buyer-page";

test("the contact page offers a contact lead form that links to the privacy page", async () => {
  const html = await pageText("/contact");
  const form = formNamed(html, "Send a message");

  for (const field of ["first-name", "surname", "email", "phone", "message"]) {
    expect(form).toContain(`id="${field}"`);
  }
  expect(form).toContain('href="/privacy"');
  expect(form).toContain("Send message");
});

test("the personal import page offers an import request form that links to the privacy page", async () => {
  const html = await pageText("/personal-import");
  const form = formNamed(html, "Request a personal import");

  for (const field of ["first-name", "email", "phone", "make", "model", "year", "message"]) {
    expect(form).toContain(`id="${field}"`);
  }
  expect(form).not.toContain('id="surname"');
  expect(form).toContain('href="/privacy"');
  expect(form).toContain("Send import request");
});

test("a contact lead with only first name, email, and message is saved, confirmed, and emailed", async () => {
  const catalogue = inMemoryCatalogue();
  const sent: LeadMail[] = [];

  const response = await post("/contact", catalogue, mailbox(sent), {
    "first-name": "Ada",
    email: "ada@example.com",
    message: "Do you service imports you did not sell?",
  });
  const html = await response.text();

  expect(response.status).toBe(200);
  expect(html).toContain("Your message has been sent.");
  expect(html).not.toContain('aria-label="Send a message"');
  expect(await catalogue.leads()).toEqual([
    {
      id: "lead-1",
      kind: "contact lead",
      firstName: "Ada",
      email: "ada@example.com",
      message: "Do you service imports you did not sell?",
    },
  ]);
  expect(sent).toEqual([
    {
      to: "info@originjapan.co.uk",
      subject: "Contact lead: Ada",
      text: [
        "First name: Ada",
        "Surname: ",
        "Email: ada@example.com",
        "Phone: ",
        "Message:",
        "Do you service imports you did not sell?",
      ].join("\n"),
    },
  ]);
});

test("a contact lead keeps the surname and phone when the buyer gives them", async () => {
  const catalogue = inMemoryCatalogue();

  await post("/contact", catalogue, mailbox([]), {
    "first-name": "Ada",
    surname: "Lovelace",
    email: "ada@example.com",
    phone: "07700 900123",
    message: "Please call me back.",
  });

  expect(await catalogue.leads()).toEqual([
    {
      id: "lead-1",
      kind: "contact lead",
      firstName: "Ada",
      surname: "Lovelace",
      email: "ada@example.com",
      phone: "07700 900123",
      message: "Please call me back.",
    },
  ]);
});

test("a contact lead rejects a missing first name, email, or message under that field", async () => {
  const catalogue = inMemoryCatalogue();
  const complete = { "first-name": "Ada", email: "ada@example.com", message: "Hello" };
  const cases = [
    { omit: "first-name", error: "Enter your first name.", next: 'id="surname"' },
    { omit: "email", error: "Enter your email.", next: 'id="phone"' },
    { omit: "message", error: "Enter a message.", next: "Send message" },
  ];

  for (const item of cases) {
    const fields: Record<string, string> = { ...complete };
    delete fields[item.omit];
    const response = await post("/contact", catalogue, mailbox([]), fields);
    const html = await response.text();

    expect(response.status, item.omit).toBe(400);
    expectErrorUnderField(html, item.omit, item.error, item.next);
    expect(html).not.toContain("Your message has been sent.");
  }
  expect(await catalogue.leads()).toEqual([]);
});

test("an import request with phone left out is saved, confirmed, and emailed", async () => {
  const catalogue = inMemoryCatalogue();
  const sent: LeadMail[] = [];

  const response = await post("/personal-import", catalogue, mailbox(sent), importFields());
  const html = await response.text();

  expect(response.status).toBe(200);
  expect(html).toContain("Your import request has been sent.");
  expect(html).not.toContain('aria-label="Request a personal import"');
  expect(await catalogue.leads()).toEqual([
    {
      id: "lead-1",
      kind: "import request",
      firstName: "Ada",
      email: "ada@example.com",
      make: "Toyota",
      model: "Supra RZ",
      year: 1997,
      message: "Manual, grade 4 or better.",
    },
  ]);
  expect(sent).toEqual([
    {
      to: "info@originjapan.co.uk",
      subject: "Import request: Toyota Supra RZ 1997",
      text: [
        "First name: Ada",
        "Email: ada@example.com",
        "Phone: ",
        "Make: Toyota",
        "Model: Supra RZ",
        "Year: 1997",
        "Message:",
        "Manual, grade 4 or better.",
      ].join("\n"),
    },
  ]);
});

test("an import request rejects a missing first name, email, make, model, year, or message under that field", async () => {
  const catalogue = inMemoryCatalogue();
  const cases = [
    { omit: "first-name", error: "Enter your first name.", next: 'id="email"' },
    { omit: "email", error: "Enter your email.", next: 'id="phone"' },
    { omit: "make", error: "Enter the make.", next: 'id="model"' },
    { omit: "model", error: "Enter the model.", next: 'id="year"' },
    { omit: "year", error: "Enter the year.", next: 'id="message"' },
    { omit: "message", error: "Enter a message.", next: "Send import request" },
  ];

  for (const item of cases) {
    const fields: Record<string, string> = importFields();
    delete fields[item.omit];
    const response = await post("/personal-import", catalogue, mailbox([]), fields);
    const html = await response.text();

    expect(response.status, item.omit).toBe(400);
    expectErrorUnderField(html, item.omit, item.error, item.next);
    expect(html).not.toContain("Your import request has been sent.");
  }
  expect(await catalogue.leads()).toEqual([]);
});

test("an import request rejects a year that is not a model year", async () => {
  const catalogue = inMemoryCatalogue();

  for (const year of ["nineties", "97", "3000"]) {
    const response = await post("/personal-import", catalogue, mailbox([]), { ...importFields(), year });
    const html = await response.text();

    expect(response.status, year).toBe(400);
    expectErrorUnderField(html, "year", "Enter a year such as 1997.", 'id="message"');
  }
  expect(await catalogue.leads()).toEqual([]);
});

test("a failed Turnstile check rejects a contact lead or an import request without saving it", async () => {
  const cases = [
    { path: "/contact", fields: { "first-name": "Ada", email: "ada@example.com", message: "Hello" } },
    { path: "/personal-import", fields: importFields() },
  ];

  for (const item of cases) {
    const catalogue = inMemoryCatalogue();
    let emailed = false;
    const response = await post(
      item.path,
      catalogue,
      {
        checkSpam: async (token) => token === "pass",
        sendEmail: async () => {
          emailed = true;
        },
      },
      { ...item.fields, "cf-turnstile-response": "fail" },
    );
    const html = await response.text();

    expect(response.status, item.path).toBe(400);
    expect(html).toContain("The spam check was not accepted.");
    expect(html).not.toContain("has been sent.");
    expect(await catalogue.leads()).toEqual([]);
    expect(emailed).toBe(false);
  }
});

test("a failed email still confirms a contact lead or an import request and keeps it", async () => {
  const cases = [
    {
      path: "/contact",
      fields: { "first-name": "Ada", email: "ada@example.com", message: "Hello" },
      confirmation: "Your message has been sent.",
      kind: "contact lead",
    },
    {
      path: "/personal-import",
      fields: importFields(),
      confirmation: "Your import request has been sent.",
      kind: "import request",
    },
  ];

  for (const item of cases) {
    const catalogue = inMemoryCatalogue();
    const response = await post(
      item.path,
      catalogue,
      {
        checkSpam: async () => true,
        sendEmail: async () => {
          throw new Error("mailbox unavailable");
        },
      },
      item.fields,
    );

    expect(response.status, item.path).toBe(200);
    expect(await response.text()).toContain(item.confirmation);
    expect((await catalogue.leads()).map((lead) => lead.kind)).toEqual([item.kind]);
  }
});

test("a lead that could not be saved shows an error on the form and is not emailed", async () => {
  const cases = [
    { path: "/contact", fields: { "first-name": "Ada", email: "ada@example.com", message: "Hello" } },
    { path: "/personal-import", fields: importFields() },
  ];

  for (const item of cases) {
    const sent: LeadMail[] = [];
    const catalogue: Catalogue = {
      ...inMemoryCatalogue(),
      async saveLead() {
        throw new Error("database unavailable");
      },
    };
    const response = await post(item.path, catalogue, mailbox(sent), item.fields);
    const html = await response.text();

    expect(response.status, item.path).toBe(500);
    expect(html).toContain("Your message could not be sent. Please try again.");
    expect(html).toContain('value="ada@example.com"');
    expect(html).not.toContain("has been sent.");
    expect(sent).toEqual([]);
  }
});

test("privacy is a public page that says what happens to a lead", async () => {
  const html = await pageText("/privacy");

  expect(html).toContain("phone");
  expect(html).toContain("emailed to info@originjapan.co.uk");
});

function importFields(): Record<string, string> {
  return {
    "first-name": "Ada",
    email: "ada@example.com",
    make: "Toyota",
    model: "Supra RZ",
    year: "1997",
    message: "Manual, grade 4 or better.",
  };
}

function mailbox(sent: LeadMail[]): LeadServices {
  return {
    checkSpam: async (token) => token === "pass",
    sendEmail: async (mail) => {
      sent.push(mail);
    },
  };
}

function post(
  path: string,
  catalogue: Catalogue,
  services: LeadServices,
  fields: Record<string, string>,
): Promise<Response> {
  return requestPublicPage(
    new Request(`http://originjapan.test${path}`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ "cf-turnstile-response": "pass", ...fields }),
    }),
    catalogue,
    services,
  );
}

async function pageText(path: string): Promise<string> {
  const response = await requestPublicPage(new Request(`http://originjapan.test${path}`), inMemoryCatalogue());
  expect(response.status).toBe(200);
  return response.text();
}

function formNamed(html: string, label: string): string {
  const start = html.indexOf(`aria-label="${label}"`);
  expect(start, label).toBeGreaterThan(-1);
  return html.slice(start, html.indexOf("</form>", start));
}

function expectErrorUnderField(html: string, field: string, error: string, next: string): void {
  const fieldAt = html.indexOf(`id="${field}"`);
  const errorAt = html.indexOf(error);
  const nextAt = html.indexOf(next, fieldAt + 1);

  expect(fieldAt, field).toBeGreaterThan(-1);
  expect(errorAt, error).toBeGreaterThan(fieldAt);
  expect(nextAt, next).toBeGreaterThan(errorAt);
}
