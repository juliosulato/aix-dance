import { Address as AddressPrisma, Bill, Class, Student, StudentContract, StudentGuardian, StudentHistory, Sale, Subscription, Plan } from "@prisma/client";

type BillWithPenalty = Bill & {
  originalAmount?: number | null;
  penaltyAmount?: number | null;
  penaltyApplied?: boolean | null;
  penaltyExempted?: boolean | null;
  penaltyExemptedBy?: string | null;
  penaltyExemptedAt?: Date | null;
  penaltyExemptedReason?: string | null;
};

export interface StudentFromApi extends Student {
  address: AddressPrisma;
  guardian: StudentGuardian[];
  classes: Class[];
  attendanceAverage: number;
  bills: BillWithPenalty[];
  sales: Sale[];
  history: StudentHistory[];
  contracts: StudentContract[];
  subscriptions: (Subscription & {
    plan: Plan | null;
  })[];
}
