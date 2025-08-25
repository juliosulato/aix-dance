-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "base";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "contracts";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "financial";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tenancy";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "users";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "utils";

-- CreateEnum
CREATE TYPE "base"."Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'OTHER');

-- CreateEnum
CREATE TYPE "tenancy"."Languages" AS ENUM ('pt_BR', 'en_US', 'es_ES');

-- CreateEnum
CREATE TYPE "tenancy"."DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "tenancy"."PlanType" AS ENUM ('BI_WEEKLY', 'MONTHLY', 'BI_MONTHLY', 'QUARTERLY', 'SEMMONTLY', 'ANNUAL', 'BI_ANNUAL');

-- CreateEnum
CREATE TYPE "users"."UserRole" AS ENUM ('GESTOR', 'PROFESSOR', 'SECRETARIA');

-- CreateEnum
CREATE TYPE "financial"."BillType" AS ENUM ('PAYABLE', 'RECEIVABLE');

-- CreateEnum
CREATE TYPE "financial"."BillStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "financial"."RecurrenceType" AS ENUM ('NONE', 'MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "financial"."BillNature" AS ENUM ('REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "financial"."BillCategoryType" AS ENUM ('FIXED', 'VARIABLE');

-- CreateTable
CREATE TABLE "base"."Address" (
    "id" TEXT NOT NULL,
    "zipCode" TEXT,
    "publicPlace" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "studentId" TEXT,
    "tenancyId" TEXT NOT NULL,
    "userId" TEXT,
    "supplierId" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base"."Supplier" (
    "id" TEXT NOT NULL,
    "tenancyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "corporateReason" TEXT,
    "documentType" TEXT,
    "document" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "cellPhoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."Tenancy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "language" "tenancy"."Languages" NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "country" TEXT NOT NULL DEFAULT 'BR',
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAccess" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."Student" (
    "id" TEXT NOT NULL,
    "tenancyId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "cellPhoneNumber" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "dateOfBirth" TEXT NOT NULL,
    "documentOfIdentity" TEXT NOT NULL,
    "gender" "base"."Gender" NOT NULL,
    "pronoun" TEXT,
    "howDidYouMeetUs" TEXT,
    "instagramUser" TEXT,
    "healthProblems" TEXT,
    "medicalAdvice" TEXT,
    "painOrDiscomfort" TEXT,
    "canLeaveAlone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."StudentHistory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."StudentGuardian" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "cellPhoneNumber" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "StudentGuardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."Class" (
    "id" TEXT NOT NULL,
    "tenancyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "teacherId" TEXT NOT NULL,
    "assistantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."StudentClass" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "StudentClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."ClassDay" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "tenancy"."DayOfWeek" NOT NULL,
    "initialHour" TEXT NOT NULL,
    "endHour" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "ClassDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."ClassAttendance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSubstitute" BOOLEAN NOT NULL DEFAULT false,
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "ClassAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."AttendanceRecord" (
    "id" TEXT NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT false,
    "classAttendanceId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenancy"."Plan" (
    "id" TEXT NOT NULL,
    "tenancyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "type" "tenancy"."PlanType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "contractModelId" TEXT NOT NULL,
    "monthlyInterest" DOUBLE PRECISION NOT NULL,
    "finePercentage" DOUBLE PRECISION NOT NULL,
    "discountPercentage" DOUBLE PRECISION NOT NULL,
    "maximumDiscountPeriod" INTEGER NOT NULL,
    "maximumPaymentTerm" INTEGER NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."User" (
    "id" TEXT NOT NULL,
    "tenancyId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nickname" TEXT,
    "gender" "base"."Gender" NOT NULL,
    "pronoun" TEXT,
    "dateOfBirth" TEXT,
    "cellPhoneNumber" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "documentOfIdentity" TEXT,
    "role" "users"."UserRole" NOT NULL,
    "classes" "users"."UserRole"[],
    "user" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "users"."Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "users"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "contracts"."ContractModel" (
    "id" TEXT NOT NULL,
    "tenancyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,

    CONSTRAINT "ContractModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial"."Bill" (
    "id" TEXT NOT NULL,
    "type" "financial"."BillType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30),
    "amountPaid" DECIMAL(65,30),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "status" "financial"."BillStatus" NOT NULL,
    "installments" INTEGER NOT NULL DEFAULT 1,
    "recurrence" "financial"."RecurrenceType",
    "complement" TEXT,
    "studentId" TEXT,
    "supplierId" TEXT,
    "categoryId" TEXT,
    "paymentMethodId" TEXT,
    "bankId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial"."BillAttachment" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial"."Bank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "agency" TEXT,
    "account" TEXT,
    "description" TEXT,
    "maintenanceFeeAmount" DECIMAL(65,30),
    "maintenanceFeeDue" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial"."CategoryBill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nature" "financial"."BillNature" NOT NULL,
    "type" "financial"."BillCategoryType" NOT NULL,
    "parentId" TEXT,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial"."CategoryGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial"."PaymentMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "operator" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial"."PaymentFee" (
    "id" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "minInstallments" INTEGER NOT NULL DEFAULT 1,
    "maxInstallments" INTEGER NOT NULL DEFAULT 1,
    "feePercentage" DOUBLE PRECISION NOT NULL,
    "customerInterest" BOOLEAN NOT NULL DEFAULT false,
    "receiveInDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utils"."SecurityLog" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blocked" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT NOT NULL,
    "sessionId" TEXT,
    "headers" JSONB,

    CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utils"."BlockedIP" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BlockedIP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_studentId_key" ON "base"."Address"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_key" ON "base"."Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_supplierId_key" ON "base"."Address"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenancy_document_key" ON "tenancy"."Tenancy"("document");

-- CreateIndex
CREATE UNIQUE INDEX "Tenancy_email_key" ON "tenancy"."Tenancy"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentClass_studentId_classId_key" ON "tenancy"."StudentClass"("studentId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassDay_id_classId_key" ON "tenancy"."ClassDay"("id", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_classAttendanceId_studentId_key" ON "tenancy"."AttendanceRecord"("classAttendanceId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "users"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "users"."Session"("sessionToken");

-- CreateIndex
CREATE INDEX "SecurityLog_ipAddress_timestamp_idx" ON "utils"."SecurityLog"("ipAddress", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedIP_ipAddress_key" ON "utils"."BlockedIP"("ipAddress");

-- AddForeignKey
ALTER TABLE "base"."Address" ADD CONSTRAINT "Address_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "tenancy"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Address" ADD CONSTRAINT "Address_tenancyId_fkey" FOREIGN KEY ("tenancyId") REFERENCES "tenancy"."Tenancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Address" ADD CONSTRAINT "Address_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "base"."Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "base"."Supplier" ADD CONSTRAINT "Supplier_tenancyId_fkey" FOREIGN KEY ("tenancyId") REFERENCES "tenancy"."Tenancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."Student" ADD CONSTRAINT "Student_tenancyId_fkey" FOREIGN KEY ("tenancyId") REFERENCES "tenancy"."Tenancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."StudentHistory" ADD CONSTRAINT "StudentHistory_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "tenancy"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."StudentGuardian" ADD CONSTRAINT "StudentGuardian_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "tenancy"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."Class" ADD CONSTRAINT "Class_tenancyId_fkey" FOREIGN KEY ("tenancyId") REFERENCES "tenancy"."Tenancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."Class" ADD CONSTRAINT "Class_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "users"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."StudentClass" ADD CONSTRAINT "StudentClass_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "tenancy"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."StudentClass" ADD CONSTRAINT "StudentClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "tenancy"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."ClassDay" ADD CONSTRAINT "ClassDay_classId_fkey" FOREIGN KEY ("classId") REFERENCES "tenancy"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."ClassAttendance" ADD CONSTRAINT "ClassAttendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "tenancy"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."ClassAttendance" ADD CONSTRAINT "ClassAttendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_classAttendanceId_fkey" FOREIGN KEY ("classAttendanceId") REFERENCES "tenancy"."ClassAttendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "tenancy"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."Plan" ADD CONSTRAINT "Plan_tenancyId_fkey" FOREIGN KEY ("tenancyId") REFERENCES "tenancy"."Tenancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenancy"."Plan" ADD CONSTRAINT "Plan_contractModelId_fkey" FOREIGN KEY ("contractModelId") REFERENCES "contracts"."ContractModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."User" ADD CONSTRAINT "User_tenancyId_fkey" FOREIGN KEY ("tenancyId") REFERENCES "tenancy"."Tenancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts"."ContractModel" ADD CONSTRAINT "ContractModel_tenancyId_fkey" FOREIGN KEY ("tenancyId") REFERENCES "tenancy"."Tenancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."Bill" ADD CONSTRAINT "Bill_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "tenancy"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."Bill" ADD CONSTRAINT "Bill_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "base"."Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."Bill" ADD CONSTRAINT "Bill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "financial"."CategoryBill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."Bill" ADD CONSTRAINT "Bill_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "financial"."PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."Bill" ADD CONSTRAINT "Bill_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "financial"."Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."BillAttachment" ADD CONSTRAINT "BillAttachment_billId_fkey" FOREIGN KEY ("billId") REFERENCES "financial"."Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."CategoryBill" ADD CONSTRAINT "CategoryBill_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "financial"."CategoryBill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."CategoryBill" ADD CONSTRAINT "CategoryBill_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "financial"."CategoryGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."PaymentFee" ADD CONSTRAINT "PaymentFee_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "financial"."PaymentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
