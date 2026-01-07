import Decimal from "decimal.js";
import { PaymentMethod, RemunerationType } from "./bill.types";
import { Gender } from "./student.types";

export type CommissionTier = {
    id: string;
    teacherId: string;
    minStudents: number;
    maxStudents: number;
    comission: Decimal;
    createdAt: Date;
    updatedAt: Date;
}

export type Teacher = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    cellPhoneNumber: string | null;
    phoneNumber: string | null;
    dateOfBirth: Date | null;
    document: string;
    gender: Gender;
    pronoun: string | null;
    instagramUser: string | null;
    professionalRegister: string | null;
    remunerationType: RemunerationType;
    baseAmount: Decimal;
    paymentDay: number;
    paymentMethod: PaymentMethod | null;
    paymentData: string | null;
    observations: string | null;
    bonusForPresenceAmount: number;
    loseBonusWhenAbsent: boolean;
}
