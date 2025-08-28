import { z } from "zod";

const guardianSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  cellPhoneNumber: z.string(),
  relationship: z.string().optional(),
  phoneNumber: z.string().optional(),
  documentOfIdentity: z.string().optional(),
});

const addressSchema = z.object({
  publicPlace: z.string(),
  number: z.string(),
  complement: z.string().optional(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
});

const studentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER"]),
  cellPhoneNumber: z.string(),
  pronoun: z.string().optional(),
  dateOfBirth: z.string(),
  phoneNumber: z.string().optional(),
  image: z.url().optional(),
  documentOfIdentity: z.string().optional(),
  email: z.email(),
  howDidYouMeetUs: z.string().optional(),
  instagramUser: z.string().optional(),
  healthProblems: z.string().optional(),
  medicalAdvice: z.string().optional(),
  painOrDiscomfort: z.string().optional(),
  canLeaveAlone: z.boolean().default(true).optional(),
  address: addressSchema,
  guardian: z.array(guardianSchema).optional(),
});


export { studentSchema };
export type CreateStudentFormData = z.infer<typeof studentSchema>;
export type UpdateStudentFormData = z.infer<typeof studentSchema.partial>;