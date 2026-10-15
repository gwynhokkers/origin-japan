/// <reference types="astro/client" />

import type { Catalogue } from "./catalogue";
import type { EnquiryServices } from "./enquiry-services";

declare global {
  namespace App {
    interface Locals {
      catalogue: Catalogue;
      enquiry: EnquiryServices;
    }
  }
}

export {};
