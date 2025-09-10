import { Gender } from "@prisma/client";

export type AddressFormData = {
  publicPlace: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

export type GuardianFormData = {
  firstName: string;
  lastName: string;
  relationship: string;
  cellPhoneNumber: string;
  phoneNumber?: string;
  email: string;
  document?: string;
};

export type StudentFormState = {
  firstName: string;
  lastName: string;
  gender: Gender | null;
  pronoun?: string;
  dateOfBirth?: Date;
  cellPhoneNumber: string;
  phoneNumber?: string;
  email: string;
  image?: string;
  documentOfIdentity?: string;
  howDidYouKnowUs?: string;
  instagramUser?: string;
  healthProblems?: string;
  medicalAdvice?: string;
  painOrDiscomfort?: string;
  canLeaveAlone: boolean;
  haveGuardian: boolean;
  address: AddressFormData;
  guardians: GuardianFormData[];
};
