export type EnquiryMail = {
  to: string;
  subject: string;
  text: string;
};

export type EnquiryServices = {
  /** Present when the page should show the Turnstile widget. */
  siteKey?: string;
  checkSpam: (token: string) => Promise<boolean>;
  sendEmail: (mail: EnquiryMail) => Promise<void>;
};
