import "next-auth";

export enum Languages {
  pt_BR = "pt_BR",
  en_US = "en_US",
  es_ES = "es_ES",
}

export type Tenancy = {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    documentType: string;
    document: string;
    email: string;
    phoneNumber: string;
    enrollmentFee: number | null;
    language: Languages;
    timezone: string;
    country: string;
    currency: string;
    lastAccess: Date;
}
