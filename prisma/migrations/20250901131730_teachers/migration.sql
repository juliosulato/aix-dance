/*
  Warnings:

  - You are about to drop the column `userId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `bonusPerAttendance` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `remunerationValue` on the `Teacher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teacherId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `baseAmount` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `document` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `observations` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentData` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Made the column `paymentDay` on table `Teacher` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `user` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "base"."Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropIndex
DROP INDEX "base"."Address_userId_key";

-- AlterTable
ALTER TABLE "base"."Address" DROP COLUMN "userId",
ADD COLUMN     "teacherId" TEXT;

-- AlterTable
ALTER TABLE "users"."Teacher" DROP COLUMN "bonusPerAttendance",
DROP COLUMN "remunerationValue",
ADD COLUMN     "baseAmount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "birthOfDate" TEXT,
ADD COLUMN     "bonusForPresenceAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cellPhoneNumber" TEXT,
ADD COLUMN     "commissionTableId" TEXT,
ADD COLUMN     "document" TEXT NOT NULL,
ADD COLUMN     "gender" "base"."Gender" NOT NULL,
ADD COLUMN     "instagramUser" TEXT,
ADD COLUMN     "loseBonusWhenAbsent" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "observations" TEXT NOT NULL,
ADD COLUMN     "paymentData" TEXT NOT NULL,
ADD COLUMN     "paymentMethodId" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "pronoun" TEXT,
ALTER COLUMN "paymentDay" SET NOT NULL,
ALTER COLUMN "paymentDay" SET DEFAULT 5;

-- AlterTable
ALTER TABLE "users"."User" ADD COLUMN     "image" TEXT,
ADD COLUMN     "user" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "users"."CommissionTable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."CommissionTier" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "minStudents" INTEGER NOT NULL,
    "maxStudents" INTEGER NOT NULL,
    "commissionPerStudent" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommissionTable_name_key" ON "users"."CommissionTable"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Address_teacherId_key" ON "base"."Address"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_key" ON "users"."User"("user");

-- AddForeignKey
ALTER TABLE "base"."Address" ADD CONSTRAINT "Address_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."Teacher" ADD CONSTRAINT "Teacher_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "financial"."PaymentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."Teacher" ADD CONSTRAINT "Teacher_commissionTableId_fkey" FOREIGN KEY ("commissionTableId") REFERENCES "users"."CommissionTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."CommissionTier" ADD CONSTRAINT "CommissionTier_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "users"."CommissionTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
