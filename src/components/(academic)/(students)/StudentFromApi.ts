import { Address as AddressPrisma, Bill, Class, Student, StudentContract, StudentGuardian, StudentHistory, Sale, Subscription, Plan } from "@prisma/client";

export interface StudentFromApi extends Student {
  address: AddressPrisma;
  guardian: StudentGuardian[];
  classes: Class[];
  attendanceAverage: number;
  bills: Bill[];
  sales: Sale[];
  history: StudentHistory[];
  contracts: StudentContract[];
  subscriptions: (Subscription & {
    plan: Plan | null;
  })[];
}
