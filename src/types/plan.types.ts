export enum PlanType {
  BI_WEEKLY = "BI_WEEKLY",
  MONTHLY = "MONTHLY",
  BI_MONTHLY = "BI_MONTHLY",
  QUARTERLY = "QUARTERLY",
  SEMMONTHLY = "SEMMONTLY",
  ANNUAL = "ANNUAL",
  BI_ANNUAL = "BI_ANNUAL"
}

export type Plan = {
    type: PlanType;
    name: string;
    id: string;
    tenancyId: string;
    frequency: number;
    amount: number;
    isActive: boolean;
    monthlyInterest: number;
    finePercentage: number;
    discountPercentage: number;
    maximumDiscountPeriod: number;
    interestGracePeriod: number;
    fineGracePeriod: number;
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELED = "CANCELED",
  FINISHED = "FINISHED"
}

export type Subscription = {
    id: string;
    tenancyId: string;
    studentId: string;
    planId: string;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date | null;
    cancellationDate: Date | null;
}

