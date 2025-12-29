export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    NON_BINARY = "NON_BINARY",
    OTHER = "OTHER"
}

export type Student = {
    email: string | null;
    image: string | null;
    id: string;
    tenancyId: string;
    firstName: string;
    lastName: string;
    cellPhoneNumber: string;
    phoneNumber: string | null;
    dateOfBirth: string;
    documentOfIdentity: string;
    gender: Gender;
    pronoun: string | null;
    howDidYouMeetUs: string | null;
    instagramUser: string | null;
    healthProblems: string | null;
    medicalAdvice: string | null;
    painOrDiscomfort: string | null;
    canLeaveAlone: boolean;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type StudentGuardian = {
    id: string;
    firstName: string;
    lastName: string;
    cellPhoneNumber: string;
    phoneNumber: string | null;
    email: string | null;
    relationShip: string;
    documentOfIdentity: string | null;
    studentId: string;
}

export type StudentWithFullName = Student & { fullName: string };

export type StudentClass = {
    id: string;
    status:  "ACTIVE" | "INACTIVE" | "CANCELED";
    studentId: string;
    classId: string;
    enrolledAt: Date;
    leftAt: Date | null;
}

export type StudentHistory = {
    id: string;
    description: string;
    studentId: string;
    createdAt: Date;
}