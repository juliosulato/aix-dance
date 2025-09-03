/*
  Warnings:

  - You are about to drop the column `commissionPerStudent` on the `CommissionTier` table. All the data in the column will be lost.
  - You are about to drop the column `tableId` on the `CommissionTier` table. All the data in the column will be lost.
  - You are about to drop the column `commissionTableId` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the `CommissionTable` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `teacherId` to the `CommissionTier` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "users"."CommissionTier" DROP CONSTRAINT "CommissionTier_tableId_fkey";

-- DropForeignKey
ALTER TABLE "users"."Teacher" DROP CONSTRAINT "Teacher_commissionTableId_fkey";

-- AlterTable
ALTER TABLE "users"."CommissionTier" DROP COLUMN "commissionPerStudent",
DROP COLUMN "tableId",
ADD COLUMN     "teacherId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users"."Teacher" DROP COLUMN "commissionTableId";

-- DropTable
DROP TABLE "users"."CommissionTable";

-- AddForeignKey
ALTER TABLE "users"."CommissionTier" ADD CONSTRAINT "CommissionTier_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
