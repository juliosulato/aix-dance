/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `comission` to the `CommissionTier` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "users"."ResourceType" AS ENUM ('FINANCE', 'USER', 'COURSE', 'TEACHER');

-- CreateEnum
CREATE TYPE "users"."ActionType" AS ENUM ('VIEW', 'CREATE', 'EDIT', 'DELETE');

-- AlterTable
ALTER TABLE "users"."CommissionTier" ADD COLUMN     "comission" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "users"."User" DROP COLUMN "role";

-- CreateTable
CREATE TABLE "users"."Permission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resource" "users"."ResourceType" NOT NULL,
    "action" "users"."ActionType" NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users"."Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
