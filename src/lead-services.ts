export type LeadMail = {
  to: string;
  subject: string;
  text: string;
};

export type LeadServices = {
  /** Present when the page should show the Turnstile widget. */
  siteKey?: string;
  checkSpam: (token: string) => Promise<boolean>;
  sendEmail: (mail: LeadMail) => Promise<void>;
};
