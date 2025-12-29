import { Address } from "@/types/address.types";
import { Sale } from "@/types/sale.types";
import { Bill } from "@/types/bill.types";
import { Class } from "@/types/class.types";
import { StudentContract } from "@/types/contracts.types";
import { Plan, Subscription } from "@/types/plan.types";
import { Student, StudentGuardian, StudentHistory } from "@/types/student.types";

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
  address: Address;
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
