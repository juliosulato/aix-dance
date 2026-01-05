import { Address } from "./address.types";
import { Bill } from "./bill.types";
import { Class } from "./class.types";
import { StudentContract } from "./contracts.types";
import { Plan, Subscription } from "./plan.types";

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    NON_BINARY = "NON_BINARY",
    OTHER = "OTHER"
}

export type Student = {
    id: string;
    firstName: string;
    lastName: string;
    image: string | null;
    cellPhoneNumber: string;
    email: string | null;
    phoneNumber: string | null;
    dateOfBirth: Date;
    documentOfIdentity: string;
    gender: Gender;
    pronoun: string | null;
    howDidYouMeetUs: string | null;
    instagramUser: string | null;
    healthProblems: string | null;
    medicalAdvice: string | null;
    painOrDiscomfort: string | null;
    canLeaveAlone: boolean;
    attendanceAverage: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    tenancyId: string;
}

export type StudentGuardian = {
    relationship: string;
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

export type StudentComplete = Student & {    
    address: Address;
    guardian: StudentGuardian[];
    classes: Class[];
    subscriptions: (Subscription & {
        plan: Plan;
    })[];
    history: StudentHistory[];
    contracts: StudentContract[];
    bills: Bill[];
}