/// <reference types="astro/client" />

import type { Catalogue } from "./catalogue";
import type { LeadServices } from "./lead-services";

declare global {
  namespace App {
    interface Locals {
      catalogue: Catalogue;
      leadServices: LeadServices;
    }
  }
}

export {};
